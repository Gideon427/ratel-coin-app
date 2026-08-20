"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    TrendingUp,
    Bell,
    Plus,
    Minus,
    Download,
    Upload,
    ArrowRightLeft,
    ShoppingBag,
    Eye,
    EyeOff,
    Target,
    ChevronRight,
    Shield,
    User,
    MoreHorizontal,
    CheckCircle,
    type LucideIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAccount } from "@/lib/AccountContext";
import { getActiveAccount } from "@/lib/authStorage";
import {
    formatAddress,
    readWalletState,
    initializeWalletData,
    fetchAndSyncWallet,
    WalletData,
    SavingsData,
    initializeSavingsState,
    readSavingsState,
} from "@/lib/walletService";

const portfolioData = [
    { name: "Ratel Coin", value: 65, color: "#e63939" },
    { name: "Tech Solutions", value: 20, color: "#f77f00" },
    { name: "Stablecoins", value: 10, color: "#2a9d8f" },
    { name: "Other Assets", value: 5, color: "#6d597a" },
];

const marketData = [
    { name: "Ratel Coin (RTC)", price: "Live", change: "0.00%", up: true },
    { name: "USDT", price: "Live", change: "0.01%", up: false },
];

const notificationsList = [
    { title: "Your deposit was successful.", time: "2 min ago" },
    { title: "New login detected from Chrome on Windows.", time: "15 min ago" },
    { title: "You earned 10 RTC from Referral Bonus.", time: "1 hour ago" },
    { title: "RTC market feed updated.", time: "3 hours ago" },
];

const quickActions: Array<{ name: string; icon: LucideIcon; href: string }> = [
    { name: "Sell RTC", icon: Minus, href: "/dashboard/market/sell" },
    { name: "Deposit", icon: Download, href: "/dashboard/receive" },
    { name: "Withdraw", icon: Upload, href: "/dashboard/withdraw" },
    { name: "Transfer", icon: ArrowRightLeft, href: "/dashboard/send" },
    { name: "Shop", icon: ShoppingBag, href: "/dashboard/market" },
];

