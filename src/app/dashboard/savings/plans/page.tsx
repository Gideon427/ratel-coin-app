"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAccount } from "@/lib/AccountContext";
import { initializeSavingsState, initializeWalletData, readSavingsState, readWalletState } from "@/lib/walletService";

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

export default function SavingsPlansPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeAccount) {
      router.push("/dashboard/accounts");
      return;
    }

    const address = activeAccount.address;
    readWalletState(address) || initializeWalletData(address, activeAccount.name || "user@example.com", 0);
    readSavingsState(address) || initializeSavingsState(address, 0, 0);
    const saved = typeof window !== "undefined" ? localStorage.getItem(getSavingsPlansKey(address)) : null;
    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch {
        setPlans([]);
      }
    }
    setIsLoading(false);
  }, [activeAccount, router]);

  const hasPlans = useMemo(() => plans.length > 0, [plans]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading plans…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Savings Plans</h1>
            <p className="mt-2 text-sm text-gray-500">All of your active savings plans in one place.</p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard/savings")} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
            <ChevronRight className="h-4 w-4" />
            Back to Savings
          </button>
        </div>

        {hasPlans ? (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">{plan.type}</p>
                    <h2 className="mt-2 text-xl font-bold text-gray-900">{plan.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">{plan.type === "locked" ? `Locked until ${plan.lockedUntil ? new Date(plan.lockedUntil).toLocaleDateString() : "TBD"}` : plan.frequency ? `${plan.frequency} plan` : "Flexi plan"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">Fund Plan</button>
                    <button type="button" className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">Manage</button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-900">Current balance</p>
                    <p className="mt-1">{formatCurrency(plan.balance)} RTC</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Target amount</p>
                    <p className="mt-1">{formatCurrency(plan.goal)} RTC</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">No savings plans found. Create one from the Savings dashboard.</div>
        )}
      </div>
    </div>
  );
}
