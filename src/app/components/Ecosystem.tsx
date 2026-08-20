"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Section from "./Section";

const ecosystem = [
  {
    title: "AI Tools",
    description: "Powerful AI products and automation services.",
    image: "/images/ai-too.png",
  },
  {
    title: "Movies",
    description: "Streaming and entertainment powered by Ratel Coin.",
    image: "/images/movie.png",
  },
  {
    title: "Music",
    description: "Support artists with instant crypto payments.",
    image: "/images/music.png",
  },
  {
    title: "Social Media",
    description: "Reward creators and engage communities.",
    image: "/images/social-media.png",
  },
  {
    title: "Marketing",
    description: "Advertising and digital campaigns within the ecosystem.",
    image: "/images/marketing.png",
  },
  {
    title: "Blogging",
    description: "Publish, monetize and earn with decentralized payments.",
    image: "/images/blogging.png",
  },
];

const ecosystemVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const ecosystemCard: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const centerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Ecosystem({ delay = 0 }: { delay?: number }) {
  return (
    <Section className="py-16 md:py-28 bg-white relative overflow-hidden" delay={delay}>
      {/* Background Decoration */}
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-100 blur-[120px] opacity-60" />
      <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-red-50 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-red-100 px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-red-600">
            Our Ecosystem
          </span>

          <h2 className="mt-4 md:mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
            One Coin.
            <span className="text-red-600"> Endless Possibilities.</span>
          </h2>

          <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 leading-7 md:leading-8">
            Ratel Coin connects multiple digital industries into one seamless
            ecosystem where payments, ownership and innovation work together.
          </p>
        </div>

        {/* Layout */}
        <div className="mt-16 md:mt-24 grid lg:grid-cols-3 gap-6 md:gap-10 items-start lg:items-center">
          
          {/* Left Cards - FULL IMAGES (object-contain) */}
          <motion.div
            className="space-y-4 md:space-y-6"
            variants={ecosystemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {ecosystem.slice(0, 3).map((item) => (
              <motion.div
                key={item.title}
                variants={ecosystemCard}
                className="rounded-2xl md:rounded-3xl border border-red-100 bg-white p-4 md:p-5 shadow-lg hover:shadow-2xl transition flex flex-col"
              >
                {/* CHANGE: object-contain ensures the ENTIRE image is shown without cropping */}
                <div className="w-full h-40 md:h-44 lg:h-48 rounded-xl md:rounded-2xl border border-gray-100 bg-white overflow-hidden relative flex-shrink-0 mb-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>

                <h3 className="font-bold text-lg md:text-xl text-gray-900">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm md:text-base mt-1 md:mt-2">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Center Illustration (RESTORED - Kept exactly as it was) */}
          <motion.div
            className="relative flex justify-center my-8 lg:my-0"
            variants={centerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative h-[280px] w-[280px] md:h-[420px] md:w-[420px] lg:h-[520px] lg:w-[520px]">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-200"></div>
              <div className="absolute inset-8 rounded-full border border-red-100"></div>

              <div className="absolute left-1/2 top-1/2 h-40 w-40 md:h-56 md:w-56 lg:h-72 lg:w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-50 shadow-2xl flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Ecosystem"
                  width={220}
                  height={220}
                  className="object-cover rounded-full w-full h-full"
                />
              </div>

              {/* Floating Icons (unchanged) */}
              <div className="absolute -top-4 md:top-0 lg:top-2 left-1/2 -translate-x-1/2">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-2 md:p-3 lg:p-4">
                  <Image
                    src="/images/ecosystem-ai.png"
                    alt="AI Tools"
                    width={40}
                    height={40}
                    className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10"
                  />
                </div>
              </div>

              <div className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-2 md:p-3 lg:p-4">
                  <Image
                    src="/images/ecosystem-social.png"
                    alt="Social Media"
                    width={40}
                    height={40}
                    className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10"
                  />
                </div>
              </div>

              <div className="absolute -bottom-4 md:bottom-0 left-1/2 -translate-x-1/2">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-2 md:p-3 lg:p-4">
                  <Image
                    src="/images/blogging.png"
                    alt="Blogging"
                    width={40}
                    height={40}
                    className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10"
                  />
                </div>
              </div>

              <div className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-2 md:p-3 lg:p-4">
                  <Image
                    src="/images/ecosystem-movies.png"
                    alt="Movies"
                    width={40}
                    height={40}
                    className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Cards - FULL IMAGES (object-contain) */}
          <motion.div
            className="space-y-4 md:space-y-6"
            variants={ecosystemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {ecosystem.slice(3).map((item) => (
              <motion.div
                key={item.title}
                variants={ecosystemCard}
                className="rounded-2xl md:rounded-3xl border border-red-100 bg-white p-4 md:p-5 shadow-lg hover:shadow-2xl transition flex flex-col"
              >
                {/* CHANGE: object-contain ensures the ENTIRE image is shown without cropping */}
                <div className="w-full h-40 md:h-44 lg:h-48 rounded-xl md:rounded-2xl border border-gray-100 bg-white overflow-hidden relative flex-shrink-0 mb-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>

                <h3 className="font-bold text-lg md:text-xl text-gray-900">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm md:text-base mt-1 md:mt-2">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-20 flex justify-center">
          <Link
            href="/ecosystem"
            className="rounded-xl bg-red-600 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base text-white font-semibold shadow-lg hover:bg-red-700 transition"
          >
            Explore the Ecosystem
          </Link>
        </div>
      </div>
    </Section>
  );
}