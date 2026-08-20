"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileDown,
  Share2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  fetchAndSyncWallet,
  normalizeAddress,
  readWalletState,
} from "@/lib/walletService";
import { TransactionReceipt } from "@/app/components/TransactionReceipt";

function TransferSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // ─── Read params ──────────────────────────────────────────
  const status = searchParams.get("status") || "success";
  const amount = searchParams.get("amount") || "0";
  const recipient = searchParams.get("recipient") || "";
  const hash = searchParams.get("hash") || "";
  const mode = searchParams.get("mode") || "live";
  const message = searchParams.get("message") || "";
  const senderAddress = searchParams.get("sender") || "";
  const balanceParam = searchParams.get("balance") || "0";

  const [displayBalance, setDisplayBalance] = useState<string>(balanceParam);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [usdRate, setUsdRate] = useState<number>(1.98);

  // ─── Fetch wallet & balance ──────────────────────────────
  useEffect(() => {
    // Get sender address from URL or from localStorage
    const addr = senderAddress || localStorage.getItem("walletAddress") || "";
    setWalletAddress(addr);

    if (!senderAddress) {
      setDisplayBalance(balanceParam);
      setLoading(false);
      return;
    }

    const normalized = normalizeAddress(senderAddress);
    if (!normalized) {
      setDisplayBalance(balanceParam);
      setLoading(false);
      return;
    }

    async function syncAndGetBalance() {
      try {
        const wallet = await fetchAndSyncWallet(normalized);
        if (wallet) {
          setDisplayBalance(wallet.balance.toFixed(2));
          // Compute USD rate
          if (wallet.balance > 0) {
            setUsdRate(wallet.balanceUSD / wallet.balance);
          }
        } else {
          setDisplayBalance(balanceParam);
        }
      } catch (err) {
        console.error("Failed to sync wallet:", err);
        setDisplayBalance(balanceParam);
      } finally {
        setLoading(false);
      }
    }

    syncAndGetBalance();
  }, [senderAddress, balanceParam]);

  // ─── Build transaction object for receipt ────────────────
  const transactionForReceipt = {
    id: Date.now(),
    type: "sent" as const,
    amount: parseFloat(amount) || 0,
    address: recipient || "Unknown",
    date: new Date().toLocaleString(),
    status: "completed" as const,
    hash: hash || "",
    from: walletAddress || senderAddress,
    to: recipient,
  };

  const amountUSD = parseFloat(amount) * usdRate;

  // ─── PDF generation ──────────────────────────────────────
  const generatePDF = async () => {
    if (!receiptRef.current) return;
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
      pdf.save(`transfer-receipt-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ─── Share handler ────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: "Ratel Coin Transfer Receipt",
      text: `Transfer of ${amount} RTC ${recipient ? `to ${recipient}` : ""}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
          // fallback: copy link
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        }
      }
    } else {
      // fallback: copy link
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const isError = status === "error";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="flex justify-center">
          {isError ? (
            <XCircle className="h-16 w-16 text-red-500" />
          ) : (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          )}
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">
          {isError ? "Transfer Failed" : "Transfer Successful"}
        </h1>

        <p className="mt-3 text-center text-sm text-gray-600">
          {isError
            ? message || "Your transfer could not be completed."
            : mode === "demo"
              ? "The transaction completed successfully in demo mode."
              : "Your transfer was completed successfully."}
        </p>

        {!isError && (
          <>
            <div className="mt-6 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Amount</span>
                <span className="font-semibold">
                  {amount} RTC <span className="text-xs text-gray-500">(≈ ${amountUSD.toFixed(2)} USD)</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recipient</span>
                <span className="font-mono text-xs">{recipient}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>New Balance</span>
                <span className="font-semibold">{displayBalance} RTC</span>
              </div>
              {hash && (
                <div className="flex items-center justify-between">
                  <span>Hash</span>
                  <span className="font-mono text-xs">{hash.slice(0, 16)}...</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FileDown className="h-4 w-4" />
                {isGeneratingPDF ? "Generating..." : "Download PDF Receipt"}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 transition"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => router.push("/dashboard/wallet")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-white font-semibold hover:bg-red-700 transition"
          >
            Back to Wallet <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* ─── Hidden receipt for PDF (uses TransactionReceipt) ── */}
      {!isError && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <TransactionReceipt
            ref={receiptRef}
            transaction={transactionForReceipt}
            walletAddress={walletAddress || senderAddress || "0x..."}
          />
        </div>
      )}
    </div>
  );
}

export default function TransferSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <TransferSuccessContent />
    </Suspense>
  );
}