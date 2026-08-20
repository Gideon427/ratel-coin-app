"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/AccountContext";
import { debitWallet, formatAddress, readWalletState, WalletData } from "@/lib/walletService";

export default function DashboardWithdrawPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [walletData, setWalletData] = useState<WalletData | null>(null);

  useEffect(() => {
    if (!activeAccount?.address) return;

    const existingWallet = readWalletState(activeAccount.address);
    setWalletData(existingWallet);
  }, [activeAccount]);

  const handleWithdraw = () => {
    setMessage("");
    setError("");

    if (!activeAccount?.address) {
      setError("Please sign in to a wallet before withdrawing.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid RTC amount.");
      return;
    }

    if (!address || address.length < 10) {
      setError("Please enter a valid wallet address.");
      return;
    }

    const walletState = readWalletState(activeAccount.address) || walletData;
    if (!walletState) {
      setError("Unable to find your wallet state. Please reload and try again.");
      return;
    }

    if (walletState.balance < Number(amount)) {
      setError("Insufficient RTC balance to complete this withdrawal.");
      return;
    }

    const txHash = `0x${Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`;
    const updatedWallet = debitWallet(activeAccount.address, Number(amount), address, txHash);

    if (!updatedWallet) {
      setError("The withdrawal could not be completed. Please try again.");
      return;
    }

    setWalletData(updatedWallet);
    setMessage(`Withdrew ${Number(amount).toFixed(2)} RTC to ${address}.`);
    setAmount("");
    setAddress("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[32px] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Withdraw</p>
              <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">Withdraw RTC</h1>
              <p className="mt-3 text-sm text-gray-600 sm:text-base">Withdraw RTC directly to an external crypto wallet address. Withdrawals are crypto wallet only.</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
              <p className="text-sm text-gray-500">Market pair</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">RTC / USDT</p>
              <p className="mt-1 text-sm text-gray-500">Ratel Chain withdrawals only.</p>
              <p className="mt-3 text-sm font-semibold text-gray-900">Available balance: {walletData?.balance.toFixed(2) ?? "0.00"} RTC</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
              <p className="text-sm text-gray-500">Network</p>
              <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">Ratel Chain</p>
              <p className="mt-2 text-sm text-gray-500">Crypto wallet withdrawals only.</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
              <p className="text-sm text-gray-500">Fee</p>
              <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">0.005 RTC</p>
              <p className="mt-2 text-sm text-gray-500">Fixed network fee.</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
              <p className="text-sm text-gray-500">Minimum</p>
              <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">10 RTC</p>
              <p className="mt-2 text-sm text-gray-500">Minimum withdraw amount.</p>
            </div>
          </div>

          <div className="mt-8 lg:mt-10">
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Withdrawal details</h2>
              <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Crypto-only withdrawals</h3>
                  <p className="mt-3 text-sm text-gray-600">
                    Withdrawals are only supported through external RTC-compatible wallets. Bank and fiat options are not available on this page.
                  </p>
                </div>
                <div className="rounded-3xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Security & limits</h3>
                  <ul className="mt-3 space-y-3 text-sm text-gray-600">
                    <li>• Two-factor authentication is required for large withdrawals.</li>
                    <li>• Minimum withdrawal amount is 10 RTC.</li>
                    <li>• Always verify the destination wallet address before sending.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900">Withdraw now</h3>
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
                {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleWithdraw}
                    className="w-full rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto sm:px-8 sm:py-4"
                  >
                    Withdraw now
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
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Withdrawals are only available to external RTC wallets. Transfers to bank accounts or stablecoin payouts are not supported here.</p>
          </div>

          <div className="mt-6">
            <Link href="/dashboard" className="text-sm font-semibold text-red-600">Back to dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}