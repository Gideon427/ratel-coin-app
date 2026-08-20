"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Smartphone,
  Key,
  Bell,
  Download,
  Trash2,
  LogOut,
  AlertTriangle,
  ChevronRight,
  User,
} from "lucide-react";
import { getActiveAccount, clearSession } from "@/lib/authStorage";

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    notificationsEnabled: true,
    devices: [
      { name: "Chrome on Windows", lastActive: "Today, 9:41 AM", current: true },
      { name: "Safari on iPhone", lastActive: "Yesterday, 8:15 PM", current: false },
    ],
  });

  useEffect(() => {
    const syncAccount = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      const account = getActiveAccount();
      if (account) {
        setUser({ email: account.email, username: account.username });
        setSecuritySettings((prev) => ({
          ...prev,
          twoFactorEnabled: account.twoFactorEnabled || false,
          notificationsEnabled: account.notificationsEnabled !== undefined ? account.notificationsEnabled : true,
        }));
        setIsLoading(false);
      } else {
        router.push("/login");
      }
    };

    syncAccount();
    window.addEventListener("auth-state-changed", syncAccount);
    window.addEventListener("storage", syncAccount);
    window.addEventListener("pageshow", syncAccount);
    return () => {
      window.removeEventListener("auth-state-changed", syncAccount);
      window.removeEventListener("storage", syncAccount);
      window.removeEventListener("pageshow", syncAccount);
    };
  }, [router]);

  // --- Change Password ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ text: "New password and confirmation do not match.", type: "error" });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setMessage({ text: "Password updated successfully!", type: "success" });
      setShowChangePassword(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Toggle 2FA ---
  const toggle2FA = async () => {
    setIsSubmitting(true);
    setMessage(null);
    const newState = !securitySettings.twoFactorEnabled;
    try {
      const res = await fetch("/api/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update 2FA");

      setSecuritySettings((prev) => ({ ...prev, twoFactorEnabled: newState }));
      setMessage({ text: data.message, type: "success" });
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Toggle Notifications ---
  const toggleNotifications = async () => {
    const newState = !securitySettings.notificationsEnabled;
    // We can persist this in localStorage for now (or via API)
    setSecuritySettings((prev) => ({ ...prev, notificationsEnabled: newState }));
    // Optionally save to user settings via API
  };

  // --- Delete Account ---
  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");

      // Clear client state and redirect
      clearSession();
      router.push("/");
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // --- Download Data ---
  const handleDownloadData = () => {
    // In a real app, this would trigger an email with a download link
    alert("Your account data will be prepared and emailed to you shortly.");
  };

  // --- Logout ---
  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Security
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your security settings and account preferences
        </p>
      </div>

      {/* ─── Message ────────────────────────────────────────── */}
      {message && (
        <div
          className={`p-4 rounded-xl mb-6 ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ─── Account Info (read‑only) ──────────────────────── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={20} className="text-red-600" />
              Account Details
            </h2>
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p><span className="font-medium">Username:</span> {user?.username}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
            </div>
          </div>
          <button
  onClick={() => router.push("/dashboard/profile")}
  className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
>
  Edit Profile <ChevronRight size={16} />
</button>
        </div>
      </div>

      {/* ─── Security Settings ────────────────────────────── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Shield size={20} className="text-red-600" />
          Security
        </h2>
        <div className="space-y-3">
          {/* Change Password */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Key size={18} />
                Change Password
              </span>
              <span className="text-sm text-red-600">Update</span>
            </button>
            {showChangePassword && (
              <form
                onSubmit={handlePasswordChange}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Two‑Factor Authentication */}
          <button
            onClick={toggle2FA}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Smartphone size={18} />
              Two‑Factor Authentication
            </span>
            <span
              className={`text-sm ${
                securitySettings.twoFactorEnabled
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {securitySettings.twoFactorEnabled ? "Enabled" : "Setup"}
            </span>
          </button>

          {/* Connected Devices */}
          <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Smartphone size={18} />
                Connected Devices
              </span>
              <span className="text-sm text-red-600">Manage</span>
            </div>
            <div className="mt-2 space-y-2">
              {securitySettings.devices.map((device, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
                >
                  <span>{device.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{device.lastActive}</span>
                    {device.current && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Notifications ─────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Bell size={20} className="text-red-600" />
          Security Notifications
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">
            Receive security alerts via email
          </span>
          <button
            onClick={toggleNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              securitySettings.notificationsEnabled
                ? "bg-red-600"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                securitySettings.notificationsEnabled
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ─── Data & Privacy ────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Download size={20} className="text-red-600" />
          Data & Privacy
        </h2>
        <button
          onClick={handleDownloadData}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Download size={18} />
            Download your account data
          </span>
          <span className="text-sm text-red-600">Request</span>
        </button>
      </div>

      {/* ─── Danger Zone ───────────────────────────────────── */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 p-6 mb-6">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={20} />
          Danger Zone
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          Once you delete your account, there is no going back. All your data,
          wallet, and transactions will be permanently removed.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-sm"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        ) : (
          <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Yes, delete my account"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Logout ────────────────────────────────────────── */}
      <div className="flex justify-end">
  <button
    onClick={() => setShowConfirm(true)}
    className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
  >
    <LogOut size={18} />
    Sign Out
  </button>
</div>
{showConfirm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 className="text-lg font-semibold">Confirm Sign Out</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Are you sure you want to sign out?
      </p>
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setShowConfirm(false);
            handleLogout();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
)}
)
    </div>
  );
}