import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createInquiry } from "@/lib/firestore/inquiries";
import { inquirySchema, type InquiryValidated } from "@/lib/validators";

// Keep the route on the Node.js runtime — firebase-admin + resend need Node
// APIs (crypto, streams). Edge runtime would break both.
export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const ipSubmissions = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = ipSubmissions.get(ip);
  if (!entry || entry.resetAt < now) {
    ipSubmissions.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Honeypot triggered → silently accept to not leak detection to bots.
  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { honeypot: _honeypot, ...data } = parsed.data;

  const inquiry = await createInquiry(data);

  // Fire-and-forget email notification. We deliberately don't await the
  // send failure so a Resend outage never blocks lead capture.
  void sendInquiryEmail(data).catch((err) => {
    console.error("[inquiry] email dispatch failed", err);
  });

  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
}

async function sendInquiryEmail(
  data: Omit<InquiryValidated, "honeypot">,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFICATION_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.warn(
      "[inquiry] Resend env vars missing — skipping email notification",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const subject = data.propertyId
    ? `Yeni başvuru · ${data.propertyId}`
    : "Yeni iletişim başvurusu";

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1C1C1C;background:#FAF7F2;">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px 0;">Yeni başvuru</h1>
      <table cellpadding="6" style="border-collapse:collapse;font-size:14px;">
        <tr><td style="opacity:.6;">Ad</td><td><strong>${escapeHtml(data.name)}</strong></td></tr>
        <tr><td style="opacity:.6;">E-posta</td><td>${escapeHtml(data.email)}</td></tr>
        <tr><td style="opacity:.6;">Telefon</td><td>${escapeHtml(data.phone ?? "-")}</td></tr>
        <tr><td style="opacity:.6;">Dil</td><td>${escapeHtml(data.locale)}</td></tr>
        <tr><td style="opacity:.6;">Varlık</td><td>${escapeHtml(data.propertyId ?? data.propertySlug ?? "-")}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#fff;border:1px solid #E8E2D8;border-radius:6px;">
        <div style="opacity:.6;font-size:12px;margin-bottom:6px;">Mesaj</div>
        <div style="white-space:pre-wrap;">${escapeHtml(data.message)}</div>
      </div>
    </div>
  `;

  await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject,
    html,
  });
}

function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
