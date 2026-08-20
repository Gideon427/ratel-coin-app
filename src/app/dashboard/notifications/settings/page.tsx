"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Shield, ShoppingBag, Wallet, ToggleLeft, ToggleRight } from "lucide-react";
import { useAccount } from "@/lib/AccountContext";

type NotificationPreference = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
};

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "transactions",
      label: "Transaction Alerts",
      description: "Get notified when you send or receive funds",
      enabled: true,
      icon: <Wallet size={18} />,
    },
    {
      id: "security",
      label: "Security Alerts",
      description: "Login attempts, new devices, and security events",
      enabled: true,
      icon: <Shield size={18} />,
    },
    {
      id: "marketplace",
      label: "Marketplace Updates",
      description: "New sellers, product launches, and promotions",
      enabled: false,
      icon: <ShoppingBag size={18} />,
    },
    {
      id: "system",
      label: "System Notifications",
      description: "Low balance, rewards, and system updates",
      enabled: true,
      icon: <Bell size={18} />,
    },
  ]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notification_preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences((prev) =>
          prev.map((p) => ({
            ...p,
            enabled: parsed[p.id] !== undefined ? parsed[p.id] : p.enabled,
          }))
        );
      } catch (e) {}
    }
  }, []);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    // Save to localStorage
    const newPrefs: { [key: string]: boolean } = {};
    preferences.forEach((p) => {
      newPrefs[p.id] = p.id === id ? !p.enabled : p.enabled;
    });
    localStorage.setItem("notification_preferences", JSON.stringify(newPrefs));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/dashboard/notifications")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {preferences.map((pref) => (
            <div
              key={pref.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  {pref.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{pref.label}</p>
                  <p className="text-sm text-gray-500">{pref.description}</p>
                </div>
              </div>
              <button onClick={() => togglePreference(pref.id)} className="flex-shrink-0">
                {pref.enabled ? (
                  <ToggleRight className="h-6 w-6 text-red-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-300" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>Your preferences are saved locally. You can customize which notifications you see.</p>
        </div>
      </div>
    </div>
  );
}