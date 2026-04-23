import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { Resend } from "resend";

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const INQUIRY_NOTIFICATION_EMAIL = defineSecret("INQUIRY_NOTIFICATION_EMAIL");
const INQUIRY_FROM_EMAIL = defineSecret("INQUIRY_FROM_EMAIL");

export const onInquiryCreated = onDocumentCreated(
  {
    document: "inquiries/{inquiryId}",
    secrets: [RESEND_API_KEY, INQUIRY_NOTIFICATION_EMAIL, INQUIRY_FROM_EMAIL],
    region: "europe-west1",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const resend = new Resend(RESEND_API_KEY.value());
    const to = INQUIRY_NOTIFICATION_EMAIL.value();
    const from = INQUIRY_FROM_EMAIL.value();

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
          <tr><td style="opacity:.6;">Dil</td><td>${escapeHtml(data.locale ?? "-")}</td></tr>
          <tr><td style="opacity:.6;">Varlık</td><td>${escapeHtml(data.propertyId ?? "-")}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#fff;border:1px solid #E8E2D8;border-radius:6px;">
          <div style="opacity:.6;font-size:12px;margin-bottom:6px;">Mesaj</div>
          <div style="white-space:pre-wrap;">${escapeHtml(data.message ?? "")}</div>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from,
        to,
        replyTo: data.email,
        subject,
        html,
      });
      logger.info("Inquiry email sent", { inquiryId: event.params.inquiryId });
    } catch (err) {
      logger.error("Failed to send inquiry email", err);
    }
  },
);

function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
