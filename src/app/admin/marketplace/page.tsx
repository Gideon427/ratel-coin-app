"use client";

import { useEffect, useState } from "react";
import { getAllUserData, UserData } from "@/lib/adminService";

export default function Page() {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const refresh = () => setUsers(getAllUserData().users);
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
      <h1 className="text-2xl font-bold text-gray-800">Marketplace Management</h1>
      <p className="text-sm text-gray-500">Users currently active in the wallet marketplace.</p>
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
              <div>
                <p className="font-medium text-gray-800">{user.name || user.email || user.address}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className="text-sm font-medium text-green-600">Wallet active</span>
            </li>
          ))}
          {users.length === 0 && <p className="text-sm text-gray-400">No marketplace activity yet.</p>}
        </ul>
      </div>
    </>
  );
}
