"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import Section from "./Section";

const imageVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.08, duration: 0.45, ease: "easeOut" } }),
};

export default function Stats({ delay = 0 }: { delay?: number }) {
  return (
    <Section className="relative -mt-10 z-20" delay={delay}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Centered & size‑constrained image */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={imageVariants}
          className="flex justify-center"
        >
          <Image
            src="/images/stats.png"
            alt="Stats Overview"
            width={600}
            height={300}
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto"
          />
        </motion.div>

        {/* Bottom badges – unchanged */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          {[
            "Decentralized & Transparent",
            "Built for Real-World Use",
            "Community Driven Growth",
            "Sustainable & Scalable",
            "Compliant & Secure",
          ].map((text, index) => (
            <motion.div
              key={text}
              custom={index}
              variants={badgeVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              {text}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}