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
      <h1 className="text-2xl font-bold text-gray-800">Security Center</h1>
      <p className="text-sm text-gray-500">Security posture based on active user accounts and wallet activity.</p>
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">Active registered accounts: {stats.totalUsers}</p>
        <p className="mt-2 text-gray-600">Recent transactions tracked: {stats.totalTransactions}</p>
      </div>
    </>
  );
}
