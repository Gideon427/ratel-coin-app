"use client";

import { useEffect, useState } from "react";
import { getAllUserData, AdminStats } from "@/lib/adminService";

export default function Page() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    users: [],
    recentUsers: [],
    recentTransactions: [],
  });

  useEffect(() => {
    const refresh = () => setStats(getAllUserData());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("auth-state-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("auth-state-changed", refresh);
    };
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800">Revenue & Analytics</h1>
      <p className="text-sm text-gray-500">Live balance and transaction metrics from registered users.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Deposits</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalDeposits}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Withdrawals</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalWithdrawals}</p>
        </div>
      </div>
    </>
  );
}
