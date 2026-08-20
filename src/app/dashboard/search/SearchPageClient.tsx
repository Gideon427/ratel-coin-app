"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  ArrowRight,
  Wallet,
  Activity,
  Gift,
  Users,
  Settings,
  HelpCircle,
  TrendingUp,
  ArrowUpDown,
  ClipboardList,
  BarChart3,
  Award,
} from "lucide-react";

type SearchResultItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
  icon: string;
};

const searchableData: SearchResultItem[] = [
  { id: "nav-dashboard", title: "Dashboard", description: "Overview of your wallet", category: "Navigation", href: "/dashboard", icon: "Home" },
  { id: "nav-wallet", title: "Wallet", description: "Manage your Ratel Coin", category: "Navigation", href: "/dashboard/wallet", icon: "Wallet" },
  { id: "nav-order-history", title: "Order History", description: "View past transactions", category: "Navigation", href: "/dashboard/order-history", icon: "ClipboardList" },
  { id: "nav-portfolio", title: "Portfolio", description: "Your investment breakdown", category: "Navigation", href: "/dashboard/portfolio", icon: "Activity" },
  { id: "nav-rewards", title: "Rewards", description: "Earn and claim rewards", category: "Navigation", href: "/dashboard/rewards", icon: "Gift" },
  { id: "nav-transactions", title: "Transactions", description: "All your transfers", category: "Navigation", href: "/dashboard/transactions", icon: "ArrowUpDown" },
  { id: "nav-market", title: "Market", description: "Live prices and trading", category: "Navigation", href: "/dashboard/market", icon: "TrendingUp" },
  { id: "nav-analytics", title: "Analytics", description: "Portfolio performance", category: "Navigation", href: "/dashboard/analytics", icon: "BarChart3" },
  { id: "nav-referral", title: "Referral Program", description: "Invite friends and earn", category: "Navigation", href: "/dashboard/referral-program", icon: "Users" },
  { id: "nav-membership", title: "Membership", description: "Your VIP tier", category: "Navigation", href: "/dashboard/membership", icon: "Award" },
  { id: "nav-support", title: "Support", description: "Get help", category: "Navigation", href: "/dashboard/support", icon: "HelpCircle" },
  { id: "nav-settings", title: "Settings", description: "Account preferences", category: "Navigation", href: "/dashboard/settings", icon: "Settings" },
  { id: "coin-rc", title: "Ratel Coin (RTC)", description: "Native token of Ratel ecosystem", category: "Assets", href: "/dashboard/market", icon: "Coin" },
  { id: "coin-btc", title: "Bitcoin (BTC)", description: "Digital gold", category: "Assets", href: "/dashboard/market", icon: "Coin" },
  { id: "coin-eth", title: "Ethereum (ETH)", description: "Smart contract platform", category: "Assets", href: "/dashboard/market", icon: "Coin" },
  { id: "coin-usdt", title: "Tether (USDT)", description: "Stablecoin", category: "Assets", href: "/dashboard/market", icon: "Coin" },
  { id: "tx-1", title: "Bought Ratel Coin", description: "2,500 RTC • -$1,250.00 • Today, 9:41 AM", category: "Transactions", href: "/dashboard/transactions", icon: "ArrowUpDown" },
  { id: "tx-2", title: "Received Rewards", description: "+250 RTC • +$125.00 • Yesterday, 8:15 PM", category: "Transactions", href: "/dashboard/transactions", icon: "ArrowUpDown" },
  { id: "tx-3", title: "Staking Reward", description: "+125 RTC • +$62.50 • May 24, 2025", category: "Transactions", href: "/dashboard/transactions", icon: "ArrowUpDown" },
  { id: "tx-4", title: "Sent Ratel Coin", description: "-1,000 RTC • -$500.00 • May 23, 2025", category: "Transactions", href: "/dashboard/transactions", icon: "ArrowUpDown" },
];

const iconMap: Record<string, React.ElementType> = {
  Home: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10.5V21h5v-6h4v6h5V10.5" /></svg>,
  Wallet,
  ClipboardList,
  Activity,
  Gift,
  ArrowUpDown,
  TrendingUp,
  BarChart3,
  Users,
  Award,
  HelpCircle,
  Settings,
  Coin: Wallet,
};

function getIcon(name: string) {
  const Icon = iconMap[name];
  return Icon ? <Icon className="h-5 w-5 text-gray-500" /> : null;
}

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const filtered = searchableData.filter((item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      );
      setResults(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      router.push(`/dashboard/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/dashboard/search");
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    router.push("/dashboard/search");
  };

  const groupedResults = results.reduce<Record<string, SearchResultItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Search</h1>
          <p className="text-sm text-gray-500">Find anything in your Ratel Coin ecosystem</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for coins, transactions, settings..."
            className="w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-12 py-4 text-lg shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            autoFocus
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          {searchInput && (
            <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 transition">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
          <button type="submit" className="sr-only">Search</button>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-red-600" />
          </div>
        ) : query.trim() === "" ? (
          <div className="py-16 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-gray-500">Type something to start searching</p>
          </div>
        ) : !hasResults ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Search className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">We couldn&apos;t find anything matching &quot;{query}&quot;. Try a different keyword.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category}>
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">{category}</h2>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
                  {items.map((item) => (
                    <Link key={item.id} href={item.href} className="flex items-center gap-4 px-5 py-4 transition hover:bg-red-50 group">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                        {getIcon(item.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 transition group-hover:text-red-600">{item.title}</p>
                        <p className="truncate text-sm text-gray-500">{item.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:text-red-600" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-4 text-center text-xs text-gray-400">
              Found {results.length} result{results.length > 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
