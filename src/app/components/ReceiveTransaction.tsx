// src/app/components/ReceiveTransaction.tsx
"use client";

import { useState, useEffect } from "react";
import { Copy, Check, X, AlertCircle, Wallet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatAddress } from "@/lib/walletService";

interface ReceiveTransactionProps {
  onClose: () => void;
  address: string;
}

export default function ReceiveTransaction({ onClose, address }: ReceiveTransactionProps) {
  const [copied, setCopied] = useState(false);
  const [displayAddress, setDisplayAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Log the address for debugging
    console.log("Receive modal received address:", address);
    
    // Get the address
    let finalAddress = address;
    if (!finalAddress || finalAddress.length === 0) {
      const fallbackAddress = localStorage.getItem("walletAddress") || "";
      console.log("Using fallback address:", fallbackAddress);
      finalAddress = fallbackAddress;
    }
    
    setDisplayAddress(finalAddress);
    
    // Get the user's balance
    if (finalAddress) {
      const storageKey = `wallet_data_${finalAddress}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setBalance(data.balance || 0);
        } catch (e) {
          console.error("Failed to parse wallet data:", e);
        }
      }
    }
    
    setIsLoading(false);
  }, [address]);

  const copyAddress = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format address for display
  const formattedAddress = displayAddress ? formatAddress(displayAddress) : "No address available";

  // If no address, show error state
  if (!displayAddress || displayAddress === "" || displayAddress === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Receive Ratel Coin</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition">
              <X size={24} />
            </button>
          </div>
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">No Wallet Connected</h3>
              <p className="text-sm text-gray-600 mt-2">
                Please connect your wallet first to receive funds.
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-xl bg-red-600 py-2 text-white hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Receive Ratel Coin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition p-1">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Balance Display */}
          {!isLoading && balance !== null && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-green-600" />
                <span className="text-sm text-gray-600">Your Balance:</span>
              </div>
              <span className="text-sm font-bold text-green-700">
                {balance.toFixed(2)} RTC
              </span>
            </div>
          )}

          {/* QR Code */}
          <div className="flex justify-center flex-shrink-0">
            <div className="bg-white p-4 rounded-2xl border-2 border-red-100 shadow-lg">
              <QRCodeSVG
                value={displayAddress}
                size={180}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#dc2626"
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Wallet Address
            </label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200 group hover:border-red-300 transition">
              <p className="text-sm font-mono text-gray-700 truncate flex-1">
                {displayAddress}
              </p>
              <button
                onClick={copyAddress}
                className="p-2 hover:bg-gray-200 rounded-lg transition flex-shrink-0 group-hover:bg-gray-100"
                title="Copy address"
              >
                {copied ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Check size={14} />
                Copied to clipboard!
              </p>
            )}
          </div>

          {/* Network Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Network:</span> Ratel Chain
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ⚠️ Only send RTC on the Ratel Chain network to this address.
                </p>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                Mainnet
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-shrink-0">
            <p className="text-xs text-gray-600 font-medium mb-2">💡 Quick Tips:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Scan the QR code to get the address</li>
              <li>• Click "Copy" to copy the address</li>
              <li>• Share this address with the sender</li>
              <li>• Funds will appear in your wallet after confirmation</li>
            </ul>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full rounded-2xl border-2 border-red-600 py-3 text-lg font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}