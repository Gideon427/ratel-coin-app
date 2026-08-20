"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ethers } from "ethers";
import { generateUserId, generateWalletAddress } from "@/lib/walletService";
import { createAccount } from "@/lib/authStorage";

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(null);
  const [useDemoMode, setUseDemoMode] = useState(true); // ✅ Added
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum;

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError("Please install MetaMask to continue.");
      return;
    }

    setIsConnectingWallet(true);
    setError("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      setStoredWalletAddress(address);
      localStorage.setItem("walletAddress", address);
      localStorage.setItem("walletConnected", "true");
      setError("");
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Wallet connection rejected. Please try again.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
      console.error(err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const address = localStorage.getItem("walletAddress") || "";
      setStoredWalletAddress(address);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Wallet connection required only if NOT in Demo Mode
    if (!useDemoMode) {
      const savedAddress = typeof window !== "undefined" ? localStorage.getItem("walletAddress") : "";
      if (!walletAddress && !savedAddress) {
        setError("Please connect your wallet first");
        return;
      }
    }

    setLoading(true);

    try {
      // Generate user ID and wallet address
      const userId = generateUserId(formData.email);
      let address = "";

      if (useDemoMode) {
        address = generateWalletAddress(userId);
        localStorage.setItem("demoMode", "true");
      } else {
        address = walletAddress || storedWalletAddress || "";
        localStorage.setItem("demoMode", "false");
      }

      // Initialize wallet data if it doesn't exist
      const storageKey = `wallet_data_${address}`;
      const existingData = localStorage.getItem(storageKey);
      if (!existingData) {
        const initialData = {
          address: address,
          email: formData.email,
          balance: 1000,
          balanceUSD: 1980,
          transactions: [
            {
              id: 1,
              type: 'received',
              amount: 1000,
              address: "0x0000...0000",
              from: "Ratel Coin Faucet",
              date: new Date().toLocaleString(),
              status: 'completed',
              hash: "0x" + Array.from({ length: 64 }, () => 
                "0123456789abcdef"[Math.floor(Math.random() * 16)]
              ).join("")
            }
          ],
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(initialData));
      }

      const created = createAccount({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        walletAddress: address,
        demoMode: useDemoMode,
      });

      if (!created.success) {
        setError(created.error || "Unable to create account.");
        return;
      }

      router.push("/dashboard/wallet");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const connectedAddress = walletAddress || storedWalletAddress || "";
  const displayAddress = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : "";
  const isWalletConnected = Boolean(connectedAddress);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-22 sm:px-6 lg:px-8 relative">
      <Link
        href="/"
        className="absolute top-8 left-4 sm:left-8 flex items-center gap-2 text-gray-600 hover:text-red-600 transition group"
      >
        <svg className="h-5 w-5 group-hover:-translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Go Back</span>
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 relative">
            <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {useDemoMode ? "Sign up with Demo Mode (no wallet required)" : "Connect your wallet to continue"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {/* Demo Mode Toggle */}
          <div className="mb-4 flex items-center justify-between bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${useDemoMode ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">Demo Mode</span>
            </div>
            <button
              onClick={() => {
                setUseDemoMode(!useDemoMode);
                if (!useDemoMode) {
                  setWalletAddress("");
                  setStoredWalletAddress("");
                  localStorage.removeItem("walletAddress");
                  localStorage.removeItem("walletConnected");
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                useDemoMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  useDemoMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Wallet Connect Section (only shown when Demo Mode is OFF) */}
          {!useDemoMode && (
            <div className="mb-6">
              {!isWalletConnected ? (
                <>
                  <button
                    onClick={connectWallet}
                    disabled={isConnectingWallet || !isMetaMaskInstalled}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-lg font-semibold transition ${
                      isMetaMaskInstalled
                        ? "border-red-600 text-red-600 hover:bg-red-50"
                        : "border-gray-300 text-gray-400 cursor-not-allowed"
                    } disabled:opacity-50`}
                  >
                    {isConnectingWallet ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {isMetaMaskInstalled ? "Connect Wallet" : "Install MetaMask"}
                      </>
                    )}
                  </button>
                  {!isMetaMaskInstalled && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">MetaMask not detected</p>
                        <p className="text-xs text-yellow-700 mt-0.5">
                          Please install MetaMask to use Ratel Chain wallet.
                          <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="ml-1 text-red-600 hover:text-red-700 font-medium">Download MetaMask</a>
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Connected: {displayAddress}</span>
                  </div>
                  <button
                    onClick={() => {
                      setWalletAddress("");
                      setStoredWalletAddress("");
                      localStorage.removeItem("walletAddress");
                      localStorage.removeItem("walletConnected");
                      setError("");
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}

          {!useDemoMode && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
              </div>
            </div>
          )}

          <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm pr-20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-red-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.243 4.243M9.878 9.878L3 3m6.878-6.878 4.242 4.242M21 21l-6-6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm pr-20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-red-600"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.243 4.243M9.878 9.878L3 3m6.878-6.878 4.242 4.242M21 21l-6-6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" className="text-red-600 hover:text-red-500">Terms of Service</a> and <a href="#" className="text-red-600 hover:text-red-500">Privacy Policy</a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}