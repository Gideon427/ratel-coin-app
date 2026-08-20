"use client";

import { useEffect, useMemo, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Lock,
  Wallet,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAccount } from "@/lib/AccountContext";
import {
  createTransaction,
  fetchAndSyncWallet,
  formatAddress,
  initializeSavingsState,
  initializeWalletData,
  persistSavingsState,
  persistWalletState,
  readSavingsState,
  readWalletState,
  WalletData,
  SavingsData,
} from "@/lib/walletService";

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

type PlanStep = "choose" | "setup" | "confirm";

const SAVINGS_PLAN_TYPES = [
  {
    type: "flexi" as const,
    title: "Flexi Savings",
    description: "Save and withdraw anytime. 9% returns.",
    icon: Wallet,
  },
  {
    type: "target" as const,
    title: "Target Savings",
    description: "Save to a goal with daily reminders. 11% returns.",
    icon: Target,
  },
  {
    type: "locked" as const,
    title: "Locked Savings",
    description: "Lock funds for a fixed tenure. 14% returns.",
    icon: Lock,
  },
];

function getSavingsPlansKey(address: string) {
  return `savings_plans_${address}`;
}

function formatCurrency(value: number) {
  return value.toFixed(2);
}

function formatPlanType(type: SavingsPlan["type"]) {
  if (type === "flexi") return "Flexi";
  if (type === "target") return "Target";
  return "Locked";
}

