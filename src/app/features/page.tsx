"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Section from "../components/Section";
import Footer from "../components/Footer";
import { FaBolt, FaWallet, FaRobot, FaCoins, FaGlobe, FaUsers } from "react-icons/fa6";


const features = [
  {
    title: "Lightning Fast Transactions",
    description:
      "Send and receive payments across the ecosystem instantly with minimal fees.",
    icon: FaBolt,
    // 👇 Added slug for dynamic routing
    slug: "lightning-fast-transactions",
  },
  {
    title: "Secure Digital Wallet",
    description:
      "Enterprise-grade security keeps your assets safe with modern encryption.",
    icon: FaWallet,
    slug: "secure-digital-wallet",
  },
  {
    title: "AI Powered Ecosystem",
    description:
      "Integrated with AI tools, automation platforms and digital services.",
    icon: FaRobot,
    slug: "ai-powered-ecosystem",
  },
  {
    title: "Low Transaction Fees",
    description:
      "Affordable transfers designed for creators, businesses and everyday users.",
    icon: FaCoins,
    slug: "low-transaction-fees",
  },
  {
    title: "Global Accessibility",
    description:
      "Access your funds from anywhere in the world using one decentralized currency.",
    icon: FaGlobe,
    slug: "global-accessibility",
  },
  {
    title: "Community Governance",
    description:
      "The future of the ecosystem is shaped together by our growing community.",
    icon: FaUsers,
    slug: "community-governance",
  },
];

const cardsContainer: Variants = {
  hidden: {},
  visible: { 
    transition: { 
      staggerChildren: 0.08, 
      delayChildren: 0.15 
    } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

export default function Features({ delay = 0 }: { delay?: number }) {
  return (
    <Section className="py-28 bg-gradient-to-b from-white to-red-50" delay={delay}>
      <div className="max-w-7xl mx-auto px-6">

        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-600">
            Why Choose Ratel Coin
          </span>

          <h2 className="mt-6 text-4xl lg:text-5xl font-extrabold text-gray-900">
            Built for the Next Generation
            <span className="block text-red-600">
              of Digital Finance
            </span>
          </h2>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            Everything you need to power payments, creators,
            businesses and digital services in one ecosystem.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3"
          variants={cardsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature) => (
            <motion.div
              id={feature.slug}
              key={feature.title}
              variants={cardVariants}
              className="group rounded-3xl border border-red-100 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Large Red Icon Container */}
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-red-200 bg-red-100 text-red-600 transition group-hover:border-red-400 group-hover:bg-red-200">
                <feature.icon className="text-7xl drop-shadow-md" />
              </div>

              <h3 className="mt-8 text-2xl font-bold text-gray-900 group-hover:text-red-600 transition">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                {feature.description}
              </p>
              

              <Link
                href={`/features/${feature.slug}?from=home#${feature.slug}`}
                className="mt-8 inline-block font-semibold text-red-600 hover:translate-x-1 transition"
              >
                Learn More →
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <Footer />
    </Section>
  );
}

{/*import Link from "next/link";
import Image from "next/image";
import {
  FaMoneyBillWave,
  FaShieldAlt,
  FaBolt,
  FaBrain,
  FaStore,
  FaGem,
} from "react-icons/fa";
import Footer from "../components/Footer";

export default function FeaturesPage() {
  const features = [
    {
      icon: <FaMoneyBillWave className="w-8 h-8 text-red-500" />,
      title: "Lower Prices, Higher Value",
      desc: "Enjoy lower platform fees and exclusive discounts across the ecosystem.",
      slug: "lower-prices-higher-value", // Added slug
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-red-500" />,
      title: "Secure Wallet Protection",
      desc: "Your assets are protected with advanced encryption and multi-layer security.",
      slug: "secure-wallet-protection",
    },
    {
      icon: <FaBolt className="w-8 h-8 text-red-500" />,
      title: "Fast Payments, Zero Issues",
      desc: "Lightning-fast transactions with minimal fees, anytime, anywhere.",
      slug: "fast-payments-zero-issues",
    },
    {
      icon: <FaBrain className="w-8 h-8 text-red-500" />,
      title: "Tech Solutions Ecosystem",
      desc: "From AI to marketing, Ratel Coin powers every corner of the digital world.",
      slug: "tech-solutions-ecosystem",
    },
    {
      icon: <FaStore className="w-8 h-8 text-red-500" />,
      title: "Marketplace Integration",
      desc: "Buy, sell, and trade digital products on our decentralized marketplace.",
      slug: "marketplace-integration",
    },
    {
      icon: <FaGem className="w-8 h-8 text-red-500" />,
      title: "Premium Rewards",
      desc: "Stake, earn, and unlock exclusive rewards, VIP access, and more.",
      slug: "premium-rewards",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>

      <div className="min-h-screen bg-white font-sans text-slate-800 overflow-x-hidden">
        {/* ===== INTRO SECTION ===== *
        <section className="relative bg-gradient-to-br from-red-50 via-white to-rose-50 py-20 lg:py-24 overflow-hidden">
          {/* ... Your Intro Section code (unchanged, skipped for brevity) ... *
          <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* ... Your text and image code (unchanged) ... *
          </div>
        </section>

        {/* ===== UPDATED FEATURES GRID ===== *
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block bg-red-50 px-4 py-1.5 rounded-full text-xs font-semibold text-red-600 border border-red-100 mb-4">
                ⚡ ALL-IN-ONE PLATFORM
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Everything You Need,{" "}
                <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                  One Coin
                </span>
              </h2>
              <p className="text-gray-500 mt-4 text-lg">
                Explore the six pillars that make Ratel Coin the powerhouse of digital finance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <Link
                  key={i}
                  href={`/features/${f.slug}`} // Wrapped in Link to go to dynamic page
                  className="block group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-red-100/50 transition-all duration-500 hover:-translate-y-2 hover:border-red-200/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 via-red-50/0 to-rose-50/0 group-hover:from-red-50/30 group-hover:to-rose-50/30 rounded-3xl transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="mb-5 inline-flex p-3 bg-red-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      {f.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-red-600 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                    <div className="mt-6 w-12 h-1 bg-red-200 rounded-full group-hover:w-20 transition-all duration-300" />
                    
                    {/* Added "Learn More" button *
                    <div className="mt-6 inline-block font-semibold text-red-600 group-hover:translate-x-1 transition">
                      Learn More →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* REMOVED the duplicate <Features /> import here to avoid 12 cards! *

        <Footer />
      </div>
    </>
  );
}*/}