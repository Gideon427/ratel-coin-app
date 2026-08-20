"use client";

import Image from "next/image";
import Section from "./Section";
import {
  FaLock,
  FaNetworkWired,
  FaShieldAlt,
  FaEye,
  FaWallet,
  FaLink,
  FaKey,
} from "react-icons/fa";
import { motion, type Variants, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";

const securityFeatures = [
  {
    title: "Military-Grade Encryption",
    description:
      "Every transaction is protected with industry-leading encryption to keep your assets safe.",
    icon: <FaLock size={36} className="text-red-600" />,
  },
  {
    title: "Decentralized Network",
    description:
      "No single point of failure. Your assets remain protected by a distributed blockchain.",
    icon: <FaNetworkWired size={36} className="text-red-600" />,
  },
  {
    title: "Smart Contract Audited",
    description:
      "Our smart contracts undergo rigorous testing and security reviews before deployment.",
    icon: <FaShieldAlt size={36} className="text-red-600" />,
  },
  {
    title: "24/7 Monitoring",
    description:
      "Continuous monitoring helps identify and prevent suspicious activities in real time.",
    icon: <FaEye size={36} className="text-red-600" />,
  },
];

// Stats data – now with numeric values, suffix, and decimal places
const stats = [
  { label: "Encryption", value: 256, suffix: "-bit", decimals: 0 },
  { label: "System Uptime", value: 99.99, suffix: "%", decimals: 2 },
  { label: "Threat Monitoring", value: 24, suffix: "/7", decimals: 0 },
  { label: "Decentralized", value: 100, suffix: "%", decimals: 0 },
];

// 🔢 Reusable animated number component
const AnimatedNumber = ({ 
  value, 
  suffix, 
  decimals = 0, 
  isInView, 
  delay = 0 
}: { 
  value: number; 
  suffix: string; 
  decimals?: number; 
  isInView: boolean; 
  delay?: number; 
}) => {
  const count = useMotionValue(0);

  // Format the number with the suffix
  const formatted = useTransform(count, (latest) => {
    return latest.toFixed(decimals) + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, {
        duration: 2,
        delay: delay,
        ease: "easeOut",
      });
      return animation.stop;
    }
  }, [isInView, value, count, delay]);

  return <motion.span>{formatted}</motion.span>;
};

export default function Security({ delay = 0 }: { delay?: number }) {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <Section className="relative overflow-hidden bg-gray-50 py-16 sm:py-28" delay={delay}>
      {/* Background Glow */}
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-100 blur-[140px] opacity-60" />
      <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-red-50 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* LEFT CONTENT (unchanged) */}
          <div>
            <span className="inline-flex rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-600">
              TRUSTED. SECURE. BUILT FOR YOU.
            </span>

            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Your Trust is Our
              <span className="block text-red-600">Top Priority</span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Ratel Coin is built with bank‑level security, decentralized
              infrastructure, and complete transparency to give you a safe and
              trustworthy experience.
            </p>

            <div className="mt-10 grid gap-6">
              {securityFeatures.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-5 rounded-2xl bg-white p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 sm:h-16 sm:w-16">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT – SPINNING ICONS (unchanged) */}
          <div className="relative flex justify-center">
            <div className="relative aspect-square w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[620px]">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-200" />
              <div className="absolute inset-[10%] rounded-full border border-red-100" />

              <div className="absolute left-1/2 top-1/2 flex h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-2xl">
                <Image
                  src="/images/security-shiel.png"
                  alt="Security Shield"
                  width={220}
                  height={220}
                  className="h-auto w-3/4 object-contain"
                />
              </div>

              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-3 shadow-xl sm:h-16 sm:w-16 sm:p-4">
                    <FaLock size={32} className="text-red-600 animate-spin-reverse-slow" />
                  </div>
                </div>
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-3 shadow-xl sm:h-16 sm:w-16 sm:p-4">
                    <FaWallet size={32} className="text-red-600 animate-spin-reverse-slow" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-3 shadow-xl sm:h-16 sm:w-16 sm:p-4">
                    <FaLink size={32} className="text-red-600 animate-spin-reverse-slow" />
                  </div>
                </div>
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-3 shadow-xl sm:h-16 sm:w-16 sm:p-4">
                    <FaKey size={32} className="text-red-600 animate-spin-reverse-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <motion.div
          ref={statsRef}
          variants={containerVariants}
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          className="mt-16 grid gap-6 sm:mt-24 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                rotateX: 2,
                rotateY: 4,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-3xl bg-white p-6 text-center shadow-lg transition-all sm:p-8"
            >
              <h3 className="text-3xl font-bold text-red-600 sm:text-4xl lg:text-5xl">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  isInView={isStatsInView}
                  delay={index * 0.15} // stagger the counting
                />
              </h3>
              <p className="mt-2 text-gray-600 sm:mt-3">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 20s linear infinite;
        }
      `}</style>
    </Section>
  );
}
