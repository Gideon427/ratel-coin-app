import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Using CoinGecko API (free, no API key needed)
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ratel-coin&vs_currencies=usd,ngn&include_24hr_change=true",
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (!response.ok) {
      throw new Error("Failed to fetch price");
    }

    const data = await response.json();
    return NextResponse.json({
      price: data["ratel-coin"]?.usd || 0.5087,
      change24h: data["ratel-coin"]?.usd_24h_change || 8.23,
      ngn: data["ratel-coin"]?.ngn || 797.32,
    });
  } catch (error) {
    console.error("Price fetch error:", error);
    // Return fallback data if API fails
    return NextResponse.json({
      price: 0.5087,
      change24h: 8.23,
      ngn: 797.32,
    });
  }
}