"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
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
  XCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  fetchAndSyncWallet,
  normalizeAddress,
} from "@/lib/walletService";

function TransferSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const receiptRef = useRef<HTMLDivElement>(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─────────────────────────────────────────────
  // URL PARAMETERS
  // ─────────────────────────────────────────────

  const status = searchParams.get("status") || "success";
  const amount = searchParams.get("amount") || "0";
  const recipient = searchParams.get("recipient") || "";
  const hash = searchParams.get("hash") || "";
  const mode = searchParams.get("mode") || "live";
  const message = searchParams.get("message") || "";
  const senderAddress = searchParams.get("sender") || "";
  const balanceParam = searchParams.get("balance") || "0";

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────

  const [displayBalance, setDisplayBalance] =
    useState<string>(balanceParam);

  const [loading, setLoading] = useState(true);

  const [walletAddress, setWalletAddress] =
    useState<string>("");

  const [usdRate, setUsdRate] =
    useState<number>(1.98);

  // ─────────────────────────────────────────────
  // CURRENCY
  // Change RLT to RTC if your actual token
  // symbol is RTC.
  // ─────────────────────────────────────────────

  const CURRENCY = "RLT";

  // ─────────────────────────────────────────────
  // FETCH WALLET
  // ─────────────────────────────────────────────

  useEffect(() => {
    const addr =
      senderAddress ||
      localStorage.getItem("walletAddress") ||
      "";

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
        const wallet =
          await fetchAndSyncWallet(normalized!);

        if (wallet) {
          setDisplayBalance(
            wallet.balance.toFixed(2)
          );

          if (wallet.balance > 0) {
            setUsdRate(
              wallet.balanceUSD / wallet.balance
            );
          }
        } else {
          setDisplayBalance(balanceParam);
        }
      } catch (err) {
        console.error(
          "Failed to sync wallet:",
          err
        );

        setDisplayBalance(balanceParam);
      } finally {
        setLoading(false);
      }
    }

    syncAndGetBalance();
  }, [senderAddress, balanceParam]);

  // ─────────────────────────────────────────────
  // VALUES
  // ─────────────────────────────────────────────

  const isError = status === "error";

  const numericAmount =
    parseFloat(amount) || 0;

  const amountUSD =
    numericAmount * usdRate;

  const sessionId =
    hash ||
    `RTC${Date.now().toString().slice(-10)}`;

  const sender =
    walletAddress ||
    senderAddress ||
    "Unknown";

  const receiver =
    recipient ||
    "Unknown";

  const transactionDate =
    new Date().toLocaleString();

  // ─────────────────────────────────────────────
  // PDF
  // ─────────────────────────────────────────────

  const generatePDF = async () => {
    if (!receiptRef.current) return;

    setIsGeneratingPDF(true);

    try {
      const canvas =
        await html2canvas(receiptRef.current, {
          scale: 2.5,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });

      const imgData =
        canvas.toDataURL("image/png");

      const pdf =
        new jsPDF("p", "mm", "a4");

      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const pdfHeight =
        (canvas.height * pdfWidth) /
        canvas.width;

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
        `ratel-coin-transfer-${sessionId}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      alert(
        "Failed to generate PDF. Please try again."
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ─────────────────────────────────────────────
  // SHARE
  // ─────────────────────────────────────────────

  const handleShare = async () => {
    const shareData = {
      title:
        "Ratel Coin Transfer Receipt",

      text:
        `Ratel Coin transfer of ${numericAmount.toFixed(
          2
        )} ${CURRENCY}`,

      url:
        window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(
          shareData
        );
      } catch (err) {
        if (
          (err as Error).name !==
          "AbortError"
        ) {
          console.error(
            "Share failed:",
            err
          );
        }
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      alert(
        "Receipt link copied to clipboard!"
      );
    } catch {
      alert(
        "Unable to copy receipt link."
      );
    }
  };

  // ─────────────────────────────────────────────
  // COPY SESSION ID
  // ─────────────────────────────────────────────

  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(
        sessionId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy session ID:",
        error
      );
    }
  };

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef1f4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <div className="w-11 h-11 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />

          <p className="text-sm text-gray-500">
            Processing transaction...
          </p>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR PAGE
  // ─────────────────────────────────────────────

  if (isError) {
    return (
      <div className="min-h-screen bg-[#eef1f4] flex items-center justify-center px-5">

        <div className="bg-white rounded-[28px] shadow-xl border border-gray-200 p-8 max-w-md w-full">

          <div className="flex justify-center">

            <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">

              <XCircle
                size={46}
                className="text-red-500"
              />

            </div>

          </div>

          <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Transfer Failed
          </h1>

          <p className="mt-3 text-center text-sm text-gray-500 leading-relaxed">
            {message ||
              "Your transfer could not be completed."}
          </p>

          <button
            onClick={() =>
              router.push(
                "/dashboard/wallet"
              )
            }
            className="
              mt-7
              w-full
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              hover:bg-red-700
              text-white
              font-semibold
              py-3.5
              transition
            "
          >
            Back to Wallet
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────
  // SUCCESS RECEIPT
  // ─────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#eef1f4] py-5 sm:py-10 px-3 sm:px-6">

      {/* BACK BUTTON */}
      <div className="max-w-[950px] mx-auto mb-5 print:hidden">

        <button
          onClick={() =>
            router.push(
              "/dashboard/wallet"
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            text-gray-600
            hover:text-gray-950
            font-medium
            text-sm
            transition
          "
        >
          <ArrowRight
            size={18}
            className="rotate-180"
          />

          Back to Wallet
        </button>

      </div>

      {/* =================================================
          RECEIPT
      ================================================== */}

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

        {/* BACKGROUND PATTERN */}

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

          {/* =================================================
              BRAND
          ================================================== */}

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-3">

              {/* ACTUAL RATEL COIN LOGO */}

              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">

                <img
                  src="/images/logo.png"
                  alt="Ratel Coin"
                  className="w-full h-full object-contain"
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

            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-600 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold">

              <ShieldCheck size={16} />

              VERIFIED

            </div>

          </div>

          {/* =================================================
              SUCCESS ICON
          ================================================== */}

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

          {/* =================================================
              TITLE
          ================================================== */}

          <div className="text-center mt-5">

            <h1 className="text-[30px] sm:text-[42px] md:text-[48px] font-bold tracking-tight text-[#1f2937]">
              Transfer Receipt
            </h1>

            <p className="mt-2 text-base sm:text-lg text-[#718096]">
              Official Document
              <span className="mx-1">
                •
              </span>
              Ratel Coin Network
            </p>

            <div className="flex justify-center mt-5">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50 text-green-600 font-semibold text-sm">

                <CheckCircle2 size={17} />

                Successful

              </div>

            </div>

          </div>

          {/* =================================================
              AMOUNT
          ================================================== */}

          <div className="mt-8 sm:mt-9 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/80 to-white px-5 py-7 sm:py-9 text-center">

            <p className="text-base sm:text-lg text-[#718096]">
              Amount Sent
            </p>

            <p className="mt-3 text-[40px] sm:text-[58px] md:text-[64px] leading-none font-bold tracking-tight text-red-600">

              -{" "}
              {numericAmount.toFixed(2)}{" "}
              {CURRENCY}

            </p>

            <p className="mt-3 text-sm text-gray-400">
              ≈ ${amountUSD.toFixed(2)} USD
            </p>

          </div>

          {/* =================================================
              TRANSACTION DETAILS
          ================================================== */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-[0_5px_18px_rgba(15,23,42,0.05)] overflow-hidden">

            <TransferRow
              icon={
                <Wallet size={19} />
              }
              label="Sender"
              value={shortenAddress(sender)}
            />

            <TransferRow
              icon={
                <User size={19} />
              }
              label="Receiver"
              value={shortenAddress(receiver)}
            />

            <TransferRow
              icon={
                <CalendarDays size={19} />
              }
              label="Date & Time"
              value={transactionDate}
            />

            <TransferRow
              icon={
                <span className="text-[17px] font-bold">
                  $
                </span>
              }
              label="Network Fee"
              value={`0.00 ${CURRENCY}`}
              muted
            />

            <TransferRow
              icon={
                <Link2 size={19} />
              }
              label="Blockchain"
              value="Ratel Chain"
              strong
            />

            {/* SESSION ID */}

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
                      <Check
                        size={16}
                        className="text-green-600"
                      />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>

                </div>

              </div>

            </div>

            {/* STATUS */}

            <TransferRow
              icon={
                <CheckCircle2 size={19} />
              }
              label="Status"
              value={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1 text-green-600 font-semibold text-xs sm:text-sm">

                  <Check
                    size={14}
                    strokeWidth={3}
                  />

                  Completed

                </span>
              }
              isLast
            />

          </div>

          {/* =================================================
              REMARK
          ================================================== */}

          <div className="mt-8 rounded-xl border border-green-100 bg-green-50/60 overflow-hidden">

            <div className="flex gap-4 px-5 py-5">

              <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center text-green-600">

                <Info size={21} />

              </div>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">

                <span className="font-bold text-green-600">
                  Remark:
                </span>{" "}

                This transaction has been successfully
                completed on the Ratel Coin network.
                All transactions are final and
                irreversible.

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base text-gray-700 font-medium">

              <ShieldCheck
                size={18}
                className="text-green-600"
              />

              Ratel Coin Network

              <span className="text-gray-300">
                •
              </span>

              Decentralized

              <span className="text-gray-300">
                •
              </span>

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

      {/* =================================================
          ACTION BUTTONS
      ================================================== */}

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

      {/* =================================================
          WALLET / DASHBOARD BUTTONS
      ================================================== */}

      <div className="max-w-[950px] mx-auto mt-3 print:hidden">

        <div className="flex flex-col sm:flex-row justify-center gap-3">

          <button
            onClick={() =>
              router.push(
                "/dashboard/wallet"
              )
            }
            className="
              flex
              items-center
              justify-center
              gap-2
              px-6
              py-3
              rounded-xl
              border
              border-gray-200
              bg-white
              text-gray-700
              font-semibold
              hover:bg-gray-50
              transition
            "
          >
            Back to Wallet

            <ArrowRight
              size={17}
            />

          </button>

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="
              px-6
              py-3
              rounded-xl
              border
              border-gray-200
              bg-white
              text-gray-700
              font-semibold
              hover:bg-gray-50
              transition
            "
          >
            Go to Dashboard
          </button>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   TRANSFER ROW
========================================================= */

function TransferRow({
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

/* =========================================================
   ADDRESS FORMATTER
========================================================= */

function shortenAddress(address: string) {
  if (!address) return "Unknown";

  if (address.length <= 24) {
    return address;
  }

  return `${address.slice(0, 12)}...${address.slice(-10)}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function TransferSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#eef1f4] flex items-center justify-center">

          <div className="w-11 h-11 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />

        </div>
      }
    >
      <TransferSuccessContent />
    </Suspense>
  );
}