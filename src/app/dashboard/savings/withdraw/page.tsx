"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAccount } from "@/lib/AccountContext";
import { createTransaction, initializeSavingsState, initializeWalletData, persistWalletState, readWalletState } from "@/lib/walletService";

interface SavingsPlan {
  id: string;
  name: string;
  type: "flexi" | "target" | "locked";
  goal: number;
  balance: number;
  rate: number;
  status: "active" | "completed" | "locked";
  createdAt: string;
  endDate?: string;
  lockedUntil?: string;
  autoSaveEnabled: boolean;
  frequency?: "Daily" | "Weekly" | "Monthly";
}

function getSavingsPlansKey(address: string) {
  return `savings_plans_${address}`;
}

function formatCurrency(value: number) {
  return value.toFixed(2);
}

export default function WithdrawPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const { activeAccount } = useAccount();
  const [walletData, setWalletData] = useState<any | null>(null);
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavingsPlan | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeAccount) {
      router.push("/dashboard/accounts");
      return;
    }
    const address = activeAccount.address;
    const wallet = readWalletState(address) || initializeWalletData(address, activeAccount.name || "user@example.com", 0);
    setWalletData(wallet);

    const savedPlans = typeof window !== "undefined" ? localStorage.getItem(getSavingsPlansKey(address)) : null;
    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans) as SavingsPlan[];
        setPlans(parsed);
        const plan = parsed.find((item) => item.id === planId) ?? parsed.find((item) => item.type === "flexi") ?? null;
        setSelectedPlan(plan);
      } catch {
        setPlans([]);
      }
    }
    setIsLoading(false);
  }, [activeAccount, planId, router]);

  const handleWithdraw = () => {
    if (!activeAccount || !walletData || !selectedPlan) return;
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }
    if (amountNum > selectedPlan.balance) {
      setMessage("Cannot withdraw more than plan balance.");
      return;
    }

    const updatedPlans = plans.map((plan) => (plan.id === selectedPlan.id ? { ...plan, balance: Number((plan.balance - amountNum).toFixed(2)) } : plan));
    const nextWallet = {
      ...walletData,
      balance: Number((walletData.balance + amountNum).toFixed(2)),
      balanceUSD: Number(((walletData.balance + amountNum) * 1).toFixed(2)),
      transactions: [createTransaction("received", amountNum, "Savings Withdrawal", `0x${Math.random().toString(16).slice(2, 12)}`), ...walletData.transactions],
    };

    localStorage.setItem(getSavingsPlansKey(activeAccount.address), JSON.stringify(updatedPlans));
    persistWalletState(activeAccount.address, nextWallet);
    setPlans(updatedPlans);
    setWalletData(nextWallet);
    setMessage(`₦${formatCurrency(amountNum)} sent to your wallet.`);
    setTimeout(() => router.push("/dashboard/savings"), 1200);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading withdrawal details…</p>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-gray-200 text-center">
          <p className="text-lg font-semibold text-gray-900">No flexi plan available</p>
          <p className="mt-3 text-sm text-gray-500">Create a flexi savings plan first or choose one from the savings page.</p>
          <button onClick={() => router.push("/dashboard/savings")} className="mt-6 rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition">Back to Savings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <button type="button" onClick={() => router.push("/dashboard/savings")} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Savings
        </button>
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-500">Withdraw funds</p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">{selectedPlan.name}</h1>
              <p className="mt-2 text-sm text-gray-500">Move funds from your flexi savings plan back into your wallet.</p>
            </div>
            <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{selectedPlan.type === "flexi" ? "Flexi Plan" : "Withdraw"}</div>
          </div>
          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(event: ChangeEvent<HTMLInputElement>) => setAmount(event.target.value)} className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <input value={reason} onChange={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)} className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" placeholder="Optional" />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            <button onClick={handleWithdraw} className="w-full rounded-3xl bg-red-600 px-6 py-4 text-white font-semibold hover:bg-red-700 transition">Withdraw</button>
          </div>
        </div>
      </div>
    </div>
  );
}
