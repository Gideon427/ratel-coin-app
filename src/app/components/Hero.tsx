"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Users, Wallet, Globe, Shield } from "lucide-react";
import Section from "./Section";
import { useState, useEffect } from "react";

const ecosystemIcons = [
  { name: "AI Tools", image: "/images/ai-tools.png", support: "AI support assistance – smart automation and analytics." },
  { name: "Movies", image: "/images/movie.png", support: "Movies support – streaming, rights management and pay‑per‑view." },
  { name: "Music", image: "/images/music.png", support: "Music support – artist royalties, distribution and NFT drops." },
  { name: "Marketing", image: "/images/marketing.png", support: "Marketing support – campaign management and ad analytics." },
  { name: "Blogging", image: "/images/blogging.png", support: "Blogging support – monetisation, content creation and IPFS storage." },
  { name: "Social Media", image: "/images/social-media.png", support: "Social media support – community engagement and reward systems." },
];

const positions = [
  { top: 10, left: 50 },
  { top: 30, left: 84.6 },
  { top: 70, left: 84.6 },
  { top: 90, left: 50 },
  { top: 70, left: 15.4 },
  { top: 30, left: 15.4 },
];

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const statItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.06, duration: 0.45, ease: "easeOut" } }),
};

export default function Hero({ delay = 0 }: { delay?: number }) {
  const statsItems = [
    { title: "250K+", subtitle: "Community Members", icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" /> },
    { title: "1.2M+", subtitle: "Active Wallets", icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" /> },
    { title: "150+", subtitle: "Countries", icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" /> },
    { title: "100%", subtitle: "Secure", icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" /> },
  ];

  const [popup, setPopup] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });

  useEffect(() => {
    if (popup.visible) {
      const timer = setTimeout(() => {
        setPopup({ visible: false, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popup.visible]);

  const handleIconClick = (supportText: string) => {
    setPopup({ visible: true, message: supportText });
  };

  return (
    <Section className="relative overflow-hidden bg-white" delay={delay}>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }

        @keyframes spin-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .orbit {
          animation: spin-orbit 30s linear infinite;
          transform-origin: center;
        }
        .orbit-item {
          animation: spin-reverse 30s linear infinite;
          transform-origin: center;
        }

        /* Mobile‑only vertical stretch on "Tech Solutions" */
        @media (max-width: 640px) {
          .stretch-mobile {
            display: inline-block;
            font-weight: 900;
            transform: scaleY(1.25);
            transform-origin: center;
            letter-spacing: 0.02em;
          }
        }
      `}</style>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-20">
        {/* LEFT SIDE */}
        <div>
          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 sm:px-4 sm:py-2 sm:text-sm">
            Powered by Innovation. Built for the Future.
          </span>

          <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-7xl">
            <span className="block sm:inline">The Currency of the</span>
            <span className="block text-red-600 stretch-mobile">Tech Solutions</span>
            <span className="block sm:inline">Ecosystem</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            Ratel Coin connects the world of technology, entertainment and digital
            solutions through one powerful, secure and decentralized currency.
          </p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5"
          >
            <motion.div variants={buttonVariants} className="w-full sm:w-auto">
              <Link
                href="/buy"
                className="block w-full rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-xl shadow-red-300 transition hover:bg-red-700 sm:px-8 sm:py-4 sm:text-base"
              >
                Buy Ratel Coin
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} className="w-full sm:w-auto">
              <Link
                href="/ecosystem"
                className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-800 transition hover:border-red-500 hover:text-red-600 sm:px-8 sm:py-4 sm:text-base"
              >
                Explore Ecosystem
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats ticker */}
          <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-4 shadow-xl overflow-hidden sm:p-6">
            <div className="flex w-max animate-scroll">
              {[...statsItems, ...statsItems].map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  custom={index}
                  variants={statItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="mx-4 flex-shrink-0 text-center flex flex-col items-center sm:mx-6"
                >
                  <div className="mb-1">{item.icon}</div>
                  <h3 className="text-lg font-bold text-red-600 sm:text-xl md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 sm:text-sm">{item.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Orbiting Icons */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[560px] aspect-square">
            <div className="absolute inset-0 rounded-full border-2 border-red-200">
              <div className="absolute left-1/2 top-1/2 w-[65%] h-[65%] -translate-x-1/2 -translate-y-1/2">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                >
                  <source src="/videos/wallet.mp4" type="video/mp4" />
                  <Image
                    src="/images/wallet.png"
                    alt="Wallet"
                    fill
                    className="object-contain"
                  />
                </video>
              </div>

              <div className="absolute inset-0 orbit">
                {ecosystemIcons.map((icon, index) => {
                  const pos = positions[index];
                  return (
                    <div
                      key={icon.name}
                      className="absolute cursor-pointer"
                      style={{
                        top: `${pos.top}%`,
                        left: `${pos.left}%`,
                      }}
                      onClick={() => handleIconClick(icon.support)}
                      onKeyDown={(e) => e.key === "Enter" && handleIconClick(icon.support)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Tap for ${icon.name} support`}
                    >
                      <div className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="orbit-item flex flex-col items-center gap-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg ring-1 ring-red-100 sm:h-16 sm:w-16 md:h-20 md:w-20 transition hover:scale-105 active:scale-95">
                            <Image
                              src={icon.image}
                              alt={icon.name}
                              width={30}
                              height={30}
                              className="sm:w-9 sm:h-9 md:w-11 md:h-11"
                            />
                          </div>
                          <p className="text-[10px] font-medium text-gray-600 sm:text-xs md:text-sm">
                            {icon.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 sm:h-4 sm:w-4"></span>
              <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-red-500 sm:h-4 sm:w-4"></span>
              <span className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 sm:h-4 sm:w-4"></span>
              <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-red-500 sm:h-4 sm:w-4"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Toast */}
      {popup.visible && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-2xl bg-gray-900/90 px-6 py-4 text-center text-white shadow-2xl backdrop-blur-md transition-all duration-300 sm:bottom-10">
          <p className="text-sm font-medium sm:text-base">{popup.message}</p>
        </div>
      )}
    </Section>
  );
}