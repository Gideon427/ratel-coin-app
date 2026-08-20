"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Section from "./Section";

const ctaButtonVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ctaBannerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function CTA({ delay = 0 }: { delay?: number }) {
  return (
    <Section className="relative overflow-hidden py-16 sm:py-20 lg:py-28" delay={delay}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-500" />

      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT CONTENT */}
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur sm:px-5 sm:py-2 sm:text-sm">
              Join the Tech Solutions Ecosystem Today
            </span>

            <h2 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Join the Tech Solutions
              <span className="block">Ecosystem Today</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-red-100 sm:text-lg sm:leading-8">
              Whether you&apos;re a creator, investor, or visionary, Ratel Coin gives
              you the tools, speed, and security you need to thrive in the digital
              economy.
            </p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="mt-10 flex flex-wrap gap-4 sm:mt-12 sm:gap-5"
            >
              <motion.div variants={ctaButtonVariants} className="w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="rounded-xl bg-white px-6 py-3 font-bold text-red-600 transition hover:scale-105 sm:px-8 sm:py-4"
                >
                  Create Account
                </Link>
              </motion.div>

              <motion.div variants={ctaButtonVariants} className="w-full sm:w-auto">
                <Link
                  href="/buy"
                  className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 sm:px-8 sm:py-4"
                >
                  Buy Ratel Coin
                </Link>
              </motion.div>
            </motion.div>

            {/* Community Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:mt-14 sm:gap-6 md:gap-8">
              <div>
                <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                  250K+
                </h3>
                <p className="mt-1 text-sm text-red-100 sm:mt-2 sm:text-base">
                  Community
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                  150+
                </h3>
                <p className="mt-1 text-sm text-red-100 sm:mt-2 sm:text-base">
                  Countries
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                  24/7
                </h3>
                <p className="mt-1 text-sm text-red-100 sm:mt-2 sm:text-base">
                  Support
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Responsive Circle & Floating Icons */}
          <div className="relative flex justify-center">
            <div className="relative aspect-square w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
              {/* Outer Rings */}
              <div className="absolute inset-0 rounded-full border border-white/30" />
              <div className="absolute inset-[10%] rounded-full border border-white/20" />

              {/* Video Circle */}
              <div className="absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full rounded-full object-cover"
                >
                  <source src="/videos/cta.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Floating Icons *
              <div className="absolute left-1/2 top-0 -translate-x-1/2">
                <div className="rounded-2xl bg-white p-3 shadow-xl sm:p-4 md:p-5">
                  <Image
                    src="/images/cta.png"
                    alt="Wallet"
                    width={32}
                    height={32}
                    className="h-8 w-8 sm:h-9 sm:w-9 md:h-[42px] md:w-[42px]"
                  />
                </div>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="rounded-2xl bg-white p-3 shadow-xl sm:p-4 md:p-5">
                  <Image
                    src="/images/cta.png"
                    alt="Blockchain"
                    width={32}
                    height={32}
                    className="h-8 w-8 sm:h-9 sm:w-9 md:h-[42px] md:w-[42px]"
                  />
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <div className="rounded-2xl p-3 shadow-xl sm:p-4 md:p-5">
                  <Image
                    src="/images/cta.png"
                    alt="AI"
                    width={32}
                    height={32}
                    className="h-30 w-20 sm:h-8 sm:w-9 md:h-[42px] md:w-[42px]"
                  />
                </div>
              </div>

              <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <div className="rounded-2xl bg-white p-3 shadow-xl sm:p-4 md:p-5">
                  <Image
                    src="/images/cta.png"
                    alt="Globe"
                    width={32}
                    height={32}
                    className="h-8 w-8 sm:h-9 sm:w-9 md:h-[42px] md:w-[42px]"
                  />
                </div>
              </div>*/}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={ctaBannerVariants}
          className="mt-16 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md sm:mt-20 sm:p-8 md:mt-24 md:p-10"
        >
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Start your journey today.
              </h3>
              <p className="mt-2 text-sm text-red-100 sm:mt-3 sm:text-base">
                Download the wallet, join our community and experience the future
                of digital finance.
              </p>
            </div>

            <Link
              href="/signup"
              className="rounded-xl bg-white px-6 py-3 font-bold text-red-600 transition hover:scale-105 sm:px-8 sm:py-4"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}