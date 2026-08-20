"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import Section from "./Section";

const ratelFeatures = [
  "Instant transactions",
  "Ultra-low network fees",
  "Secure decentralized wallet",
  "Built-in AI ecosystem",
  "Movies & entertainment",
  "Music platform integration",
  "Social media rewards",
  "Marketing marketplace",
  "Creator economy support",
  "Scalable blockchain",
];

const traditionalFeatures = [
  "Slow international transfers",
  "High transaction fees",
  "Centralized systems",
  "No AI integration",
  "Separate payment methods",
  "Limited creator support",
  "Platform restrictions",
  "Banking delays",
  "Regional limitations",
  "Legacy infrastructure",
];

// Card container staggered entrance
const comparisonVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.18 } },
};

const comparisonCard: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

// Stats staggered entrance
const statsContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const statsItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Comparison({ delay = 0 }: { delay?: number }) {
  return (
    // If Section doesn't use delay, you can omit it; keeping it is harmless.
    <Section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-700 py-28" delay={delay}>
      {/* Background decorations */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center text-white">
          <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold backdrop-blur">
            SMARTER CHOICE GREATER VALUE
          </span>

          <h2 className="mt-6 text-4xl font-extrabold lg:text-5xl">
            Why Pay More? Choose Ratel Coin.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-red-100">
            Ratel Coin delivers lower transaction fees, faster speeds, and seamless tokenomics across the ecosystem.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          className="mt-20 grid gap-10 lg:grid-cols-2"
          variants={comparisonVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Traditional Finance Card */}
          <motion.div variants={comparisonCard} className="rounded-3xl bg-white p-10 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <Image
                  src="/images/traditional.png"
                  alt="Traditional Finance icon"
                  width={40}
                  height={40}
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">Traditional Finance</h3>
                <p className="text-gray-500">Old banking infrastructure</p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              {traditionalFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-4"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600"
                    aria-label="Not available"
                  >
                    ✕
                  </span>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Ratel Coin Card */}
          <motion.div variants={comparisonCard} className="rounded-3xl bg-white p-10 shadow-2xl ring-4 ring-red-300">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <Image
                  src="/images/logo.png"
                  alt="Ratel Coin logo"
                  width={40}
                  height={40}
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-red-600">Ratel Coin</h3>
                <p className="text-gray-500">Future-ready ecosystem</p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              {ratelFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl bg-red-50 p-4"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white"
                    aria-label="Available"
                  >
                    ✓
                  </span>
                  <span className="font-medium text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Stats – now with staggered entrance */}
        <motion.div
          className="mt-20 grid gap-8 rounded-3xl bg-white/10 p-8 backdrop-blur lg:grid-cols-4"
          variants={statsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={statsItemVariants} className="text-center text-white">
            <h3 className="text-5xl font-bold">99.9%</h3>
            <p className="mt-3 text-red-100">Network Uptime</p>
          </motion.div>

          <motion.div variants={statsItemVariants} className="text-center text-white">
            <h3 className="text-5xl font-bold">&lt;2s</h3>
            <p className="mt-3 text-red-100">Average Transaction</p>
          </motion.div>

          <motion.div variants={statsItemVariants} className="text-center text-white">
            <h3 className="text-5xl font-bold">0.1%</h3>
            <p className="mt-3 text-red-100">Transaction Fee</p>
          </motion.div>

          <motion.div variants={statsItemVariants} className="text-center text-white">
            <h3 className="text-5xl font-bold">24/7</h3>
            <p className="mt-3 text-red-100">Global Availability</p>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}