"use client";

import { forwardRef } from "react";
import { Transaction } from "@/lib/walletService";
import { formatAddress } from "@/lib/walletService";

interface TransactionReceiptProps {
  transaction: Transaction;
  walletAddress: string;
}

export const TransactionReceipt = forwardRef<HTMLDivElement, TransactionReceiptProps>(
  ({ transaction, walletAddress }, ref) => {
    const isReceived = transaction.type === "received";
    const amountColor = isReceived ? "#22c55e" : "#dc2626";
    const sign = isReceived ? "+" : "-";

    const txId = transaction.hash
      ? transaction.hash.toUpperCase()
      : `RTC${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

    const txDate = new Date(transaction.date);
    const formattedDate = txDate.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Watermark SVG
    const watermarkSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <pattern id="watermark" patternUnits="userSpaceOnUse" width="180" height="180" patternTransform="rotate(-30)">
            <text x="20" y="100" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="rgba(220,38,38,0.07)">RATEL COIN</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermark)" />
      </svg>
    `;

    const watermarkDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(watermarkSvg)}`;

    return (
      <div
        ref={ref}
        style={{
          width: "650px",
          padding: "48px 40px",
          background: `#ffffff url('${watermarkDataUri}') repeat`,
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#1a1a1a",
          border: "4px double #dc2626",
          borderRadius: "12px",
          position: "relative",
          boxShadow: "0 0 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* Top-right logo */}
        <div
          style={{
            position: "absolute",
            top: "-18px",
            right: "30px",
            background: "white",
            padding: "4px",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #dc2626",
          }}
        >
          <img
            src="/images/logo.png"
            alt="Ratel Coin"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#dc2626" }}>
            Transaction Receipt
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px", letterSpacing: "1px" }}>
            Official Document · Ratel Coin Network
          </p>
          <p style={{ color: "#22c55e", fontSize: "15px", fontWeight: "600", marginTop: "6px" }}>
            ✓ Successful
          </p>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", margin: "0 0 20px 0" }} />

        {/* Amount */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
            {isReceived ? "Amount Received" : "Amount Sent"}
          </p>
          <p
            style={{
              fontSize: "38px",
              fontWeight: "bold",
              color: amountColor,
              margin: "4px 0 0 0",
              letterSpacing: "-0.5px",
            }}
          >
            {sign} {transaction.amount.toFixed(2)} RTC
          </p>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 16px 0" }} />

        {/* Details list - single column */}
        <div style={{ fontSize: "13px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "500" }}>Sender</span>
            <span style={{ fontFamily: "monospace", fontWeight: "500" }}>
              {isReceived ? formatAddress(transaction.address) : formatAddress(walletAddress)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "500" }}>Receiver</span>
            <span style={{ fontFamily: "monospace", fontWeight: "500" }}>
              {isReceived ? formatAddress(walletAddress) : formatAddress(transaction.address)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "500" }}>Date & Time</span>
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "500" }}>Network Fee</span>
            <span style={{ color: "#64748b" }}>0.00 RTC</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "500" }}>Blockchain</span>
            <span style={{ fontWeight: "600" }}>Ratel Chain</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "500" }}>Session ID</span>
            <span style={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all", maxWidth: "250px", textAlign: "right" }}>
              {txId}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ color: "#64748b", fontWeight: "500" }}>Status</span>
            <span style={{ color: "#22c55e", fontWeight: "700" }}>Successful</span>
          </div>
        </div>

        {/* Remark */}
        <div
          style={{
            background: "#fef3c7",
            borderLeft: "4px solid #f59e0b",
            padding: "10px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            color: "#92400e",
            marginBottom: "20px",
          }}
        >
          <strong>Remark:</strong> This transaction has been successfully completed on the Ratel Coin network. All transactions are final and irreversible.
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#94a3b8",
            borderTop: "2px solid #e2e8f0",
            paddingTop: "14px",
            marginTop: "4px",
            letterSpacing: "0.3px",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontWeight: "500", color: "#64748b" }}>
            Ratel Coin Network · Decentralized · Secure
          </p>
          <p style={{ margin: 0 }}>
            This is an electronically generated receipt. Verification can be performed using the Session ID.
          </p>
          <p style={{ margin: "6px 0 0 0", color: "#cbd5e1" }}>
            © {new Date().getFullYear()} Ratel Coin. All rights reserved.
          </p>
        </div>

        {/* Border pattern */}
        <div
          style={{
            position: "absolute",
            top: "4px",
            left: "4px",
            right: "4px",
            bottom: "4px",
            border: "1px solid rgba(220,38,38,0.1)",
            borderRadius: "8px",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  }
);

TransactionReceipt.displayName = "TransactionReceipt";