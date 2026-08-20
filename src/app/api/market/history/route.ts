import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get("days") || "7";
  const vs_currency = searchParams.get("vs_currency") || "usd";

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/ratel-coin/market_chart?vs_currency=${vs_currency}&days=${days}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chart data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chart data fetch error:", error);
    // Return fallback data
    const now = Date.now();
    const fallbackData = {
      prices: Array.from({ length: 30 }, (_, i) => [
        now - (29 - i) * 86400000,
        0.45 + Math.random() * 0.12,
      ]),
    };
    return NextResponse.json(fallbackData);
  }
}