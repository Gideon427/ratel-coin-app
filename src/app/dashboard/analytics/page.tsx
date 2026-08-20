"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { readWalletState, readSavingsState, WalletData, SavingsData, Transaction } from "@/lib/walletService";
import { useAccount } from "@/lib/AccountContext";

const marketTabs = [
  { name: "Overview", href: "/dashboard/market" },
  { name: "Portfolio", href: "/dashboard/portfolio" },
  { name: "Analytics", href: "/dashboard/analytics" },
  { name: "Reports", href: "/dashboard/analytics/reports" },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function compute24hChange(transactions: Transaction[]): number {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return transactions.reduce((sum, tx) => {
    const txDate = new Date(tx.date);
    if (txDate >= dayAgo && txDate <= now) {
      return sum + (tx.type === "received" ? tx.amount : -tx.amount);
    }
    return sum;
  }, 0);
}

function computeTotals(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, tx) => {
      if (tx.type === "received") acc.received += tx.amount;
      else acc.sent += tx.amount;
      return acc;
    },
    { received: 0, sent: 0 }
  );
}

function groupByMonth(transactions: Transaction[]) {
  const months: Record<string, number> = {};
  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months[key] = (months[key] || 0) + (tx.type === "received" ? tx.amount : -tx.amount);
  });
  return Object.entries(months)
    .map(([month, net]) => ({ month, net }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export default function AnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeAccount } = useAccount();

  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7d");
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [price, setPrice] = useState(1);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!activeAccount) {
      setIsLoading(false);
      return;
    }

    const wallet = readWalletState(activeAccount.address);
    setWalletData(wallet || null);
    const savings = readSavingsState(activeAccount.address);
    setSavingsData(savings);
    setPrice(1);
    setIsLoading(false);
  }, [activeAccount, router]);

  const stats = useMemo(() => {
    if (!walletData) {
      return {
        totalValue: 0,
        totalValueUSD: 0,
        change24h: 0,
        totalTransactions: 0,
        avgTransaction: 0,
        receivedTotal: 0,
        sentTotal: 0,
        balance: 0,
        balanceUSD: 0,
        receivedCount: 0,
        sentCount: 0,
      };
    }

    const txs = walletData.transactions;
    const totalTransactions = txs.length;
    const receivedTotal = txs.filter((tx) => tx.type === "received").reduce((sum, tx) => sum + tx.amount, 0);
    const sentTotal = txs.filter((tx) => tx.type === "sent").reduce((sum, tx) => sum + tx.amount, 0);
    const avgTransaction = totalTransactions > 0 ? (receivedTotal + sentTotal) / totalTransactions : 0;
    const change24h = compute24hChange(txs);

    return {
      totalValue: walletData.balance,
      totalValueUSD: walletData.balanceUSD,
      change24h,
      totalTransactions,
      avgTransaction,
      receivedTotal,
      sentTotal,
      balance: walletData.balance,
      balanceUSD: walletData.balanceUSD,
      receivedCount: txs.filter((tx) => tx.type === "received").length,
      sentCount: txs.filter((tx) => tx.type === "sent").length,
    };
  }, [walletData]);

  const priceChartData = useMemo(() => {
    if (!walletData) return [];
    const sorted = [...walletData.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    const points: { date: string; balance: number }[] = [];
    sorted.forEach((tx) => {
      runningBalance += tx.type === "received" ? tx.amount : -tx.amount;
      points.push({ date: formatDate(tx.date), balance: runningBalance });
    });
    if (points.length === 0) {
      points.push({ date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), balance: walletData.balance });
    }
    const now = new Date();
    let daysAgo = 7;
    if (timeframe === "30d") daysAgo = 30;
    else if (timeframe === "90d") daysAgo = 90;
    else if (timeframe === "1y") daysAgo = 365;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return points.filter((point) => new Date(point.date) >= cutoff);
  }, [walletData, timeframe]);

  const distributionData = useMemo(() => {
    if (!walletData) return [];
    const { received, sent } = computeTotals(walletData.transactions);
    return [
      { name: "Received", value: received },
      { name: "Sent", value: sent },
    ];
  }, [walletData]);

  const monthlyData = useMemo(() => {
    if (!walletData) return [];
    return groupByMonth(walletData.transactions);
  }, [walletData]);

  const savingsProgress = useMemo(() => {
    if (!savingsData) return 0;
    return Math.min(100, Math.round((savingsData.balance / Math.max(savingsData.goal, 1)) * 100));
  }, [savingsData]);

  const savingsChartData = useMemo(() => {
    if (!savingsData) return [];
    const remaining = Math.max(savingsData.goal - savingsData.balance, 0);
    return [
      { name: "Saved", value: savingsData.balance },
      { name: "Remaining", value: remaining },
    ];
  }, [savingsData]);

  const COLORS = ["#22c55e", "#dc2626"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Wallet size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-4">No wallet data found. Please connect your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 min-w-max">
            {marketTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-white"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your combined portfolio and analytics view.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <div className="flex bg-white dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              {['7d', '30d', '90d', '1y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${
                    timeframe === period
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
              <PieChart size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${stats.totalValueUSD.toFixed(2)} USD</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stats.totalValue.toFixed(2)} RTC</p>
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">24h Change</p>
              {stats.change24h >= 0 ? <TrendingUp size={20} className="text-green-600" /> : <TrendingDown size={20} className="text-red-600" />}
            </div>
            <p className={`text-2xl font-bold mt-2 ${stats.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.change24h >= 0 ? '+' : ''}{stats.change24h.toFixed(2)} RTC
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 24 hours</p>
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg: {stats.avgTransaction.toFixed(2)} RTC</p>
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Activity</p>
              <Calendar size={20} className="text-orange-600" />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-sm text-green-600">Received</p>
                <p className="text-lg font-bold text-green-600">{stats.receivedTotal.toFixed(2)} RTC</p>
              </div>
              <div>
                <p className="text-sm text-red-600">Sent</p>
                <p className="text-lg font-bold text-red-600">{stats.sentTotal.toFixed(2)} RTC</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Balance Over Time</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your wallet balance history for the selected period.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Live market view</span>
            </div>
            <div className="h-[360px]">
              {priceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                      formatter={(value) => (typeof value === "number" ? `${value.toFixed(2)} RTC` : "")}
                    />
                    <Line type="monotone" dataKey="balance" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No transactions to display</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Portfolio Distribution</h2>
            <div className="h-[360px] flex items-center justify-center">
              {distributionData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => (typeof value === "number" ? `${value.toFixed(2)} RTC` : "")} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400">
                  <PieChart size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="mt-2">No data to display</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Net Activity</h2>
            <div className="h-64">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => (typeof value === "number" ? `${value.toFixed(2)} RTC` : "")} />
                    <Bar dataKey="net" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No monthly data available.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Savings Progress</h2>
            {savingsData ? (
              <>
                <div className="rounded-3xl bg-gray-50 dark:bg-[#111827] p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Goal</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{savingsData.goal.toFixed(2)} RTC</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saved {savingsData.balance.toFixed(2)} RTC</p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{savingsProgress}%</span>
                  </div>
                  <div className="mt-2 h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-pink-500" style={{ width: `${savingsProgress}%` }} />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-gray-50 dark:bg-[#111827] p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Saved</p>
                    <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{savingsData.balance.toFixed(2)} RTC</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 dark:bg-[#111827] p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{Math.max(savingsData.goal - savingsData.balance, 0).toFixed(2)} RTC</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">No savings data available.</div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
