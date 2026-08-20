"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Save, Wallet, BadgeCheck } from "lucide-react";
import { getActiveAccount } from "@/lib/authStorage";
import { formatAddress, readWalletState } from "@/lib/walletService";

const currencyOptions = ["RTC", "USD", "USDT", "EUR", "GBP", "NGN"];
const languageOptions = ["English", "French", "Spanish", "Portuguese"];
const networkOptions = ["Ratel Chain", "Ethereum", "Bitcoin"];

export default function PreferencesSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [prefs, setPrefs] = useState({
    language: "English",
    currency: "RTC",
    network: "Ratel Chain",
    autoSync: true,
  });

  useEffect(() => {
    const account = getActiveAccount();
    if (!account) {
      router.push("/login");
      return;
    }

    const savedPrefs = localStorage.getItem(`ratel_preferences_${account.id}`);
    if (savedPrefs) {
      setPrefs({ ...prefs, ...JSON.parse(savedPrefs) });
    }

    const wallet = readWalletState(account.walletAddress);
    setWalletBalance(wallet?.balance ?? 0);
    setWalletAddress(account.walletAddress);
    setIsLoading(false);
  }, [router]);

  // ✅ FIXED: safely extract `checked` only for checkbox inputs
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    // Only read `checked` if the target is a checkbox (HTMLInputElement)
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setPrefs((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = getActiveAccount();
    if (!account) return;

    localStorage.setItem(`ratel_preferences_${account.id}`, JSON.stringify(prefs));
    setStatus("Preferences updated using your live wallet profile.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Wallet size={16} className="text-red-600" />
            Wallet balance
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{walletBalance.toFixed(2)} RTC</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 p-5 min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <BadgeCheck size={16} className="text-red-600" />
            Active wallet
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white break-all min-w-0">
            {walletAddress ? formatAddress(walletAddress) : "No wallet linked"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe size={20} className="text-red-600" />
          Preferences
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <select
                name="language"
                value={prefs.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
              >
                {languageOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary currency
              </label>
              <select
                name="currency"
                value={prefs.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default network
              </label>
              <select
                name="network"
                value={prefs.network}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
              >
                {networkOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto-sync wallet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Refresh wallet state automatically</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="autoSync"
                  checked={prefs.autoSync}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {status && <p className="text-sm text-green-600 dark:text-green-400">{status}</p>}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm"
          >
            <Save size={18} />
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}