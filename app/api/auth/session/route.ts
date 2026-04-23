import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE, createSessionCookie } from "@/lib/auth/session";

const FIVE_DAYS_SECONDS = 60 * 60 * 24 * 5;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDoc = await adminDb
      .collection("admins")
      .doc(decoded.uid)
      .get();

    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: "Not authorized as admin" },
        { status: 403 },
      );
    }

    const sessionCookie = await createSessionCookie(idToken);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      maxAge: FIVE_DAYS_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    maxAge: 0,
    httpOnly: true,
    path: "/",
  });
  return response;
}
