import { NextResponse } from "next/server";
import { readWalletState } from "@/lib/walletService";

export async function GET() {
  try {
    // Get wallet data from localStorage via the API
    // Since we can't access localStorage in API routes directly,
    // we'll need to get the address from the request header or use a default.
    // For now, we'll return market overview with some dynamic data.
    
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/ratel-coin",
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch market data");
    }

    const data = await response.json();

    return NextResponse.json({
      marketCap: data.market_data?.market_cap?.usd || 45820000,
      circulatingSupply: data.market_data?.circulating_supply || 89540000,
      maxSupply: data.market_data?.max_supply || 100000000,
      ath: data.market_data?.ath?.usd || 0.6120,
      atl: data.market_data?.atl?.usd || 0.0312,
      rank: data.market_cap_rank || 218,
    });
  } catch (error) {
    console.error("Market data fetch error:", error);
    return NextResponse.json({
      marketCap: 45820000,
      circulatingSupply: 89540000,
      maxSupply: 100000000,
      ath: 0.6120,
      atl: 0.0312,
      rank: 218,
    });
  }
}