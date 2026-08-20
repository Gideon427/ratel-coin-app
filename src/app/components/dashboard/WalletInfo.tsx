"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Copy,
  Check,
  ShieldCheck,
  Wifi,
  Calendar,
  QrCode,
} from "lucide-react";

export default function WalletInfo() {
  const [copied, setCopied] = useState(false);

  const walletAddress =
    "0x8A45...9F72D4A91BC4E712";

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      {/* Wallet Details */}
      <div className="rounded-[32px] bg-white p-8 shadow-[0_15px_45px_rgba(0,0,0,.05)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Wallet Information
            </h2>

            <p className="mt-2 text-gray-500">
              Your primary wallet details.
            </p>
          </div>

          <div className="rounded-full bg-green-50 px-5 py-2 text-sm font-semibold text-green-600">
            Active
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {/* Wallet Address */}
          <div className="rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Wallet Address
            </p>

            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-semibold text-lg break-all">
                {walletAddress}
              </h3>

              <button
                onClick={copyAddress}
                className="rounded-xl bg-red-50 p-3 text-red-600 hover:bg-red-100 transition"
              >
                {copied ? (
                  <Check size={20} />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-6">
              <div className="flex items-center gap-3">
                <Wifi
                  className="text-red-600"
                  size={22}
                />

                <span className="font-semibold">
                  Network
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold">
                Ratel Chain
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="text-green-600"
                  size={22}
                />

                <span className="font-semibold">
                  Security
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold text-green-600">
                Protected
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6">
              <div className="flex items-center gap-3">
                <Calendar
                  className="text-red-600"
                  size={22}
                />

                <span className="font-semibold">
                  Member Since
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold">
                Jan 2026
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="text-red-600"
                  size={22}
                />

                <span className="font-semibold">
                  Verification
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold text-red-600">
                Level 2
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Card */}
      <div className="rounded-[32px] bg-white p-8 shadow-[0_15px_45px_rgba(0,0,0,.05)]">
        <h2 className="text-2xl font-bold">
          Receive Payments
        </h2>

        <p className="mt-2 text-gray-500">
          Scan this QR code to receive RTC.
        </p>

        {/* QR Placeholder */}
        <div className="mt-8 flex justify-center">
          <div className="flex h-64 w-64 items-center justify-center rounded-3xl border-2 border-dashed border-red-200 bg-red-50">
            <QrCode
              size={120}
              className="text-red-600"
            />
          </div>
        </div>

        <Link
          href="/dashboard/wallet"
          className="mt-8 block w-full rounded-2xl bg-red-600 py-4 text-center text-lg font-semibold text-white hover:bg-red-700 transition"
        >
          Share Wallet
        </Link>

        <p className="mt-5 text-center text-sm text-gray-500">
          Last synchronized • Just now
        </p>
      </div>
    </section>
  );
}