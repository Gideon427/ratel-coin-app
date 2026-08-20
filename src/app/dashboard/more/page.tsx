"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  BarChart3,
  Headphones,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";

const moreActions: Array<{ title: string; href: string; icon: LucideIcon }> = [
  { title: "Buy", href: "/dashboard/market/buy", icon: ShoppingBag },
  { title: "Send", href: "/dashboard/send", icon: ArrowUpRight },
  { title: "Receive", href: "/dashboard/receive", icon: ArrowDownLeft },
  { title: "Swap", href: "/dashboard/swap", icon: RefreshCcw },
  { title: "Portfolio", href: "/dashboard/portfolio", icon: BarChart3 },
  { title: "Support", href: "/dashboard/support", icon: Headphones },
];

export default function DashboardMorePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-red-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">More quick actions</h1>
          <p className="mt-3 text-gray-600">Open the extra wallet actions from here.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moreActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center transition hover:border-red-200 hover:bg-red-50"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-gray-900">{action.title}</h2>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
