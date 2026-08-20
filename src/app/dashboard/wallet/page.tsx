"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  DollarSign,
  Copy,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import SendTransaction from "../../components/SendTransaction";
import ReceiveTransaction from "../../components/ReceiveTransaction";
import {
  formatAddress,
  readWalletState,
  initializeWalletData,
  debitWallet,
  creditWallet,
  persistWalletState,
  fetchAndSyncWallet,
  consumePendingReceiveEvent,
  WalletData,
} from "@/lib/walletService";
import { useAccount } from "@/lib/AccountContext";

export default function WalletPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [receiveSuccessNotice, setReceiveSuccessNotice] = useState<null | {
    amount: number;
    from: string;
    hash: string;
  }>(null);
  const [walletData, setWalletData] = useState<WalletData>({
    address: "",
    email: "",
    balance: 0,
    balanceUSD: 0,
    transactions: [],
    createdAt: "",
  });

  const { activeAccount } = useAccount();

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const toggleMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    localStorage.setItem("demoMode", String(newMode));

    if (newMode) {
      alert("Switched to Demo Mode - No real transactions will occur");
    } else {
      if (walletAddress) {
        alert("Switched to Real Mode - Transactions will use your actual wallet");
      } else {
        alert("No wallet connected. Please connect your wallet first. Staying in Demo Mode.");
        setIsDemoMode(true);
        localStorage.setItem("demoMode", "true");
      }
    }
  };

  // ─── Login check ──────────────────────────────────
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  // ─── Load wallet data when active account changes ─────
  useEffect(() => {
    if (!activeAccount) {router.push("/dashboard/accounts");
    return;}

    const address = activeAccount.address;
    setWalletAddress(address);

    const email = localStorage.getItem("userEmail") || "";
    const demoMode = localStorage.getItem("demoMode") === "true";
    setIsDemoMode(demoMode);

    const initialData = initializeWalletData(address, email);
    setWalletData(initialData);
    setIsLoading(true);

    fetchAndSyncWallet(address).then((synced) => {
      if (synced) setWalletData(synced);
      setIsLoading(false);
    });
  }, [activeAccount]);

  // ─── Poll server for live updates ─────────────────
  useEffect(() => {
    let mounted = true;
    let interval: any;
    const start = () => {
      if (!walletAddress) return;
      interval = setInterval(async () => {
        try {
          const synced = await fetchAndSyncWallet(walletAddress);
          if (synced && mounted) setWalletData(synced);
        } catch {}
      }, 3000);
    };
    if (!isLoading) start();
    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [walletAddress, isLoading]);

  // persist wallet state changes
  useEffect(() => {
    if (walletData.address) {
      persistWalletState(walletData.address, walletData);
    }
  }, [walletData]);

  // receive success notice listener
  useEffect(() => {
    if (!walletAddress) return;
    const handler = () => {
      const pending = consumePendingReceiveEvent(walletAddress);
      if (pending) {
        setReceiveSuccessNotice({
          amount: pending.amount,
          from: pending.from,
          hash: pending.hash,
        });
      }
    };
    handler();
    window.addEventListener("wallet-receive-success", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("wallet-receive-success", handler);
      window.removeEventListener("storage", handler);
    };
  }, [walletAddress]);

  useEffect(() => {
    if (!receiveSuccessNotice) return;
    const timer = window.setTimeout(() => setReceiveSuccessNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [receiveSuccessNotice]);

  const handleSendSuccess = async (txData: {
    hash: string;
    amount: number;
    recipient: string;
    type: "sent";
  }) => {
    setShowSendModal(false);

    const senderData = readWalletState(walletAddress) || walletData;
    if (!senderData) {
      router.push(
        `/dashboard/wallet/success?status=error&message=${encodeURIComponent(
          "Unable to find your wallet data. Please reload and try again."
        )}`
      );
      return;
    }

    if (senderData.balance < txData.amount) {
      router.push(
        `/dashboard/wallet/success?status=error&message=${encodeURIComponent(
          "Insufficient balance to complete this transaction."
        )}`
      );
      return;
    }

    const updatedSenderData = debitWallet(
      walletAddress,
      txData.amount,
      txData.recipient,
      txData.hash
    );
    if (!updatedSenderData) {
      router.push(
        `/dashboard/wallet/success?status=error&message=${encodeURIComponent(
          "Transaction could not be processed. Please try again."
        )}`
      );
      return;
    }

    creditWallet(txData.recipient, txData.amount, walletAddress, txData.hash);

    if (typeof window !== "undefined") {
      try {
        await fetch("/api/wallet/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: walletAddress,
            recipient: txData.recipient,
            amount: txData.amount,
            hash: txData.hash,
          }),
        });
      } catch (error) {
        console.error("server transfer sync failed", error);
      }
    }

    setWalletData(updatedSenderData);
    router.push(
      `/dashboard/wallet/success?amount=${encodeURIComponent(
        txData.amount.toString()
      )}&recipient=${encodeURIComponent(txData.recipient)}&hash=${encodeURIComponent(
        txData.hash
      )}&balance=${encodeURIComponent(
        updatedSenderData.balance.toFixed(2)
      )}&mode=${encodeURIComponent(isDemoMode ? "demo" : "live")}`
    );
  };

  const simulateReceive = () => {
    if (!walletAddress) {
      alert("No wallet address found. Please log in again.");
      return;
    }

    const amount = 50 + Math.random() * 100;
    const randomAddress =
      "0x" +
      Array.from({ length: 40 }, () =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("");
    const txHash =
      "0x" +
      Array.from({ length: 64 }, () =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("");

    const nextState = creditWallet(walletAddress, amount, randomAddress, txHash);
    setWalletData(nextState);
    setReceiveSuccessNotice({
      amount,
      from: randomAddress,
      hash: txHash,
    });
  };

  const openReceiveModal = () => {
    if (!walletAddress) {
      alert("No wallet address found. Please log in again.");
      return;
    }
    setShowReceiveModal(true);
  };

  const displayAddress = walletAddress ? formatAddress(walletAddress) : "Not connected";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {receiveSuccessNotice && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-green-800">Receive successful</p>
                <p className="text-sm text-green-700 mt-1">
                  +{receiveSuccessNotice.amount.toFixed(2)} RTC received from{" "}
                  {formatAddress(receiveSuccessNotice.from)}.
                </p>
              </div>
              <button
                onClick={() => setReceiveSuccessNotice(null)}
                className="text-sm font-medium text-green-700 hover:text-green-900"
              >
                Dismiss
              </button>
            </div>
          )}

          {isDemoMode && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Demo Mode Active</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  You're using a demo wallet. No real transactions will occur.
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Switch to Real Mode
                  </button>
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
              <p className="text-sm text-gray-500">
                {isDemoMode ? "Demo mode - No real transactions" : "Manage your funds and transactions"}
              </p>
              {walletData.email && (
                <p className="text-xs text-gray-400 mt-1">{walletData.email}</p>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3 flex-wrap">
              {isDemoMode && (
                <button
                  onClick={simulateReceive}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <ArrowDownLeft size={18} />
                  Simulate Receive
                </button>
              )}
            </div>
          </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Balance Card */}
            <div className={`rounded-2xl p-6 text-white shadow-lg ${
              isDemoMode ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-red-500 to-red-600"
            }`}>
              <div className="flex items-start justify-between">
                <p className="text-sm opacity-80">Total Balance</p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="opacity-80 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/20"
                >
                  {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              
              <div className="mt-2">
                <p className="text-3xl font-bold tracking-tight">
                  {showBalance ? `${walletData.balance.toFixed(2)} RTC` : <span className="tracking-[0.2em]">*****</span>}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {showBalance ? `≈ $ ${walletData.balanceUSD.toFixed(2)} USD` : <span className="tracking-[0.2em]">*****</span>}
                </p>
              </div>

              {isDemoMode && (
                <span className="inline-block mt-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  Demo
                </span>
              )}
            </div>

            {/* Available Balance Card - UPDATED with Eye Toggle */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-500">Available Balance</p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {showBalance ? `${walletData.balance.toFixed(2)} RTC` : <span className="tracking-[0.2em]">*****</span>}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {showBalance ? `≈ $ ${walletData.balanceUSD.toFixed(2)} USD` : <span className="tracking-[0.2em]">*****</span>}
              </p>
        
              <p className="text-xs text-gray-400 mt-2">
                Member since: {new Date(walletData.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 overflow-hidden">
  <p className="text-sm text-gray-500">Wallet Address</p>
  <div className="flex items-center gap-2 mt-2 min-w-0">
    <p className="text-sm font-mono text-gray-700 truncate min-w-0">{displayAddress}</p>
    <button onClick={copyAddress} className="p-1 hover:bg-gray-100 rounded transition flex-shrink-0">
      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
    </button>
  </div>
  <p className="text-xs text-gray-400 mt-1">Network: Ratel Chain</p>
</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <button
              onClick={openReceiveModal}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <ArrowDownLeft size={24} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">Receive</p>
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <ArrowUpRight size={24} className="text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">Send</p>
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/dashboard/swap")}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw size={24} className="text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">Swap</p>
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/dashboard/market")}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign size={24} className="text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">Buy</p>
            </button>
          </div>

<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">
        Balance: {walletData.balance.toFixed(2)} RTC
      </span>
    </div>
  </div>
  <div className="space-y-4 overflow-hidden">
    {walletData.transactions.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions yet</p>
      </div>
    ) : (
      walletData.transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              tx.type === "received" ? "bg-green-100" : "bg-red-100"
            }`}>
              {tx.type === "received" ? (
                <ArrowDownLeft size={18} className="text-green-600" />
              ) : (
                <ArrowUpRight size={18} className="text-red-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {tx.type === "received" ? "Received from" : "Sent to"} {formatAddress(tx.address || tx.to || tx.from || '')}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-500">{tx.date}</p>
                {tx.hash && (
                  <span className="text-xs text-gray-400 font-mono">
                    {tx.hash.slice(0, 10)}...
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-sm font-semibold ${
              tx.type === "received" ? "text-green-600" : "text-red-600"
            }`}>
              {tx.type === "received" ? "+" : "-"} {tx.amount.toFixed(2)} RTC
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              tx.status === "completed" ? "bg-green-100 text-green-700" : 
              tx.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {tx.status}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
</div>
            </div>
      </div>

      {showSendModal && (
        <SendTransaction
          onClose={() => setShowSendModal(false)}
          onSuccess={handleSendSuccess}
          isDemoMode={isDemoMode}
        />
      )}

      {showReceiveModal && (
        <ReceiveTransaction
          onClose={() => setShowReceiveModal(false)}
          address={walletAddress}
        />
      )}
    </>
  );
}