"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaCog,
  FaExpand,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { readWalletState } from "@/lib/walletService";
import { useAccount } from "@/lib/AccountContext";

const marketTabs = [
  { name: "Overview", href: "/dashboard/market" },
  { name: "Portfolio", href: "/dashboard/portfolio" },
  { name: "Analytics", href: "/dashboard/analytics" },
  { name: "Reports", href: "/dashboard/analytics/reports" },
];

export default function MarketPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeAccount } = useAccount();

  // ─── State ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState(1);
  const [change24h, setChange24h] = useState(0);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartDays, setChartDays] = useState("7");
  const [marketData, setMarketData] = useState({
    marketCap: 1000000,
    circulatingSupply: 1000000,
    maxSupply: 1000000,
    ath: 1,
    atl: 1,
    rank: 1,
  });

  // ─── Chart view state ──────────────────────────────────
  const [chartView, setChartView] = useState<"chart" | "depth" | "tradingview">("chart");
  const [depthData, setDepthData] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const total = (price * (Number(amount) || 0)).toFixed(4);

  // ─── Generate depth data ──────────────────────────────
  const generateDepthData = (currentPrice: number) => {
    const bids: any[] = [];
    const asks: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const bidPrice = currentPrice - i * 0.0005;
      const askPrice = currentPrice + i * 0.0005;
      const bidVol = Math.floor(Math.random() * 1500 + 200);
      const askVol = Math.floor(Math.random() * 1500 + 200);
      bids.push({ price: bidPrice, volume: bidVol, type: "bid" });
      asks.push({ price: askPrice, volume: askVol, type: "ask" });
    }
    setDepthData([...bids.reverse(), ...asks]);
  };

  // ─── Fetch price and market data ──────────────────────────
  useEffect(() => {
    async function fetchPrice() {
      setPrice(1);
      setChange24h(0);
      generateDepthData(1);
    }

    async function fetchMarketData() {
      try {
        const res = await fetch("/api/market/overview");
        const data = await res.json();
        setMarketData({
          marketCap: data.marketCap || 1000000,
          circulatingSupply: data.circulatingSupply || 1000000,
          maxSupply: data.maxSupply || 1000000,
          ath: data.ath || 1,
          atl: data.atl || 1,
          rank: data.rank || 1,
        });
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      }
    }

    fetchPrice();
    fetchMarketData();
    return () => undefined;
  }, []);

  // ─── Fetch chart data ──────────────────────────────────────
  useEffect(() => {
    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const res = await fetch(`/api/market/history?days=${chartDays}`);
        const data = await res.json();
        if (data.prices) {
          const formatted = data.prices.map((item: [number, number]) => ({
            date: new Date(item[0]).toLocaleDateString(),
            price: item[1],
          }));
          setChartData(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch chart data", error);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [chartDays]);

  // ─── Load wallet balance ────────────────────────────────────
  useEffect(() => {
    if (!activeAccount) {
      setIsLoading(false);
      return;
    }
    const data = readWalletState(activeAccount.address);
    if (data) {
      setBalance(data.balance);
    }
    setIsLoading(false);
  }, [activeAccount]);

  const handlePercent = (percent: number) => {
    const qty = ((balance * percent) / 100 / price).toFixed(2);
    setAmount(qty);
  };

  const handleMarketAction = () => {
    alert(`${activeTab === "buy" ? "Buying" : "Selling"} ${amount || "0"} RTC at $${price.toFixed(4)} – total $${total}`);
  };

  const isPositive = change24h >= 0;

  // ─── Toggle fullscreen ──────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // ─── Render chart based on view ──────────────────────────
  const renderChart = () => {
    if (chartView === "depth") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={depthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="price" tickFormatter={(v) => v.toFixed(4)} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any, name: string) => [`${value} RTC`, name === 'volume' ? 'Volume' : '']}
            />
            <Area
              type="step"
              dataKey="volume"
              data={depthData.filter(d => d.type === 'bid')}
              fill="#22c55e"
              stroke="#22c55e"
              name="Bids"
              fillOpacity={0.6}
            />
            <Area
              type="step"
              dataKey="volume"
              data={depthData.filter(d => d.type === 'ask')}
              fill="#dc2626"
              stroke="#dc2626"
              name="Asks"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (chartView === "tradingview") {
      return (
        <div className="flex h-full flex-col items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg font-semibold">TradingView Widget</p>
            <p className="text-sm mt-2">Embed a TradingView chart for RTC/USDT</p>
            <iframe
              src="https://www.tradingview.com/widgetembed/?symbol=CRYPTO:BTCUSD&interval=1D&hidesidetoolbar=1&theme=light&style=1"
              style={{ width: "100%", height: "400px", border: "none" }}
              title="TradingView Chart"
              allowFullScreen
              className="mt-4"
            />
          </div>
        </div>
      );
    }

    // Default: Line chart
    if (chartLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      );
    }

    return chartData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(4)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex h-full items-center justify-center text-gray-400">
        No chart data available
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <div className="mx-auto max-w-[1700px] px-4 sm:px-5 pb-10">

        {/* ─── Tabs ────────────────────────────────────────────── */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 min-w-max">
            {marketTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-white"}
                  `}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── Header Card ────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-red-700 p-6 sm:p-8 text-white shadow-2xl shadow-red-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white overflow-hidden shadow-lg">
                  <img src="/images/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">RTC / USDT</h2>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      </span>
                      Live
                    </span>
                  </div>
                  <p className="text-sm opacity-80">Ratel Coin</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-green-100">RTC / USDT</p>
                </div>
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
                ${price.toFixed(4)}
              </h1>
            </div>
            <div>
              <p className="text-sm opacity-80">24h Change</p>
              <h3 className={`mt-1 text-xl font-bold ${isPositive ? "text-green-300" : "text-red-300"}`}>
                {isPositive ? "▲" : "▼"} {Math.abs(change24h).toFixed(2)}%
              </h3>
            </div>
            <div>
              <p className="text-sm opacity-80">24h High</p>
              <h3 className="mt-1 text-xl font-bold">${(price * (1 + Math.abs(change24h) / 100)).toFixed(4)}</h3>
            </div>
            <div>
              <p className="text-sm opacity-80">24h Low</p>
              <h3 className="mt-1 text-xl font-bold">${(price * (1 - Math.abs(change24h) / 100)).toFixed(4)}</h3>
            </div>
            <div>
              <p className="text-sm opacity-80">Volume (RTC)</p>
              <h3 className="mt-1 text-xl font-bold">
                {(marketData.circulatingSupply * price / 1000).toFixed(1)}K
              </h3>
            </div>
            <div>
              <p className="text-sm opacity-80">Volume (USDT)</p>
              <h3 className="mt-1 text-xl font-bold">
                ${(marketData.circulatingSupply * price / 1000).toFixed(1)}K
              </h3>
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <svg viewBox="0 0 1000 120" className="h-20 w-full sm:h-28">
              <polyline
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={`
                  0,${95 - Math.random() * 20}
                  60,${90 - Math.random() * 20}
                  110,${82 - Math.random() * 20}
                  170,${78 - Math.random() * 20}
                  230,${65 - Math.random() * 20}
                  290,${60 - Math.random() * 20}
                  340,${68 - Math.random() * 20}
                  400,${48 - Math.random() * 20}
                  470,${55 - Math.random() * 20}
                  540,${35 - Math.random() * 20}
                  620,${45 - Math.random() * 20}
                  690,${28 - Math.random() * 20}
                  760,${24 - Math.random() * 20}
                  820,${18 - Math.random() * 20}
                  900,${12 - Math.random() * 20}
                  1000,${3 - Math.random() * 20}
                `}
              />
            </svg>
          </div>
        </div>

        {/* ─── Main Content (Chart + Buy/Sell) ────────────────── */}
        <div className="mt-8 grid gap-6 xl:grid-cols-12">

          {/* LEFT – Chart */}
          <div className="xl:col-span-8 rounded-xl bg-white dark:bg-[#161b22] shadow-lg overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 pt-4">
              <div className="flex flex-wrap gap-4">
                {/* ─── Chart Tabs ─────────────────────────────────── */}
                <button
                  onClick={() => setChartView("chart")}
                  className={`pb-3 font-semibold transition ${
                    chartView === "chart"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "opacity-70 hover:opacity-100 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Chart
                </button>
                <button
                  onClick={() => setChartView("depth")}
                  className={`pb-3 font-semibold transition ${
                    chartView === "depth"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "opacity-70 hover:opacity-100 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Market Depth
                </button>
                <button
                  onClick={() => setChartView("tradingview")}
                  className={`pb-3 font-semibold transition ${
                    chartView === "tradingview"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "opacity-70 hover:opacity-100 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  TradingView
                </button>
              </div>
              <div className="flex items-center gap-3">
                {/* ─── Expand / Fullscreen ───────────────────────── */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title="Fullscreen"
                >
                  <FaExpand className="text-gray-600 dark:text-gray-400" />
                </button>
                {/* ─── Settings ──────────────────────────────────── */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title="Chart Settings"
                >
                  <FaCog className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* ─── Time-frame buttons (only for Chart) ──────────── */}
            {chartView === "chart" && (
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
                {["1", "7", "14", "30"].map((days) => (
                  <button
                    key={days}
                    onClick={() => setChartDays(days)}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                      chartDays === days
                        ? "bg-red-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            )}

            {/* ─── Chart Area ─────────────────────────────────────── */}
            <div className="h-[400px] sm:h-[520px] p-4 sm:p-6">
              {renderChart()}
            </div>
          </div>

          {/* RIGHT – Buy/Sell (unchanged) */}
          <div className="xl:col-span-4 rounded-xl bg-white dark:bg-[#161b22] shadow-lg">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("buy")}
                className={`flex-1 py-4 text-center font-semibold transition ${activeTab === "buy" ? "border-b-2 border-red-600 text-red-600" : "text-gray-600 dark:text-gray-400 hover:text-red-600"}`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab("sell")}
                className={`flex-1 py-4 text-center font-semibold transition ${activeTab === "sell" ? "border-b-2 border-red-600 text-red-600" : "text-gray-600 dark:text-gray-400 hover:text-red-600"}`}
              >
                Sell
              </button>
            </div>
            <div className="space-y-5 p-4 sm:p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price (USDT)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (RTC)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePercent(p)}
                    className="rounded-lg bg-red-50 dark:bg-red-900/30 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition"
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-semibold">{total} USDT</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Balance</span>
                <span>{balance.toFixed(2)} USDT</span>
              </div>
              <button
                onClick={handleMarketAction}
                className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-500 py-4 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:scale-[1.02] hover:shadow-red-500/50 active:scale-95"
              >
                {activeTab === "buy" ? "Buy RTC" : "Sell RTC"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Rest of the page ─────────────────────────────────── */}
        {/* Market Overview, Order Book, Top Markets, Features unchanged – we'll keep them but update RTC labels */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl bg-white dark:bg-[#161b22] p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold">Market Overview</h2>
            <div className="space-y-4">
              {[
                ["Market Cap", `$${(marketData.marketCap / 1000000).toFixed(2)}M`],
                ["Circulating Supply", `${(marketData.circulatingSupply / 1000000).toFixed(2)}M RTC`],
                ["Max Supply", `${(marketData.maxSupply / 1000000).toFixed(2)}M RTC`],
                ["Holders", "14,820"],
                ["All-Time High", `$${marketData.ath.toFixed(4)}`],
                ["All-Time Low", `$${marketData.atl.toFixed(4)}`],
                ["Rank", `#${marketData.rank}`],
              ].map(([title, value]) => (
                <div
                  key={title}
                  className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#161b22] p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold">Order Book</h2>
            <div className="grid gap-4 text-sm">
              <div className="rounded-2xl bg-gray-50 dark:bg-[#0f172a] p-4">
                <p className="text-sm text-gray-500">Best Bid</p>
                <p className="mt-2 text-lg font-semibold text-green-600">${price.toFixed(4)}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-[#0f172a] p-4">
                <p className="text-sm text-gray-500">Best Ask</p>
                <p className="mt-2 text-lg font-semibold text-red-600">${price.toFixed(4)}</p>
              </div>
              <p className="text-sm text-gray-500">Only the RTC/USDT pair is available on this market page.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white dark:bg-[#161b22] p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold">Top Markets</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm text-gray-600 dark:text-gray-400">
                  <th className="pb-3 font-semibold">Pair</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Change</th>
                  <th className="pb-3 font-semibold">Volume</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["RTC/USDT", price.toFixed(4), `${isPositive ? "+" : ""}${change24h.toFixed(2)}%`, `${(marketData.circulatingSupply * price / 1000 / 1000).toFixed(1)}M`],
                ].map((coin) => (
                  <tr
                    key={coin[0]}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="py-4 font-semibold">{coin[0]}</td>
                    <td>{coin[1]}</td>
                    <td className={coin[2].startsWith("+") ? "text-green-500" : "text-red-500"}>
                      {coin[2]}
                    </td>
                    <td>{coin[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Fast Trading", "Execute buy and sell orders instantly with minimal latency."],
            ["Low Fees", "Enjoy competitive trading fees on every transaction."],
            ["High Liquidity", "Large trading volume ensures smooth order execution."],
            ["Secure Platform", "Industry-standard security keeps your assets protected."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="group rounded-xl bg-white dark:bg-[#161b22] p-6 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-red-500/10"
            >
              <h3 className="mb-3 text-xl font-bold group-hover:text-red-600 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ─── STYLES ────────────────────────────────────────── */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}