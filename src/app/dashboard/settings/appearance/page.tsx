"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Palette, Moon, Sun, Save } from "lucide-react";
import { getActiveAccount } from "@/lib/authStorage";

function getAppearanceStorageKey(accountId?: string) {
  return accountId ? `ratel_appearance_${accountId}` : "dashboardDarkMode";
}

export default function AppearanceSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const account = getActiveAccount();
    if (!account) {
      router.push("/login");
      return;
    }

    const storageKey = getAppearanceStorageKey(account.id);
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      setDarkMode(saved === "true");
    } else {
      const legacyValue = localStorage.getItem("dashboardDarkMode");
      if (legacyValue !== null) {
        setDarkMode(legacyValue === "true");
      }
    }
    setIsLoading(false);
  }, [router]);

  const toggleDarkMode = () => {
    const account = getActiveAccount();
    const newMode = !darkMode;
    setDarkMode(newMode);

    const storageKey = getAppearanceStorageKey(account?.id);
    localStorage.setItem(storageKey, String(newMode));
    window.dispatchEvent(new Event("dashboard-dark-mode-changed"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = getActiveAccount();
    if (!account) return;

    localStorage.setItem(getAppearanceStorageKey(account.id), String(darkMode));
    setStatus("Appearance preferences saved for your active account.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Palette size={20} className="text-red-600" />
        Appearance
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-gray-500" /> : <Sun size={18} className="text-gray-500" />}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle the dashboard theme for the active session</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {status && <p className="text-sm text-green-600 dark:text-green-400">{status}</p>}

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm"
        >
          <Save size={18} />
          Save Appearance
        </button>
      </form>
    </div>
  );
}