export default function SavingsPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<PlanStep>("choose");
  const [createType, setCreateType] = useState<SavingsPlan["type"] | null>(null);
  const [planName, setPlanName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [endDate, setEndDate] = useState("");
  const [lockAmount, setLockAmount] = useState("");
  const [lockDuration, setLockDuration] = useState(90);
  const [depositAmount, setDepositAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [actionPlanId, setActionPlanId] = useState<string | null>(null);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  useEffect(() => {
    if (!activeAccount) {
      router.push("/dashboard/accounts");
      return;
    }

    const address = activeAccount.address;
    const wallet = readWalletState(address) || initializeWalletData(address, activeAccount.name || "user@example.com", 0);
    setWalletData(wallet);

    const savings = readSavingsState(address) || initializeSavingsState(address, 0, 0);
    setSavingsData(savings);

    const savedPlans = typeof window !== "undefined" ? localStorage.getItem(getSavingsPlansKey(address)) : null;
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch {
        setPlans([]);
      }
    }

    fetchAndSyncWallet(address).then((synced) => {
      if (synced) setWalletData(synced);
      setIsLoading(false);
    });
  }, [activeAccount, router]);

  useEffect(() => {
    if (!activeAccount) return;
    localStorage.setItem(getSavingsPlansKey(activeAccount.address), JSON.stringify(plans));

    const aggregated = {
      address: activeAccount.address,
      balance: plans.reduce((sum, plan) => sum + plan.balance, 0),
      goal: plans.reduce((sum, plan) => sum + plan.goal, 0),
      updatedAt: new Date().toISOString(),
    };

    persistSavingsState(activeAccount.address, aggregated);
    setSavingsData(aggregated);
  }, [plans, activeAccount]);

  const totalBalance = useMemo(() => plans.reduce((sum, plan) => sum + plan.balance, 0), [plans]);
  const totalGoal = useMemo(() => plans.reduce((sum, plan) => sum + plan.goal, 0), [plans]);
  const overallProgress = useMemo(
    () => (totalGoal ? Math.min(100, Math.round((totalBalance / totalGoal) * 100)) : 0),
    [totalBalance, totalGoal]
  );
  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId]
  );
  const hasFlexi = useMemo(() => plans.some((plan) => plan.type === "flexi" && plan.balance > 0), [plans]);

  const resetCreateModal = () => {
    setShowCreateModal(true);
    setCreateStep("choose");
    setCreateType(null);
    setPlanName("");
    setGoalAmount("");
    setFrequency("Monthly");
    setEndDate("");
    setLockAmount("");
    setLockDuration(90);
    setMessage(null);
  };

  const updateWalletBalance = (amount: number, type: "sent" | "received", source: string) => {
    if (!activeAccount || !walletData) return;

    const nextBalance = Number((type === "sent" ? walletData.balance - amount : walletData.balance + amount).toFixed(2));
    const nextWallet: WalletData = {
      ...walletData,
      balance: nextBalance,
      balanceUSD: Number((nextBalance * 1).toFixed(2)),
      transactions: [
        createTransaction(type, amount, source, `0x${Math.random().toString(16).slice(2, 12)}`),
        ...walletData.transactions,
      ],
    };
    persistWalletState(activeAccount.address, nextWallet);
    setWalletData(nextWallet);
  };

  const handleFundPlan = (planId: string) => {
    if (!walletData) return;
    const plan = plans.find((item) => item.id === planId);
    const amount = Number(depositAmount);
    if (!plan || Number.isNaN(amount) || amount <= 0) {
      setMessage("Enter a valid deposit amount.");
      return;
    }
    if (amount > walletData.balance) {
      setMessage("Insufficient wallet balance.");
      return;
    }

    setPlans((prev) =>
      prev.map((item) => (item.id === planId ? { ...item, balance: Number((item.balance + amount).toFixed(2)) } : item))
    );
    updateWalletBalance(amount, "sent", "Savings Plan");
    setDepositAmount("");
    setMessage(`Funded ${formatCurrency(amount)} RTC to ${plan.name}.`);
  };

  const handleCreatePlan = () => {
    if (!createType) return;
    const id = `plan_${Date.now()}`;
    const baseName = createType === "flexi" ? "Flexi Plan" : createType === "target" ? "Target Plan" : "Locked Plan";
    const newPlan: SavingsPlan = {
      id,
      name: planName.trim() || baseName,
      type: createType,
      goal: createType === "locked" ? Number(lockAmount) : Number(goalAmount),
      balance: 0,
      rate: createType === "flexi" ? 9 : createType === "target" ? 11 : 14,
      status: "active",
      createdAt: new Date().toISOString(),
      endDate: createType === "locked" ? new Date(Date.now() + lockDuration * 24 * 60 * 60 * 1000).toISOString() : endDate,
      lockedUntil: createType === "locked" ? new Date(Date.now() + lockDuration * 24 * 60 * 60 * 1000).toISOString() : undefined,
      autoSaveEnabled: createType !== "locked",
      frequency: createType === "target" ? frequency : undefined,
    };
    setPlans((prev) => [newPlan, ...prev]);
    setSelectedPlanId(id);
    setShowCreateModal(false);
    setMessage(`${formatPlanType(createType)} plan created.`);
  };

  const handleClosePlan = (planId: string) => {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    const penalty = plan.type === "locked" ? 0.05 : 0;
    const returned = Number((plan.balance * (1 - penalty)).toFixed(2));
    setPlans((prev) => prev.filter((item) => item.id !== planId));
    if (returned > 0) updateWalletBalance(returned, "received", "Closed Savings Plan");
    setMessage(`Plan closed${penalty ? ", 5% penalty applied" : ""}. ${formatCurrency(returned)} RTC returned.`);
  };

  const handleEditPlan = (planId: string) => {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    setEditPlanId(plan.id);
    setEditName(plan.name);
    setEditEndDate(plan.endDate ?? "");
    setActionPlanId(null);
  };

  const savePlanEdit = () => {
    if (!editPlanId) return;
    setPlans((prev) =>
      prev.map((item) =>
        item.id === editPlanId ? { ...item, name: editName.trim() || item.name, endDate: editEndDate || item.endDate } : item
      )
    );
    setEditPlanId(null);
    setMessage("Plan updated.");
  };

  const activeDisplayPlan = activePlan ?? plans[0] ?? null;

  if (!activeAccount) {
    return null;
  }

  if (isLoading || !walletData || !savingsData) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading savings data…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">Savings</p>
            <h1 className="mt-3 text-4xl font-black text-gray-900">Ratel Coin Savings</h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">Create plans, fund them from wallet balance, and withdraw from flexi savings.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowBalance((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showBalance ? "Hide balance" : "Show balance"}
            </button>
            <button
              type="button"
              onClick={resetCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Available Wallet</p>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-4xl font-black text-gray-900">{showBalance ? formatCurrency(walletData.balance) : "••••"}</p>
              <span className="text-lg font-semibold text-gray-500">RTC</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">Use this balance to fund your savings plans.</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Total saved</p>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-4xl font-black text-gray-900">{showBalance ? formatCurrency(totalBalance) : "••••"}</p>
              <span className="text-lg font-semibold text-gray-500">RTC</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">All active savings plans combined.</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Goal coverage</p>
            <div className="mt-4 flex items-center gap-3">
              <p className="text-4xl font-black text-gray-900">{overallProgress}%</p>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-pink-500" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">Aggregate goal progress across plans.</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick actions</h2>
              <p className="mt-1 text-sm text-gray-500">Fast access to plan creation, wallet top-up, and flexi withdraw.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={resetCreateModal}
                className="rounded-3xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-900 hover:border-red-300 hover:bg-red-50 transition"
              >
                Create Plan
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/wallet")}
                className="rounded-3xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-900 hover:border-red-300 hover:bg-red-50 transition"
              >
                Fund Wallet
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/savings/withdraw?planId=")}
                className="rounded-3xl bg-red-600 px-5 py-4 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Savings plans</h2>
              <p className="mt-1 text-sm text-gray-500">Your savings plans are stored locally for this wallet.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/savings/plans")}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              View all plans
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {plans.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                No plans yet. Create one to start saving.
              </div>
            ) : (
              plans.map((plan) => {
                const progress = plan.goal ? Math.min(100, Math.round((plan.balance / plan.goal) * 100)) : 0;
                return (
                  <div key={plan.id} className="rounded-3xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">{formatPlanType(plan.type)} plan</p>
                        <h3 className="mt-2 text-xl font-semibold text-gray-900">{plan.name}</h3>
                      </div>
                      <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-700">
                        {plan.type}
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Balance</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(plan.balance)} RTC</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Goal</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(plan.goal)} RTC</span>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-pink-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          setMessage("Enter deposit amount below and press Fund.");
                        }}
                        className="rounded-3xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                      >
                        Fund
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionPlanId(plan.id)}
                        className="rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Selected plan</h2>
          <p className="mt-1 text-sm text-gray-500">Fund the active plan with wallet balance.</p>

          {activeDisplayPlan ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-gray-50 p-6">
                <p className="text-sm text-gray-500">Plan name</p>
                <p className="mt-2 text-xl font-semibold text-gray-900">{activeDisplayPlan.name}</p>
                <p className="mt-3 text-sm text-gray-500">{activeDisplayPlan.type === "locked" ? `Locked until ${activeDisplayPlan.lockedUntil ? new Date(activeDisplayPlan.lockedUntil).toLocaleDateString() : "TBD"}` : activeDisplayPlan.frequency ? `${activeDisplayPlan.frequency} savings` : "Flexi savings plan"}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-900">Balance</p>
                    <p className="mt-1">{formatCurrency(activeDisplayPlan.balance)} RTC</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Goal</p>
                    <p className="mt-1">{formatCurrency(activeDisplayPlan.goal)} RTC</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl bg-white p-6 border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={depositAmount}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDepositAmount(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-base outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => activeDisplayPlan && handleFundPlan(activeDisplayPlan.id)}
                  className="w-full rounded-3xl bg-red-600 px-6 py-4 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Fund selected plan
                </button>
                {message && <p className="text-sm text-green-600">{message}</p>}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">Select a plan to manage it.</div>
          )}
        </div>
      </div>

      {actionPlanId && (
        <div className="fixed inset-0 z-50 bg-black/40 px-4 py-6 sm:px-6" onClick={() => setActionPlanId(null)}>
          <div className="absolute inset-x-4 bottom-6 rounded-3xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-sm font-semibold text-gray-900">Plan actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanId(actionPlanId);
                  setActionPlanId(null);
                }}
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Select plan
              </button>
              <button
                type="button"
                onClick={() => {
                  const plan = plans.find((item) => item.id === actionPlanId);
                  if (plan?.type === "flexi") {
                    router.push(`/dashboard/savings/withdraw?planId=${actionPlanId}`);
                  }
                }}
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Withdraw from flexi
              </button>
              <button
                type="button"
                onClick={() => handleEditPlan(actionPlanId)}
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Edit plan
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClosePlan(actionPlanId);
                  setActionPlanId(null);
                }}
                className="w-full rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Close plan
              </button>
            </div>
          </div>
        </div>
      )}

      {editPlanId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Plan</h2>
                <p className="mt-1 text-sm text-gray-500">Rename the plan or update the end date.</p>
              </div>
              <button onClick={() => setEditPlanId(null)} className="rounded-full bg-gray-100 p-3 text-gray-600 hover:bg-gray-200">✕</button>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan name</label>
                <input
                  value={editName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setEditName(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End date</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setEditEndDate(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={savePlanEdit}
                  className="flex-1 rounded-3xl bg-red-600 px-6 py-4 text-white font-semibold hover:bg-red-700 transition"
                >
                  Save changes
                </button>
                <button
                  onClick={() => setEditPlanId(null)}
                  className="flex-1 rounded-3xl border border-gray-200 bg-white px-6 py-4 text-gray-900 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Savings Plan</h2>
                <p className="mt-1 text-sm text-gray-500">Choose your plan type and define the goal.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full bg-gray-100 p-3 text-gray-600 hover:bg-gray-200">✕</button>
            </div>

            {createStep === "choose" && (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {SAVINGS_PLAN_TYPES.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => {
                        setCreateType(option.type);
                        setCreateStep("setup");
                      }}
                      className="rounded-3xl border border-gray-200 p-6 text-left hover:border-red-300 hover:shadow-lg"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-50 text-red-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-gray-900">{option.title}</h3>
                      <p className="mt-2 text-sm text-gray-500">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {createStep === "setup" && createType === "flexi" && (
              <form
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  handleCreatePlan();
                }}
                className="mt-8 space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan name</label>
                  <input
                    value={planName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setPlanName(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="Flexible savings"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={goalAmount}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setGoalAmount(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-3xl bg-red-600 px-6 py-4 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Create Flexi Plan
                </button>
              </form>
            )}

            {createStep === "setup" && createType === "target" && (
              <form
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  handleCreatePlan();
                }}
                className="mt-8 space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan name</label>
                  <input
                    value={planName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setPlanName(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="Vacation fund"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={goalAmount}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setGoalAmount(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setFrequency(event.target.value as "Daily" | "Weekly" | "Monthly")}
                    className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setEndDate(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-3xl bg-red-600 px-6 py-4 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Create Target Plan
                </button>
              </form>
            )}

            {createStep === "setup" && createType === "locked" && (
              <form
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  handleCreatePlan();
                }}
                className="mt-8 space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lock amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={lockAmount}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setLockAmount(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-4 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lock duration</label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[30, 60, 90, 180].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setLockDuration(days)}
                        className={`rounded-3xl border px-4 py-4 text-left ${lockDuration === days ? "border-red-600 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-700"}`}
                      >
                        <p className="font-semibold">{days} days</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-3xl bg-red-600 px-6 py-4 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Create Locked Plan
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
              <button type="button" onClick={() => setCreateStep("choose")} className="font-semibold text-red-600 hover:text-red-700">
                Back
              </button>
              <button type="button" onClick={() => setShowCreateModal(false)} className="font-semibold text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
