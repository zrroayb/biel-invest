import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminMatch = pathname.match(/^\/(?:(tr|en|de|ru)\/)?admin(?:\/(.*))?$/);

  if (adminMatch) {
    const subPath = adminMatch[2] ?? "";
    const isLoginRoute = subPath.startsWith("login");
    const session = request.cookies.get("__session")?.value;

    // Yerel/demo modu: Firebase yapılandırılmadıysa VE production değilsek admin
    // panele giriş olmadan izin ver (repo verisini önizlemek için). Canlıda
    // (production) bu bypass devre dışıdır; müşteri verisi asla açığa çıkmaz.
    const firebaseConfigured = Boolean(
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
        process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    );
    const localPreview =
      !firebaseConfigured && process.env.NODE_ENV !== "production";

    if (!session && !isLoginRoute && !localPreview) {
      const locale = adminMatch[1] ?? routing.defaultLocale;
      const loginUrl = new URL(
        locale === routing.defaultLocale
          ? "/admin/login"
          : `/${locale}/admin/login`,
        request.url,
      );
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
