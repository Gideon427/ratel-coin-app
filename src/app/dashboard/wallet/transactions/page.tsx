"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Calendar,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  X,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatAddress, readWalletState, WalletData, Transaction } from "@/lib/walletService";
import { useAccount } from "@/lib/AccountContext";
import { TransactionReceipt } from "@/app/components/TransactionReceipt";

type FilterType = "all" | "received" | "sent" | "swap";
type DateRange = "today" | "yesterday" | "week" | "month" | "custom";

export default function TransactionsPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();

  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Transaction detail modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!activeAccount) {
      setLoading(false);
      return;
    }
    const address = activeAccount.address;
    const data = readWalletState(address);
    if (data) {
      setWalletData(data);
    } else {
      setWalletData(null);
    }
    setLoading(false);
  }, [activeAccount]);

  // Stats
  const stats = useMemo(() => {
    if (!walletData) return { total: 0, received: 0, sent: 0, net: 0 };
    const total = walletData.transactions.length;
    const received = walletData.transactions
      .filter((tx) => tx.type === "received")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const sent = walletData.transactions
      .filter((tx) => tx.type === "sent")
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { total, received, sent, net: received - sent };
  }, [walletData]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!walletData) return [];

    let txs = [...walletData.transactions];

    if (typeFilter === "received") {
      txs = txs.filter((tx) => tx.type === "received");
    } else if (typeFilter === "sent") {
      txs = txs.filter((tx) => tx.type === "sent");
    } else if (typeFilter === "swap") {
      txs = [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      txs = txs.filter((tx) => {
        const address = tx.address || "";
        return address.toLowerCase().includes(q);
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(today);
    monthStart.setMonth(monthStart.getMonth() - 1);

    txs = txs.filter((tx) => {
      const txDate = new Date(tx.date);
      if (dateRange === "today") return txDate >= today;
      if (dateRange === "yesterday") return txDate >= yesterday && txDate < today;
      if (dateRange === "week") return txDate >= weekStart;
      if (dateRange === "month") return txDate >= monthStart;
      if (dateRange === "custom" && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return txDate >= start && txDate <= end;
      }
      return true;
    });

    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return txs;
  }, [walletData, typeFilter, searchQuery, dateRange, customStart, customEnd]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof filteredTransactions } = {};
    filteredTransactions.forEach((tx) => {
      const dateObj = new Date(tx.date);
      const today = new Date();
      const todayStr = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let label = "";
      if (dateObj.toDateString() === todayStr) {
        label = "Today";
      } else if (dateObj.toDateString() === yesterdayStr) {
        label = "Yesterday – " + dateObj.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      } else {
        label = dateObj.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  // ─── PDF Generation ──────────────────────────────────────────
  const generatePDF = async () => {
    if (!receiptRef.current || !selectedTx || !walletData) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`transaction-${selectedTx.id}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No wallet data found. Please log in.</p>
          <button
            onClick={() => router.push("/dashboard/wallet")}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Go to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-sm text-gray-500">View and manage all your transactions</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Back to Wallet
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  typeFilter === "all"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Transactions
              </button>
              <button
                onClick={() => setTypeFilter("received")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  typeFilter === "received"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Received
              </button>
              <button
                onClick={() => setTypeFilter("sent")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  typeFilter === "sent"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setTypeFilter("swap")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  typeFilter === "swap"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Buy / Sell
              </button>
            </div>
          </div>

          {/* Date range picker */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <Calendar size={18} className="text-gray-400" />
            <button
              onClick={() => setDateRange("today")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                dateRange === "today"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange("yesterday")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                dateRange === "yesterday"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateRange("week")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                dateRange === "week"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange("month")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                dateRange === "month"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange("custom")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                dateRange === "custom"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Custom
            </button>
            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Received</p>
            <p className="text-2xl font-bold text-green-600">
              +{stats.received.toFixed(2)} RTC
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Sent</p>
            <p className="text-2xl font-bold text-red-600">
              -{stats.sent.toFixed(2)} RTC
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Net Activity</p>
            <p
              className={`text-2xl font-bold ${
                stats.net >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.net >= 0 ? "+" : ""}
              {stats.net.toFixed(2)} RTC
            </p>
          </div>
        </div>

        {/* Transaction groups */}
        <div className="space-y-6">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No transactions found for the selected filters.
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([label, txs]) => (
              <div key={label}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{label}</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                  {txs.map((tx) => {
                    const isReceived = tx.type === "received";
                    const amountColor = isReceived ? "text-green-600" : "text-red-600";
                    const sign = isReceived ? "+" : "-";
                    const statusColor =
                      tx.status === "completed"
                        ? "text-green-600"
                        : tx.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600";
                    const StatusIcon =
                      tx.status === "completed"
                        ? CheckCircle
                        : tx.status === "pending"
                        ? Clock
                        : XCircle;

                    let description = "";
                    if (tx.type === "received") {
                      description = `From ${formatAddress(tx.address)}`;
                    } else {
                      description = `To ${formatAddress(tx.address)}`;
                    }
                    if (tx.address === "Ratel Coin Faucet") {
                      description = "Deposit from Faucet";
                    }

                    return (
                      <div
                      key={tx.id}
                      onClick={() => router.push(`/dashboard/wallet/transactions/receipt?id=${tx.id}&from=transactions`)}
                        className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isReceived ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {isReceived ? (
                              <ArrowDownLeft size={20} className="text-green-600" />
                            ) : (
                              <ArrowUpRight size={20} className="text-red-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>
                                {new Date(tx.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span>•</span>
                              <span className={`flex items-center gap-1 ${statusColor}`}>
                                <StatusIcon size={12} />
                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-semibold ${amountColor}`}>
                            {sign} {tx.amount.toFixed(2)} RTC
                          </p>
                          {tx.hash && (
                            <p className="text-xs text-gray-400 font-mono truncate max-w-[80px]">
                              {tx.hash.slice(0, 10)}...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400 text-center border-t border-gray-200 pt-6">
          <p>All transactions are secure and encrypted.</p>
          <p>
            Need help? <a href="#" className="text-red-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>

      {/* ─── Transaction Detail Modal ──────────────────────────── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Type</span>
                <span
                  className={`font-semibold ${
                    selectedTx.type === "received" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {selectedTx.type === "received" ? "Received" : "Sent"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold">
                  {selectedTx.type === "received" ? "+" : "-"} {selectedTx.amount.toFixed(2)} RTC
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Counterparty</span>
                <span className="font-mono text-xs">{selectedTx.address}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Date & Time</span>
                <span>{selectedTx.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-semibold ${
                    selectedTx.status === "completed"
                      ? "text-green-600"
                      : selectedTx.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedTx.status.charAt(0).toUpperCase() + selectedTx.status.slice(1)}
                </span>
              </div>
              {selectedTx.hash && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Transaction Hash</span>
                  <span className="font-mono text-xs break-all">{selectedTx.hash}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex-1"
              >
                <FileDown size={18} />
                {isGeneratingPDF ? "Generating..." : "Download PDF Receipt"}
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition flex-1"
              >
                Back to History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hidden PDF receipt ──────────────────────────────────── */}
      {selectedTx && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <TransactionReceipt
            ref={receiptRef}
            transaction={selectedTx}
            walletAddress={walletData.address}
          />
        </div>
      )}
    </div>
  );
}