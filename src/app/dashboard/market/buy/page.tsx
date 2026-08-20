"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaMoon, FaSun, FaArrowLeft } from "react-icons/fa";

export default function BuyPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [price, setPrice] = useState(0.5087);
  const [amount, setAmount] = useState("");
  const balance = 1250.75; // USDT balance
  const total = (price * (Number(amount) || 0)).toFixed(4);

  const handlePercent = (percent: number) => {
    const qty = ((balance * percent) / 100 / price).toFixed(2);
    setAmount(qty);
  };

  const handleBuy = () => {
    // Place your buy logic here
    alert(`Buying ${amount} RTC at $${price} – total $${total}`);
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#0d1117] text-white" : "bg-[#f5f5f5] text-black"
      }`}
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex justify-between items-center p-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-full px-4 py-2 bg-red-600 text-white hover:bg-red-700"
        >
          <FaArrowLeft /> Back
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`rounded-full p-3 shadow-xl transition ${
            darkMode ? "bg-white text-black" : "bg-black text-white"
          }`}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-10">
        {/* Header */}
        <div className="rounded-2xl bg-green-600 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Buy RTC / USDT</h1>
          <p className="mt-2 opacity-80">Current price: $0.5087</p>
          <p className="mt-1 text-sm opacity-70">≈ ₦797.32 NGN</p>
        </div>

        {/* Buy Form */}
        <div
          className={`mt-8 rounded-xl p-6 ${
            darkMode ? "bg-[#161b22]" : "bg-white"
          } shadow`}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm">Price (USDT)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-lg border p-3 bg-transparent"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm">Amount (RTC)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border p-3 bg-transparent"
              />
            </div>

            {/* Percent buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePercent(p)}
                  className="rounded bg-green-100 py-2 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  {p}%
                </button>
              ))}
            </div>

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-green-600">{total} USDT</span>
            </div>
            <div className="flex justify-between text-sm opacity-70">
              <span>Balance</span>
              <span>{balance} USDT</span>
            </div>

            <button
              onClick={handleBuy}
              className="w-full rounded-lg bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700"
            >
              Buy RTC
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className={`rounded-xl p-4 ${darkMode ? "bg-[#161b22]" : "bg-white"} shadow`}>
            <span className="opacity-70">Min order</span>
            <p className="font-semibold">10 RTC</p>
          </div>
          <div className={`rounded-xl p-4 ${darkMode ? "bg-[#161b22]" : "bg-white"} shadow`}>
            <span className="opacity-70">Fee</span>
            <p className="font-semibold">0.1%</p>
          </div>
        </div>
      </div>
    </main>
  );
}