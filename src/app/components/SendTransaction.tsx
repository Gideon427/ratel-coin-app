// src/app/components/SendTransaction.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, User, Check } from "lucide-react";
import { isValidAddress } from "@/lib/walletService";

interface SendTransactionProps {
  onClose: () => void;
  onSuccess: (txData: {
    hash: string;
    amount: number;
    recipient: string;
    type: 'sent';
  }) => void;
  isDemoMode?: boolean;
}

export default function SendTransaction({ 
  onClose, 
  onSuccess, 
  isDemoMode = true 
}: SendTransactionProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableWallets, setAvailableWallets] = useState<Array<{address: string, email: string}>>([]);
  const [copied, setCopied] = useState(false);

  // Get current user's address to exclude from the list
  const currentAddress = typeof window !== 'undefined' ? localStorage.getItem("walletAddress") : "";

  // Load available demo wallets
  useEffect(() => {
    if (isDemoMode && typeof window !== 'undefined') {
      const wallets: Array<{address: string, email: string}> = [];
      
      // Scan localStorage for all wallet_data_* keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("wallet_data_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            if (data.address && data.email && data.address !== currentAddress) {
              wallets.push({
                address: data.address,
                email: data.email
              });
            }
          } catch (e) {
            // Skip invalid data
          }
        }
      }
      
      // If no other wallets found, add a demo wallet
      if (wallets.length === 0 && isDemoMode) {
        wallets.push({
          address: "0x9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f",
          email: "demo_receiver@example.com"
        });
        wallets.push({
          address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
          email: "test_user@example.com"
        });
      }
      
      setAvailableWallets(wallets);
    }
  }, [isDemoMode, currentAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!recipient || !amount) {
        throw new Error("Please fill in all fields.");
      }
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Amount must be a positive number.");
      }
      
      if (!isValidAddress(recipient)) {
        throw new Error("Please enter a valid wallet address starting with 0x");
      }

      // Check if sending to self
      const currentAddress = typeof window !== 'undefined' ? localStorage.getItem("walletAddress") : "";
      if (recipient === currentAddress) {
        throw new Error("You cannot send money to yourself!");
      }

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate fake transaction hash
      const fakeHash = "0x" + Array.from({ length: 64 }, () => 
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("");

      // Pass transaction data back to parent
      onSuccess({
        hash: fakeHash,
        amount: parseFloat(amount),
        recipient: recipient,
        type: 'sent'
      });
    } catch (err: any) {
      setError(err.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAddress = (address: string) => {
    setRecipient(address);
    setError("");
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isDemoMode ? "Send Ratel Coin (Demo)" : "Send Ratel Coin"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition">
            <X size={24} />
          </button>
        </div>

        {isDemoMode && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <span className="font-medium">Demo Mode:</span> This is a simulation. No real money will be transferred.
            </p>
          </div>
        )}

        {/* Demo Quick Fill - Show available wallets */}
        {isDemoMode && availableWallets.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Fill - Select a demo wallet:
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableWallets.map((wallet, index) => (
                <button
                  key={index}
                  onClick={() => fillDemoAddress(wallet.address)}
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {wallet.email}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    {formatAddress(wallet.address)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 font-mono"
              required
            />
            {isDemoMode && (
              <p className="mt-1 text-xs text-gray-400">
                💡 Enter any address or click a demo wallet above
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (RTC)
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl py-4 text-lg font-semibold text-white transition disabled:opacity-70 ${
              isDemoMode 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                {isDemoMode ? "Processing Demo..." : "Sending..."}
              </span>
            ) : (
              isDemoMode ? "Send (Demo)" : "Send Now"
            )}
          </button>
        </form>

        {/* Information about the receiver being credited */}
        {isDemoMode && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 flex items-center gap-1">
              <Check size={14} className="text-green-600" />
              <span>
                <strong>Note:</strong> The receiver will be automatically credited in demo mode.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}