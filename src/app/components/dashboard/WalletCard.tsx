"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ChevronDown,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function WalletCard() {
  const [showBalance, setShowBalance] = useState(true);

  const balance = "12,540.50";
  const usd = "$24,850.30";

  return (
    <section className="overflow-hidden rounded-[34px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
      <div className="grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="p-8 lg:p-10">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="logo"
              width={58}
              height={58}
            />

            <h2 className="text-4xl font-bold">
              <span className="text-red-600">Ratel Coin</span>{" "}
              <span className="text-gray-900">Wallet</span>
            </h2>
          </div>

          {/* Balance Label */}
          <div className="mt-10 flex items-center gap-3">
            <p className="text-3xl text-gray-500">
              Total Balance
            </p>

            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-red-600"
            >
              {showBalance ? (
                <Eye size={24} />
              ) : (
                <EyeOff size={24} />
              )}
            </button>
          </div>

          {/* Balance */}
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <h1 className="text-6xl lg:text-7xl font-black tracking-tight">
              {showBalance ? balance : "••••••••"}
            </h1>

            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <Image
                src="/images/logo.png"
                alt=""
                width={24}
                height={24}
              />

              <span className="font-semibold">
                RTC
              </span>

              <ChevronDown size={18} />
            </button>
          </div>

          {/* USD */}
          <div className="mt-6 flex flex-wrap items-center gap-5 text-xl">
            <span className="text-gray-500">
              ≈ {showBalance ? usd : "********"}
            </span>

            <div className="flex items-center gap-2 font-semibold text-green-600">
              <TrendingUp size={20} />

              12.45%

              <span className="text-gray-500 font-normal">
                (24h)
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE *
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700">
          {/* Background Shapes */}

          <div className="absolute -right-16 -top-20 h-96 w-96 rounded-full bg-white/10"></div>

          <div className="absolute right-16 bottom-0 h-72 w-72 rounded-full bg-white/10"></div>

          <div className="absolute left-10 top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl"></div>

          {/* Badge */}

          <div className="absolute right-8 top-8">
            <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-xl">
              <ShieldCheck
                className="text-red-600"
                size={20}
              />

              <span className="font-semibold">
                Primary Wallet
              </span>
            </div>
          </div>

          {/* Coin */}

          <div className="flex h-full items-center justify-center py-14">
            <video
    autoPlay
    loop
    muted
    playsInline
    className="h-70 w-70 object-contain"
  >
    <source src="/videos/card.mp4" type="video/mp4" />
            </video>
            {/*<Image
              src="/images/coin.png"
              alt="coin"
              width={260}
              height={260}
              className="object-cover rounded-full w-70 h-70"
              //className="drop-shadow-[0_20px_50px_rgba(0,0,0,.35)]"
            />*/}
          </div>
        </div>
      
    </section>
  );
}