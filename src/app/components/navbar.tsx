"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FaCubes,
  FaHome,
  FaCog,
  FaInfoCircle,
  FaChartLine,
  FaCalendarAlt,
  FaBook,
} from "react-icons/fa";

const navLinks = [
  { icon: FaHome, href: "/" },
  { icon: FaCog, label: "Features", href: "/features" },
  { icon: FaInfoCircle, label: "About", href: "/about" }
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginClick = () => {
    setMenuOpen(false);
    router.push("/login");
  };

  const handleSignupClick = () => {
    setMenuOpen(false);
    router.push("/signup");
  };

  const isLinkActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-red-100 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={42}
            height={42}
          />

          <div>
            <h1 className="text-xl font-bold text-red-600">
              Ratel Coin
            </h1>
            <p className="text-[10px] uppercase tracking-[3px] text-gray-500">
              The Wallet Of Tech Ecosystem
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-medium transition ${
                isLinkActive(item.href)
                  ? "text-red-600"
                  : "text-gray-700 hover:text-red-600"
              }`}
            >
              {item.href === "/" ? (
                <item.icon className="h-7 w-7" />
              ) : (
                item.label
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={handleLoginClick}
            className="rounded-full border border-red-200 px-6 py-2 text-red-600 transition hover:bg-red-50"
          >
            Log In
          </button>

          <button
            onClick={handleSignupClick}
            className="rounded-full bg-red-600 px-6 py-2 text-white transition hover:bg-red-700"
          >
            Create Account
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col justify-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-6 bg-red-600 transition ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-red-600 transition ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-red-600 transition ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-red-100 bg-white shadow-lg">
          <div className="flex flex-col space-y-5 px-6 py-6">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 font-medium transition ${
                  isLinkActive(item.href)
                    ? "text-red-600"
                    : "text-gray-700 hover:text-red-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            <hr className="border-red-100" />

            <button
              onClick={handleLoginClick}
              className="rounded-full border border-red-200 py-3 text-red-600 transition hover:bg-red-50"
            >
              Log In
            </button>

            <button
              onClick={handleSignupClick}
              className="rounded-full bg-red-600 py-3 text-white transition hover:bg-red-700"
            >
              Create Account
            </button>
          </div>
        </div>
      )}
    </header>
  );
}