import Link from "next/link";
import { FaRocket, FaCode, FaGlobe, FaGem } from "react-icons/fa";

export default function RoadmapPage() {
  const phases = [
    { quarter: "Q1 2024", icon: <FaRocket />, title: "Phase 1: Launch", items: ["Concept & Whitepaper", "Community Building", "Smart Contract Audit", "IDO / Presale"] },
    { quarter: "Q2 2024", icon: <FaCode />, title: "Phase 2: Development", items: ["Wallet Beta Launch", "Staking Platform", "Marketplace MVP", "First Ecosystem Partnership"] },
    { quarter: "Q3 2024", icon: <FaGlobe />, title: "Phase 3: Expansion", items: ["Mobile App Release", "Cross-Chain Bridge", "CEX Listings", "Major Marketing Campaign"] },
    { quarter: "Q4 2024", icon: <FaGem />, title: "Phase 4: Maturity", items: ["Full Ecosystem Integration", "DAO Governance", "Ratel AI Tools", "Global Adoption Program"] },
  ];

  return (

      <main className="bg-gray-50 py-26">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold">Our Roadmap</h1>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Charting our course towards mass adoption and a fully decentralized tech ecosystem.</p>
          </div>
          <div className="relative border-l-2 border-red-200 ml-4 md:ml-16 space-y-12">
            {phases.map((phase, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute -left-[33px] top-0 bg-white p-2 rounded-full border-2 border-red-600 text-red-600">
                   {phase.icon}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="text-xl font-bold">{phase.title}</h3><p className="text-red-600 font-semibold text-sm">{phase.quarter}</p></div>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
  );
}