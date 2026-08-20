"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  ShoppingBag,
  MoreHorizontal,
} from "lucide-react";

const actions = [
  {
    title: "Send",
    icon: ArrowUpRight,
    href: "/dashboard/send",
    active: true,
  },
  {
    title: "Receive",
    icon: ArrowDownLeft,
    href: "/dashboard/receive",
  },
  {
    title: "Swap",
    icon: RefreshCcw,
    href: "/dashboard/swap",
  },
  {
    title: "Buy",
    icon: ShoppingBag,
    href: "/dashboard/market",
  },
  {
    title: "More",
    icon: MoreHorizontal,
    href: "/dashboard/more",
  },
];

export default function QuickActions() {
  const router = useRouter();

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  return (
    <section className="rounded-[32px] bg-white p-8 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Quick Actions
          </h2>

          <p className="mt-2 text-gray-500">
            Manage your wallet with one tap.
          </p>
        </div>

        <Link
          href="/dashboard/portfolio"
          className="rounded-full border border-red-100 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              onClick={() => handleActionClick(action.href)}
              className={`group relative w-full rounded-[28px] border p-7 text-left transition-all duration-300 ${
                action.active
                  ? "border-red-500 bg-red-50 shadow-lg shadow-red-100"
                  : "border-gray-200 bg-white hover:border-red-200 hover:shadow-lg"
              }`}
            >
              {/* Active Bar */}
              {action.active && (
                <div className="absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 rounded-full bg-red-600" />
              )}

              {/* Icon */}
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition ${
                  action.active
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                }`}
              >
                <Icon size={28} />
              </div>

              {/* Text */}
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {action.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {action.title === "Send" &&
                  "Transfer coins securely"}

                {action.title === "Receive" &&
                  "Generate wallet address"}

                {action.title === "Swap" &&
                  "Exchange assets"}

                {action.title === "Buy" &&
                  "Purchase RTC"}

                {action.title === "More" &&
                  "Additional services"}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}