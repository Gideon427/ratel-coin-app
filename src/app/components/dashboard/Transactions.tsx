"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCcw,
  ShoppingCart,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

const transactions = [
  {
    id: "#TX-982341",
    title: "Received Ratel Coin",
    subtitle: "From: 0x8A45...91BC",
    amount: "+350 RTC",
    usd: "+$693.20",
    status: "Completed",
    time: "2 mins ago",
    icon: ArrowDownLeft,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    amountColor: "text-green-600",
  },
  {
    id: "#TX-982340",
    title: "Sent Ratel Coin",
    subtitle: "To: 0xC82F...A1B7",
    amount: "-120 RTC",
    usd: "-$237.60",
    status: "Completed",
    time: "18 mins ago",
    icon: ArrowUpRight,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    amountColor: "text-red-600",
  },
  {
    id: "#TX-982339",
    title: "Swap BTC → RTC",
    subtitle: "Bitcoin to Ratel",
    amount: "+840 RTC",
    usd: "$1,664.80",
    status: "Pending",
    time: "1 hour ago",
    icon: RefreshCcw,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    amountColor: "text-gray-900",
  },
  {
    id: "#TX-982338",
    title: "Buy Ratel Coin",
    subtitle: "Visa **** 4821",
    amount: "+500 RTC",
    usd: "$990.00",
    status: "Completed",
    time: "Yesterday",
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    amountColor: "text-green-600",
  },
  {
    id: "#TX-982337",
    title: "Withdrawal",
    subtitle: "External Wallet",
    amount: "-50 RTC",
    usd: "-$99.00",
    status: "Failed",
    time: "Yesterday",
    icon: ArrowUpRight,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    amountColor: "text-red-600",
  },
];

export default function Transactions() {
  return (
    <section className="rounded-[32px] bg-white p-8 shadow-[0_15px_45px_rgba(0,0,0,.05)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Recent Transactions
          </h2>

          <p className="mt-2 text-gray-500">
            Latest activity on your wallet
          </p>
        </div>

        <Link
          href="/dashboard/order-history"
          className="rounded-full border border-red-100 px-5 py-2 font-semibold text-red-600 hover:bg-red-50 transition"
        >
          View History
        </Link>
      </div>

      {/* List */}
      <div className="mt-8 space-y-5">
        {transactions.map((tx) => {
          const Icon = tx.icon;

          return (
            <div
              key={tx.id}
              className="rounded-2xl border border-gray-100 p-5 transition hover:border-red-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tx.iconBg}`}
                  >
                    <Icon
                      size={26}
                      className={tx.iconColor}
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {tx.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {tx.subtitle}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {tx.id}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right">
                  <h3
                    className={`text-lg font-bold ${tx.amountColor}`}
                  >
                    {tx.amount}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {tx.usd}
                  </p>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    {tx.status === "Completed" && (
                      <>
                        <CheckCircle2
                          size={16}
                          className="text-green-600"
                        />
                        <span className="text-sm font-medium text-green-600">
                          Completed
                        </span>
                      </>
                    )}

                    {tx.status === "Pending" && (
                      <>
                        <Clock3
                          size={16}
                          className="text-yellow-600"
                        />
                        <span className="text-sm font-medium text-yellow-600">
                          Pending
                        </span>
                      </>
                    )}

                    {tx.status === "Failed" && (
                      <>
                        <XCircle
                          size={16}
                          className="text-red-600"
                        />
                        <span className="text-sm font-medium text-red-600">
                          Failed
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {tx.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}