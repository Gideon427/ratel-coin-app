"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/AccountContext";
import {
  creditWallet,
  debitWallet,
  formatAddress,
  normalizeAddress,
  readWalletState,
  WalletData,
} from "@/lib/walletService";

export default function DashboardSendPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [recentRecipients, setRecentRecipients] = useState<Array<{ address: string; amount: number; date: string }>>([]);

  const deriveRecentRecipients = (data: WalletData | null) => {
    const sentTxs = (data?.transactions ?? [])
      .filter((tx) => tx.type === "sent")
      .slice(0, 3)
      .map((tx) => ({
        address: tx.address,
        amount: tx.amount,
        date: tx.date,
      }));

    setRecentRecipients(sentTxs);
  };

  useEffect(() => {
    if (!activeAccount?.address) return;

    const existingWallet = readWalletState(activeAccount.address);
    setWalletData(existingWallet);
    deriveRecentRecipients(existingWallet);
  }, [activeAccount]);

  const handleSend = () => {
    setError("");
    setStatus("");

    if (!activeAccount?.address) {
      setError("Please sign in to a wallet before sending.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount of RTC to send.");
      return;
    }

    if (!address || address.length < 10) {
      setError("Enter a valid crypto wallet address.");
      return;
    }

    const normalizedSender = normalizeAddress(activeAccount.address);
    const normalizedRecipient = normalizeAddress(address);
    if (normalizedSender && normalizedRecipient && normalizedSender === normalizedRecipient) {
      setError("You cannot send RTC to your own wallet address.");
      return;
    }

    const walletState = readWalletState(activeAccount.address) || walletData;
    if (!walletState) {
      setError("Unable to find your wallet state. Please reload and try again.");
      return;
    }

    if (walletState.balance < Number(amount)) {
      setError("Insufficient RTC balance to complete this send.");
      return;
    }

    const txHash = `0x${Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`;
    const updatedWallet = debitWallet(activeAccount.address, Number(amount), address, txHash);

    if (!updatedWallet) {
      setError("The send could not be completed. Please try again.");
      return;
    }

    creditWallet(address, Number(amount), activeAccount.address, txHash);
    setWalletData(updatedWallet);
    deriveRecentRecipients(updatedWallet);

    router.push(
      `/dashboard/wallet/success?amount=${encodeURIComponent(
        Number(amount).toFixed(2)
      )}&recipient=${encodeURIComponent(address)}&hash=${encodeURIComponent(
        txHash
      )}&balance=${encodeURIComponent(
        updatedWallet.balance.toFixed(2)
      )}&sender=${encodeURIComponent(activeAccount.address)}&mode=${encodeURIComponent("live")}`
    );

    setAmount("");
    setAddress("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[32px] sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:gap-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Send</p>
              <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">Send RTC</h1>
              <p className="mt-3 text-sm text-gray-600 sm:text-base">Send RTC securely to an external crypto wallet address. Only crypto wallet transfers are supported.</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
                  <p className="text-sm text-gray-500">Market pair</p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">RTC / USDT</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
                  <p className="text-sm text-gray-500">Network</p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">Ratel Chain</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
                  <p className="text-sm text-gray-500">Fee</p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">0.005 RTC</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
                  <p className="text-sm text-gray-500">Available balance</p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{walletData?.balance.toFixed(2) ?? "0.00"} RTC</p>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Recent recipients</h2>
              <div className="mt-5 space-y-4">
                {recentRecipients.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent recipients yet.</p>
                ) : (
                  recentRecipients.map((recipient, index) => (
                    <div key={`${recipient.address}-${index}`} className="rounded-3xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{formatAddress(recipient.address)}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-none">
  {recipient.address}
</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{recipient.amount.toFixed(2)} RTC</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-400">{recipient.date}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setAddress(recipient.address);
                            setAmount(recipient.amount.toFixed(2));
                            setError("");
                            setStatus("");
                          }}
                          className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>

          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6 lg:mt-10 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Transfer details</h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Amount (RTC)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-3xl border border-gray-300 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Destination wallet address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="w-full rounded-3xl border border-gray-300 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {status && <p className="mt-4 text-sm text-green-600">{status}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSend}
                className="w-full rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto sm:px-8 sm:py-4"
              >
                Send now
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/wallet/transactions")}
                className="w-full rounded-3xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600 sm:w-auto sm:px-8 sm:py-4"
              >
                View history
              </button>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Only send RTC to a compatible crypto wallet address. Bank and fiat transfers are not supported on this page.</p>
          </div>

          <div className="mt-6">
            <Link href="/dashboard" className="text-sm font-semibold text-red-600">Back to dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
