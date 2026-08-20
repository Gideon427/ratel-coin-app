"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const assets = [
  {
    name: "Ratel Coin",
    symbol: "RTC",
    balance: "9,450.50",
    value: "$18,720.35",
    change: "+8.42%",
    positive: true,
    image: "/images/ratel-coin.png",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.245",
    value: "$15,840.10",
    change: "+2.31%",
    positive: true,
    image: "/images/bitcoin.png",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    balance: "3.84",
    value: "$9,320.80",
    change: "-1.25%",
    positive: false,
    image: "/images/ethereum.png",
  },
  {
    name: "USDT",
    symbol: "USDT",
    balance: "2,500.00",
    value: "$2,500.00",
    change: "+0.01%",
    positive: true,
    image: "/images/usdt.png",
  },
];

export default function Assets() {
  return (
    <section className="rounded-[32px] bg-white p-8 shadow-[0_15px_45px_rgba(0,0,0,.05)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            My Assets
          </h2>

          <p className="mt-2 text-gray-500">
            Your cryptocurrency portfolio
          </p>
        </div>

        <Link
          href="/dashboard/portfolio"
          className="rounded-full border border-red-100 px-5 py-2 font-semibold text-red-600 hover:bg-red-50 transition"
        >
          View All
        </Link>
      </div>

      {/* Assets */}
      <div className="mt-8 space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between rounded-2xl border border-gray-100 p-5 transition hover:border-red-200 hover:shadow-lg"
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <Image
                  src={asset.image}
                  alt={asset.name}
                  width={42}
                  height={42}
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {asset.name}
                </h3>

                <p className="text-gray-500">
                  {asset.symbol}
                </p>
              </div>
            </div>

            {/* Middle */}
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-500">
                Balance
              </p>

              <h4 className="text-lg font-bold">
                {asset.balance}
              </h4>
            </div>

            {/* Right */}
            <div className="text-right">
              <h4 className="text-xl font-bold">
                {asset.value}
              </h4>

              <div
                className={`mt-2 flex items-center justify-end gap-1 text-sm font-semibold ${
                  asset.positive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {asset.positive ? (
                  <ArrowUpRight size={18} />
                ) : (
                  <ArrowDownRight size={18} />
                )}

                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Summary */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100">
              Total Portfolio Value
            </p>

            <h3 className="mt-2 text-4xl font-bold">
              $46,381.25
            </h3>
          </div>

          <div className="text-right">
            <p className="text-red-100">
              Today's Profit
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              +$2,845.70
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}