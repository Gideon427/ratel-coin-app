"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Section from "./Section";
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
    </Section>
  );
}