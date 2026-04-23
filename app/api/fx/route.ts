import { NextResponse } from "next/server";
import { getFxRatesForDisplay } from "@/lib/money/fx-rates";

/**
 * Cached FX for client-side price display (avoids blocking public layout on upstream fetch).
 */
export async function GET() {
  const rates = await getFxRatesForDisplay();
  return NextResponse.json(rates, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
