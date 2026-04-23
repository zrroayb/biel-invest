import { NextRequest, NextResponse } from "next/server";

// Some browsers/devtools still request /favicon.ico directly even when
// metadata icons are declared. Redirect it to the brand SVG favicon.
export function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/brand/biel-invest.svg", request.url),
    { status: 308 },
  );
}
