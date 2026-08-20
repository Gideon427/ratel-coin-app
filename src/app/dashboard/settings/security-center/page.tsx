"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  AlertCircle,
  Smartphone,
  Clock,
  Lock,
  Key,
  Fingerprint,
  Mail,
  FileText,
  ChevronRight,
} from "lucide-react";
import { getActiveAccount } from "@/lib/authStorage";
import { formatAddress } from "@/lib/walletService";

export default function SecurityCenterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [accountData, setAccountData] = useState<{
    email: string;
    walletAddress: string;
    twoFactorEnabled?: boolean;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    const account = getActiveAccount();
    if (!account) {
      router.push("/login");
      return;
    }

    setAccountData({
      email: account.email,
      walletAddress: account.walletAddress,
      twoFactorEnabled: account.twoFactorEnabled,
      createdAt: account.createdAt,
    });
    setIsLoading(false);
  }, [router]);

  const score = accountData?.walletAddress && accountData.twoFactorEnabled ? "Excellent" : "Good";
  const walletVerified = Boolean(accountData?.walletAddress);
  const emailVerified = Boolean(accountData?.email);
  const twoFactor = Boolean(accountData?.twoFactorEnabled);
  const sessionDevice = typeof navigator !== "undefined" ? navigator.userAgent : "Current device";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const essentials = [
    {
      icon: Lock,
      label: "Password",
      description: "Strong password is set for the active account",
      status: "Active",
      color: "red",
    },
    {
      icon: Fingerprint,
      label: "Biometric Authentication",
      description: "Device-level security is enabled in this browser",
      status: "Supported",
      color: "red",
    },
    {
      icon: Key,
      label: "Two-Factor Authentication",
      description: twoFactor ? "Authenticator protection is enabled" : "Enable 2FA for stronger account protection",
      status: twoFactor ? "Enabled" : "Pending",
      color: twoFactor ? "red" : "amber",
    },
    {
      icon: Mail,
      label: "Recovery Email",
      description: emailVerified ? accountData?.email : "No verified recovery email found",
      status: emailVerified ? "Verified" : "Missing",
      color: emailVerified ? "red" : "amber",
    },
    {
      icon: FileText,
      label: "Wallet Address",
      description: walletVerified ? formatAddress(accountData?.walletAddress || "") : "No wallet address linked",
      status: walletVerified ? "Linked" : "Unlinked",
      color: walletVerified ? "red" : "amber",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Center</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Protect your live Ratel Coin wallet and account</p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 dark:bg-red-900/40 rounded-full p-3">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security Score</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">{score}</span>
                <span className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-3 py-0.5 rounded-full">
                  {walletVerified && twoFactor ? "Strong Protection" : "Review pending"}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Your security status is based on the current signed-in account and wallet configuration.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition whitespace-nowrap">
            View Recommendations <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Security Essentials</h3>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {essentials.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2.5">
                  <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.color === "red"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Current Session</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2.5">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Device</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{sessionDevice}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2.5">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Signed in</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{accountData?.createdAt ? new Date(accountData.createdAt).toLocaleString() : "Unavailable"}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
              Verified
            </span>
          </div>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security Tips</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Keep your Ratel Coin assets protected using the live security settings from your signed-in account.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2"><span className="text-red-600 dark:text-red-400">•</span>Enable 2FA for all wallet-approved actions.</li>
              <li className="flex items-start gap-2"><span className="text-red-600 dark:text-red-400">•</span>Keep your wallet address linked and verified.</li>
              <li className="flex items-start gap-2"><span className="text-red-600 dark:text-red-400">•</span>Review device security whenever switching browsers.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}