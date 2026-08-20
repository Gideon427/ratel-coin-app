"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Mail, MessageSquare, Save } from "lucide-react";
import { getActiveAccount, updateUserSettings } from "@/lib/authStorage";

export default function NotificationsSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notifs, setNotifs] = useState({
    email: true,
    push: true,
    sms: false,
  });

  useEffect(() => {
    const account = getActiveAccount();
    if (!account) {
      router.push("/login");
      return;
    }

    const saved = localStorage.getItem(`ratel_notifications_${account.id}`);
    if (saved) {
      setNotifs(JSON.parse(saved));
    }

    setIsLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifs((current) => ({ ...current, [e.target.name]: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = getActiveAccount();
    if (!account) return;

    localStorage.setItem(`ratel_notifications_${account.id}`, JSON.stringify(notifs));
    updateUserSettings(account.id, {
      notificationsEnabled: notifs.email || notifs.push || notifs.sms,
    });
    setStatus("Notification settings synced to your active account.");
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
        <Bell size={20} className="text-red-600" />
        Notification Preferences
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive transfer and security updates through email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="email"
              checked={notifs.email}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <MessageSquare size={18} className="text-gray-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In-app alerts for wallet and market updates</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="push"
              checked={notifs.push}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-gray-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">SMS Alerts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Critical wallet activity reminders</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="sms"
              checked={notifs.sms}
              onChange={handleChange}
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
          Save Preferences
        </button>
      </form>
    </div>
  );
}