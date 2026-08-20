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
      <h1 className="text-2xl font-bold text-gray-800">Support Center</h1>
      <p className="text-sm text-gray-500">Recent account activity from users who need support.</p>
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="flex justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm">
              <span>{user.email || user.name}</span>
              <span className="text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
          {users.length === 0 && <p className="text-sm text-gray-400">No support activity yet.</p>}
        </ul>
      </div>
    </>
  );
}
