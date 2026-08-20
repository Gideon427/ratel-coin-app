// components/Section.tsx
"use client";
import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
}

export default function Section({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: SectionProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 60 : 0,
      x: direction === "left" ? -60 : direction === "right" ? 60 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut" as const,
        delay,
      },
    },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.section>
  );
}