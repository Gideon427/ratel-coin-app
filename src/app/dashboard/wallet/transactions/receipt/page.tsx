"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Fingerprint,
  Info,
  Link2,
  Share2,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  readWalletState,
  Transaction,
  formatAddress,
} from "@/lib/walletService";
import { useAccount } from "@/lib/AccountContext";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeAccount } = useAccount();

  const id = searchParams.get("id");

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usdRate, setUsdRate] = useState(1.98);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copied, setCopied] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  /*
   * Keep this as RLT because that is the currency branding
   * used by the Ratel Coin receipt design.
   */
  const CURRENCY = "RTC";

  useEffect(() => {
    if (!activeAccount) {
      setError("Please log in.");
      setLoading(false);
      return;
    }

    const address = activeAccount.address;
    setWalletAddress(address);

    const data = readWalletState(address);

    if (!data) {
      setError("No wallet data found.");
      setLoading(false);
      return;
    }

    let tx: Transaction | undefined;

    if (id) {
      tx = data.transactions.find((t) => String(t.id) === id);
    }

    if (!tx && id) {
      tx = data.transactions.find((t) => t.hash === id);
    }

    if (!tx) {
      setError("Transaction not found.");
      setLoading(false);
      return;
    }

    setTransaction(tx);

    if (data.balance > 0) {
      setUsdRate(data.balanceUSD / data.balance);
    } else {
      setUsdRate(1.98);
    }

    setLoading(false);
  }, [activeAccount, id]);

  const generatePDF = async () => {
    if (!receiptRef.current || !transaction) return;

    setIsGeneratingPDF(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );

      pdf.save(
        `ratel-coin-transaction-${transaction.id}-${Date.now()}.pdf`
      );
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    if (!transaction) return;

    const shareData = {
      title: "Ratel Coin Transaction Receipt",
      text: `Ratel Coin transaction receipt — ${transaction.amount.toFixed(
        2
      )} ${CURRENCY}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Receipt link copied to clipboard!");
      } catch {
        alert("Unable to copy receipt link.");
      }
    }
  };

  const copySessionId = async () => {
    if (!transaction) return;

    const value =
      transaction.hash ||
      `RTC${String(transaction.id).padStart(8, "0")}`;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      console.error("Failed to copy session ID");
    }
  };

  const from = searchParams.get("from");

  const fallbackPath =
    from === "notifications"
      ? "/dashboard/notifications"
      : "/dashboard/wallet/transactions";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef1f4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
          <p className="text-sm text-gray-500">
            Loading transaction receipt...
          </p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-[#eef1f4] flex items-center justify-center px-5">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <Info className="text-red-600" size={28} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Receipt unavailable
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Transaction not found."}
          </p>

          <button
            onClick={() =>
              router.push("/dashboard/wallet/transactions")
            }
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const isReceived = transaction.type === "received";

  const amountUSD = transaction.amount * usdRate;

  const sender = isReceived
    ? transaction.address
    : walletAddress;

  const receiver = isReceived
    ? walletAddress
    : transaction.address;

  const sessionId =
    transaction.hash ||
    `RTC${String(transaction.id).padStart(8, "0")}`;

  const displaySender = formatAddress(sender);
  const displayReceiver = formatAddress(receiver);

  return (
    <main className="min-h-screen bg-[#eef1f4] py-5 sm:py-10 px-3 sm:px-6">

      {/* Back navigation - outside receipt so it doesn't appear in PDF */}
      <div className="max-w-[950px] mx-auto mb-5 print:hidden">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-950 font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          Back to History
        </button>
      </div>

      {/* =========================
          RECEIPT
      ========================== */}
      <div
        ref={receiptRef}
        className="
          relative
          w-full
          max-w-[950px]
          mx-auto
          bg-white
          rounded-[28px]
          shadow-[0_25px_70px_rgba(15,23,42,0.16)]
          overflow-hidden
          border border-white
        "
      >

        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-[360px] h-[260px] pointer-events-none opacity-50">
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-radial-gradient(ellipse at 100% 0%, transparent 0px, transparent 13px, rgba(16,185,129,0.08) 14px, transparent 15px)",
            }}
          />
        </div>

        <div className="absolute bottom-0 left-0 w-[300px] h-[220px] pointer-events-none opacity-40">
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-radial-gradient(ellipse at 0% 100%, transparent 0px, transparent 12px, rgba(16,185,129,0.07) 13px, transparent 14px)",
            }}
          />
        </div>

        <div className="relative z-10 px-5 py-7 sm:px-10 sm:py-10 md:px-16 md:py-12">

          {/* =========================
              BRAND HEADER
          ========================== */}
          <div className="flex items-start justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-red-600 flex items-center justify-center overflow-hidden">
  <img
    src="/images/logo.png"
    alt="Ratel Coin"
    className="w-full h-full object-contain p-1"
  />
</div>

              <div>
                <p className="text-lg sm:text-2xl font-black tracking-tight text-red-600">
                  RATEL COIN
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 tracking-[0.18em] uppercase">
                  Decentralized Network
                </p>
              </div>
            </div>

            {/* Verified */}
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-600 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold">
              <ShieldCheck size={16} />
              VERIFIED
            </div>
          </div>

          {/* =========================
              SUCCESS ICON
          ========================== */}
          <div className="flex justify-center mt-10 sm:mt-12">

            <div className="relative w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] rounded-full bg-green-50 border border-green-200 flex items-center justify-center">

              <div className="absolute inset-[7px] rounded-full border border-green-200" />

              <Check
                size={42}
                strokeWidth={3}
                className="text-green-600 relative z-10"
              />
            </div>

          </div>

          {/* =========================
              TITLE
          ========================== */}
          <div className="text-center mt-5">

            <h1 className="text-[30px] sm:text-[42px] md:text-[48px] font-bold tracking-tight text-[#1f2937]">
              Transaction Receipt
            </h1>

            <p className="mt-2 text-base sm:text-lg text-[#718096]">
              Official Document <span className="mx-1">•</span> Ratel Coin Network
            </p>

            <div className="flex justify-center mt-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50 text-green-600 font-semibold text-sm">
                <CheckCircle2 size={17} />
                Successful
              </div>
            </div>

          </div>

          {/* =========================
              AMOUNT CARD
          ========================== */}
          <div className="mt-8 sm:mt-9 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/80 to-white px-5 py-7 sm:py-9 text-center">

            <p className="text-base sm:text-lg text-[#718096]">
              {isReceived ? "Amount Received" : "Amount Sent"}
            </p>

            <p
              className={`
                mt-3
                text-[40px]
                sm:text-[58px]
                md:text-[64px]
                leading-none
                font-bold
                tracking-tight
                ${isReceived ? "text-green-600" : "text-red-600"}
              `}
            >
              {isReceived ? "+" : "-"}{" "}
              {transaction.amount.toFixed(2)} {CURRENCY}
            </p>

            <p className="mt-3 text-sm text-gray-400">
              ≈ ${amountUSD.toFixed(2)} USD
            </p>

          </div>

          {/* =========================
              TRANSACTION INFORMATION
          ========================== */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-[0_5px_18px_rgba(15,23,42,0.05)] overflow-hidden">

            {/* Sender */}
            <ReceiptRow
              icon={<Wallet size={19} />}
              label="Sender"
              value={displaySender}
            />

            {/* Receiver */}
            <ReceiptRow
              icon={<User size={19} />}
              label="Receiver"
              value={displayReceiver}
            />

            {/* Date */}
            <ReceiptRow
              icon={<CalendarDays size={19} />}
              label="Date & Time"
              value={transaction.date}
            />

            {/* Fee */}
            <ReceiptRow
              icon={<span className="text-[17px] font-bold">$</span>}
              label="Network Fee"
              value={`0.00 ${CURRENCY}`}
              muted
            />

            {/* Blockchain */}
            <ReceiptRow
              icon={<Link2 size={19} />}
              label="Blockchain"
              value="Ratel Chain"
              strong
            />

            {/* Session ID */}
            <div className="flex gap-3 px-4 sm:px-5 py-4 border-t border-gray-100">

              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                <Fingerprint size={19} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                <span className="text-[15px] sm:text-base text-[#374151]">
                  Session ID
                </span>

                <div className="flex items-start sm:items-center gap-2 min-w-0">

                  <span className="font-mono text-[10px] sm:text-xs text-gray-700 text-left sm:text-right break-all max-w-full sm:max-w-[480px]">
                    {sessionId}
                  </span>

                  <button
                    type="button"
                    onClick={copySessionId}
                    className="flex-shrink-0 text-gray-400 hover:text-green-600 transition print:hidden"
                    title="Copy Session ID"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>

                </div>

              </div>
            </div>

            {/* Status */}
            <ReceiptRow
              icon={<CheckCircle2 size={19} />}
              label="Status"
              value={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1 text-green-600 font-semibold text-xs sm:text-sm">
                  <Check size={14} strokeWidth={3} />
                  {transaction.status || "Successful"}
                </span>
              }
              isLast
            />

          </div>

          {/* =========================
              REMARK
          ========================== */}
          <div className="mt-8 rounded-xl border border-green-100 bg-green-50/60 overflow-hidden">

            <div className="flex gap-4 px-5 py-5">

              <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center text-green-600">
                <Info size={21} />
              </div>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">

                <span className="font-bold text-green-600">
                  Remark:
                </span>{" "}

                This transaction has been successfully completed on the
                Ratel Coin network. All transactions are final and
                irreversible.

              </div>

            </div>

          </div>

          {/* =========================
              FOOTER
          ========================== */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">

            <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-700 font-medium">
              <ShieldCheck
                size={18}
                className="text-green-600"
              />
              Ratel Coin Network
              <span className="text-gray-300">•</span>
              Decentralized
              <span className="text-gray-300">•</span>
              Secure
            </div>

            <p className="mt-4 text-xs sm:text-sm text-gray-400">
              This is an electronically generated receipt.
            </p>

            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              Verification can be performed using the Session ID.
            </p>

            <p className="mt-7 text-xs sm:text-sm text-gray-300">
              © 2026 Ratel Coin. All rights reserved.
            </p>

          </div>

        </div>
      </div>

      {/* =========================
          ACTION BUTTONS
      ========================== */}
      <div className="max-w-[950px] mx-auto mt-6 print:hidden">

        <div className="flex flex-col sm:flex-row justify-center gap-3">

          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="
              flex
              items-center
              justify-center
              gap-2
              px-7
              py-3.5
              rounded-xl
              bg-red-600
              hover:bg-red-700
              text-white
              font-semibold
              shadow-lg
              shadow-red-600/20
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <Download size={18} />

            {isGeneratingPDF
              ? "Generating PDF..."
              : "Download PDF"}
          </button>

          <button
            onClick={handleShare}
            className="
              flex
              items-center
              justify-center
              gap-2
              px-7
              py-3.5
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
              font-semibold
              shadow-lg
              shadow-green-600/20
              transition
            "
          >
            <Share2 size={18} />
            Share Receipt
          </button>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   RECEIPT ROW
========================================================= */

function ReceiptRow({
  icon,
  label,
  value,
  muted = false,
  strong = false,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  muted?: boolean;
  strong?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-3
        px-4
        sm:px-5
        py-4
        ${!isLast ? "border-b border-gray-100" : ""}
      `}
    >

      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
        {icon}
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-5">

        <span className="text-[15px] sm:text-base text-[#374151]">
          {label}
        </span>

        <span
          className={`
            text-sm
            sm:text-base
            text-left
            sm:text-right
            break-all
            ${
              strong
                ? "font-bold text-gray-800"
                : muted
                ? "text-gray-400"
                : "text-gray-800"
            }
          `}
        >
          {value}
        </span>

      </div>

    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#eef1f4] flex items-center justify-center">
          <div className="w-11 h-11 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}