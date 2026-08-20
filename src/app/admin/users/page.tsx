"use client";

import { useEffect, useState } from "react";
import { getAllUserData, toggleAccountDisabled, UserData } from "@/lib/adminService";

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const data = getAllUserData();
    setUsers(data.users);
  }, []);

  function handleToggle(userId: string, disabled: boolean) {
    toggleAccountDisabled(userId, disabled);
    const data = getAllUserData();
    setUsers(data.users);
  }
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      <p className="text-sm text-gray-500 mb-4">View and manage all registered users.</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{user.password || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(user.address).slice(0,6)}...{String(user.address).slice(-4)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.balanceUSD.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.disabled ? (<span className="text-sm text-red-600">Disabled</span>) : (<span className="text-sm text-green-600">Active</span>)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.disabled ? (
                      <button className="text-green-600 hover:text-green-800" onClick={() => handleToggle(user.id, false)}>Activate</button>
                    ) : (
                      <button className="text-red-600 hover:text-red-800" onClick={() => handleToggle(user.id, true)}>Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400 text-sm">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}