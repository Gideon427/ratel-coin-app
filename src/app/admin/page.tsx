"use client";

import { useEffect, useState } from "react";
import { FaUsers, FaDollarSign, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";
import { getAllUserData, AdminStats } from "@/lib/adminService";

export default function AdminDashboard() {
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
    const refreshStats = () => setStats(getAllUserData());
    refreshStats();
    window.addEventListener("storage", refreshStats);
    window.addEventListener("auth-state-changed", refreshStats);

    return () => {
      window.removeEventListener("storage", refreshStats);
      window.removeEventListener("auth-state-changed", refreshStats);
    };
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers.toString(), icon: FaUsers, color: "bg-blue-500" },
    { title: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: FaDollarSign, color: "bg-green-500" },
    { title: "Transactions", value: stats.totalTransactions.toString(), icon: FaExchangeAlt, color: "bg-purple-500" },
    { title: "Security Alerts", value: "0", icon: FaShieldAlt, color: "bg-red-500" },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Overview of your platform activity</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg bg-white p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace("bg-", "text-")}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Recent Users</h3>
          <ul className="mt-4 divide-y divide-gray-100">
            {stats.recentUsers.length === 0 && (
              <li className="py-2 text-sm text-gray-400">No new users yet</li>
            )}
            {stats.recentUsers.map((user) => (
              <li key={user.id} className="py-2 flex justify-between text-sm">
                <span>{user.name || user.email || user.address}</span>
                <span className="text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
          <ul className="mt-4 divide-y divide-gray-100">
            {stats.recentTransactions.length === 0 && (
              <li className="py-2 text-sm text-gray-400">No recent transactions yet</li>
            )}
            {stats.recentTransactions.map((tx) => (
              <li key={tx.id} className="py-2 flex justify-between text-sm">
                <span>{tx.type}: ${tx.amount.toFixed(2)}</span>
                <span className="text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}