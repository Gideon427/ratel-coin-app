"use client";

import { TrendingUp, PieChart, Coins } from "lucide-react";

export default function WalletStats() {
  const cards = [
    {
      icon: TrendingUp,
      title: "24H Change",
      value: "+$2,750.45",
      sub: "12.45%",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: PieChart,
      title: "Portfolio Value",
      value: "$24,850.30",
      sub: "100%",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      icon: Coins,
      title: "Available Balance",
      value: "9,450.50 RTC",
      sub: "≈ $18,720.10",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <section>
      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[28px] bg-white border border-red-100 p-7 shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(239,68,68,0.12)] transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${card.bg}`}
                >
                  <Icon className={card.color} size={30} />
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    {card.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-gray-900">
                    {card.value}
                  </h3>

                  <p
                    className={`mt-2 text-lg font-semibold ${card.color}`}
                  >
                    {card.sub}
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