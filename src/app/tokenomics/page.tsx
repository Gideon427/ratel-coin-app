import Link from "next/link";
import { FaChartPie, FaCoins, FaDatabase, FaLock } from "react-icons/fa";

export default function TokenomicsPage() {
  return (
      <main className="max-w-7xl mx-auto px-6 py-26">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold">Tokenomics</h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Understanding the economic model behind Ratel Coin. A sustainable, decentralized, and community-focused token distribution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Pie Chart Visual Representation (Flexbox) */}
          <div className="relative w-64 h-64 mx-auto md:mx-0 rounded-full bg-gray-100 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-[32px] border-red-600 border-r-transparent border-b-transparent rotate-45"></div>
             <div className="absolute inset-0 rounded-full border-[32px] border-blue-500 border-b-transparent border-l-transparent -rotate-45"></div>
             <div className="absolute inset-0 rounded-full border-[32px] border-green-500 border-t-transparent border-r-transparent rotate-[135deg]"></div>
             <div className="w-24 h-24 bg-white rounded-full z-10 flex flex-col items-center justify-center border border-gray-200">
               <FaCoins className="text-red-600 w-6 h-6" />
               <span className="text-xs font-bold">Total Supply</span>
               <span className="text-[10px] text-gray-400">1 Billion</span>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <div><h4 className="font-bold">Ecosystem & Development</h4><p className="text-sm text-gray-500">40% - Funding for growth, partnerships, and platform development.</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <div><h4 className="font-bold">Staking & Rewards</h4><p className="text-sm text-gray-500">25% - Incentives for holders and active participants.</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div><h4 className="font-bold">Team & Advisors</h4><p className="text-sm text-gray-500">15% - Locked vesting schedule to ensure long-term commitment.</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <div><h4 className="font-bold">Public Sale & Liquidity</h4><p className="text-sm text-gray-500">20% - IDO, initial liquidity, and exchange listings.</p></div>
            </div>
          </div>
        </div>
      </main>
  );
}