export default function DashboardPage() {
    const router = useRouter();
    const { activeAccount } = useAccount();
    const [isLoading, setIsLoading] = useState(true);
    const [showBalance, setShowBalance] = useState(true);
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [savingsData, setSavingsData] = useState<SavingsData | null>(null);

    useEffect(() => {
        const authAccount = getActiveAccount();
        if (!authAccount) {
            router.push("/login");
            return;
        }

        if (!activeAccount) {
            return;
        }

        const address = activeAccount.address;
        const initial = readWalletState(address) || initializeWalletData(address, activeAccount.name || authAccount.email, 0);
        setWalletData(initial);

        const savings = readSavingsState(address) || initializeSavingsState(address, 0, 2000);
        setSavingsData(savings);

        fetchAndSyncWallet(address).then((synced) => {
            if (synced) setWalletData(synced);
            setIsLoading(false);
        });
    }, [activeAccount, router]);

    const stats = useMemo(() => {
        if (!walletData) {
            return {
                assetsOwned: 0,
                recentProfit: 0,
                spentThisMonth: 0,
                savingsBalance: 0,
            };
        }

        const received = walletData.transactions
            .filter((tx) => tx.type === "received")
            .reduce((sum, tx) => sum + tx.amount, 0);

        const sent = walletData.transactions
            .filter((tx) => tx.type === "sent")
            .reduce((sum, tx) => sum + tx.amount, 0);

        return {
            assetsOwned: walletData.balance > 0 ? 1 : 0,
            recentProfit: Math.max(received - sent, 0),
            spentThisMonth: sent,
            savingsBalance: savingsData?.balance ?? 0,
        };
    }, [walletData, savingsData]);

    const recentTransactions = useMemo(() => {
        if (!walletData) return [];
        return walletData.transactions.slice(0, 5);
    }, [walletData]);

    if (isLoading || !walletData) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading wallet data…</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        Dashboard
                        <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                            Premium Account
                        </span>
                    </h1>
                    <p className="mt-1 text-gray-500 text-sm">
                        Welcome back, {activeAccount?.name || "Ratel user"}. Your wallet is synced with live data.
                    </p>
                </div>
            
            </div>

            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 lg:col-span-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-6 text-white relative">
                    <div className="flex items-start justify-between">
                        <p className="text-red-100 text-sm font-medium">Total Wallet Value</p>
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-red-100/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            aria-label="Toggle balance visibility"
                        >
                            {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                    </div>
                    <h2 className="mt-2 text-5xl font-black tracking-tight">
                        {showBalance ? (
                            <>{walletData.balance.toFixed(2)} <span className="text-3xl">RTC</span></>
                        ) : (
                            <span className="text-4xl tracking-[0.2em]">*****</span>
                        )}
                    </h2>
                    <p className="mt-1 text-xl">
                        {showBalance ? `≈ $${walletData.balanceUSD.toFixed(2)} USD` : <span className="tracking-[0.2em]">*****</span>}
                    </p>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="rounded-full bg-white/20 px-4 py-1.5 text-sm flex items-center gap-1.5 font-medium backdrop-blur-sm">
                            <TrendingUp className="w-4 h-4" /> {walletData.transactions.length} txs
                        </div>
                        <span className="text-red-100 text-sm">Live sync every 3s</span>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 p-6">
                    <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                    <div className="mt-5 grid grid-cols-3 gap-4">
                        {quickActions.slice(0, 5).map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => router.push(item.href)}
                                    className="flex flex-col items-center gap-2 rounded-xl p-3 transition group hover:bg-red-50"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition group-hover:bg-red-100">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">{item.name}</span>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/more")}
                            className="flex flex-col items-center gap-2 rounded-xl p-3 transition group hover:bg-red-50"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition group-hover:bg-red-100">
                                <MoreHorizontal className="h-7 w-7" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">More</span>
                        </button>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-2 p-6 flex flex-col justify-center bg-white rounded-2xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Ratel Coin Price</p>
                    <div className="mt-2 flex items-center gap-3">
                        <Image
                            src="/images/logo.png"
                            alt="Ratel Coin"
                            width={48}
                            height={48}
                            className="w-12 h-12 shrink-0"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">$1.00</h2>
                            <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" /> Flat
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
                {[
                    { title: "Assets Owned", value: `${stats.assetsOwned}`, sub: "View All", href: "/dashboard/wallet", subColor: "text-red-600" },
                    { title: "Recent Profit", value: `${stats.recentProfit.toFixed(2)} RTC`, sub: "Net gain", href: "/dashboard/wallet", subColor: "text-green-600" },
                    { title: "Spent This Month", value: `${stats.spentThisMonth.toFixed(2)} RTC`, sub: "Live spending", href: "/dashboard/wallet", subColor: "text-red-500" },
                    { title: "Balance USD", value: `$${walletData.balanceUSD.toFixed(2)}`, sub: "1 RTC = $1", href: "/dashboard/wallet", subColor: "text-green-600" },
                    { title: "Savings Balance", value: `${stats.savingsBalance.toFixed(2)} RTC`, sub: "View Savings", href: "/dashboard/savings", subColor: "text-red-600" },
                ].map((card, idx) => (
                    <div
                        key={idx}
                        className="group p-5 bg-white rounded-2xl shadow-sm border border-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.title}</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                        <div className="mt-4 flex items-center justify-between">
                            <p className={`text-sm font-semibold ${card.subColor}`}>{card.sub}</p>
                            {card.href ? (
                                <button
                                    type="button"
                                    onClick={() => router.push(card.href)}
                                    className="text-xs text-red-600 font-semibold hover:underline"
                                >
                                    View
                                </button>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-5 mt-5">
                <div className="col-span-12 lg:col-span-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Portfolio Overview</h3>
                        <button onClick={() => router.push("/dashboard/wallet")} className="text-xs text-red-600 font-medium hover:underline">View Wallet</button>
                    </div>
                    <div className="h-56 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={portfolioData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    dataKey="value"
                                    paddingAngle={2}
                                >
                                    {portfolioData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                        {portfolioData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                <span className="text-gray-600">{item.name}</span>
                                <span className="ml-auto font-semibold text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{walletData.balance.toFixed(2)} RTC</p>
                        <p className="text-sm text-gray-400">≈ ${walletData.balanceUSD.toFixed(2)} USD</p>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Wallet Insights</h3>
                        <button onClick={() => router.push("/dashboard/wallet")} className="text-xs text-red-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="mt-4 space-y-3">
                        {recentTransactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No transactions yet.</div>
                        ) : (
                            recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tx.type === "received" ? "bg-green-50" : "bg-red-50"} text-sm font-bold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>
                                            {tx.type === "received" ? "↓" : "↑"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {tx.type === "received" ? "Received from" : "Sent to"} {formatAddress(tx.address)}
                                            </p>
                                            <p className="text-xs text-gray-400">{tx.date}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-semibold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>
                                        {tx.type === "received" ? "+" : "-"} {tx.amount.toFixed(2)} RTC
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Market Trends</h3>
                        <button onClick={() => router.push("/dashboard/market")} className="text-xs text-red-600 font-medium hover:underline">View Market</button>
                    </div>
                    <div className="mt-4 space-y-3">
                        {marketData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{item.price}</p>
                                    <p className={`text-xs font-semibold ${item.up ? "text-green-600" : "text-red-500"}`}>
                                        {item.up ? "↑" : "↓"} {item.change}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => router.push("/dashboard/market")} className="mt-4 w-full rounded-xl bg-gray-50 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition border border-gray-200">
                        View All Markets
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5 mt-5">
                <div className="col-span-12 lg:col-span-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Savings Goal</h3>
                        <button onClick={() => router.push("/dashboard/savings")} className="text-xs text-red-600 font-medium hover:underline">View Savings</button>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Savings Goal</p>
                                <p className="text-xs text-gray-400">Goal: {savingsData?.goal.toFixed(2)} RTC</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{stats.savingsBalance.toFixed(2)} RTC</span>
                                <span className="text-gray-400">{Math.min(100, ((stats.savingsBalance / (savingsData?.goal || 1)) * 100)).toFixed(0)}%</span>
                            </div>
                            <div className="mt-1.5 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${Math.min(100, ((stats.savingsBalance / (savingsData?.goal || 1)) * 100))}%` }} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-400">Need {(savingsData ? Math.max(savingsData.goal - savingsData.balance, 0) : 0).toFixed(2)} RTC more to reach your goal</p>
                    </div>
                </div>
            </div>
        </>
    );
}
