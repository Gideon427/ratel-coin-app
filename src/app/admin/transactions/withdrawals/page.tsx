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
      <h1 className="text-2xl font-bold text-gray-800">Withdrawals</h1>
      <p className="text-sm text-gray-500">Withdrawal activity derived from wallet records.</p>
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">Withdrawal count: {stats.totalWithdrawals}</p>
      </div>
    </>
  );
}
