import Image from "next/image";
import Link from "next/link";
import { FaTwitter, FaTelegram, FaDiscord, FaYoutube } from "react-icons/fa";

const companyLinks = [
  { name: "About", href: "/about" },
  { name: "Features", href: "/features" },
  { name: "Roadmap", href: "/roadmap" },
  { name: "Tokenomics", href: "/tokenomics" },
  { name: "Careers", href: "/careers" },
];

const resourceLinks = [
  { name: "Whitepaper", href: "/whitepaper" },
  { name: "Documentation", href: "/documentation" },
  { name: "API", href: "/api-docs" },
  { name: "Blog", href: "/blog" },
  { name: "Support", href: "/support" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  { name: "Cookies", href: "/cookies" },
];

// Updated socials with icons and names
const socialIcons = [
  {
    name: "Twitter",
    icon: <FaTwitter className="h-5 w-5" />,
    href: "#",
  },
  {
    name: "Telegram",
    icon: <FaTelegram className="h-5 w-5" />,
    href: "#",
  },
  {
    name: "Discord",
    icon: <FaDiscord className="h-5 w-5" />,
    href: "#",
  },
  {
    name: "YouTube",
    icon: <FaYoutube className="h-5 w-5" />,
    href: "#",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0B0B0B] text-white">
      {/* Top */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="object-cover rounded-full w-12 h-12"
              />

              <div>
                <h2 className="text-2xl font-bold text-red-500">
                  Ratel Coin
                </h2>

                <p className="text-xs uppercase tracking-[3px] text-gray-400">
                  Tech Ecosystem
                </p>
              </div>
            </div>

            <p className="mt-6 leading-7 text-gray-400">
              Building the world's largest decentralized technology
              ecosystem powered by one digital currency.
            </p>

            {/* Socials Container with Labels */}
            <div className="mt-8 flex flex-wrap gap-6">
              {socialIcons.map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-1.5">
                  <Link
                    href={item.href}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 transition hover:bg-red-600"
                  >
                    {item.icon}
                  </Link>
                  <span className="text-[10px] font-medium text-gray-400">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-6 text-xl font-bold">
              Company
            </h3>

            <div className="space-y-4">
              {companyLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-400 transition hover:text-red-400"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-6 text-xl font-bold">
              Resources
            </h3>

            <div className="space-y-4">
              {resourceLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-400 transition hover:text-red-400"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold">
              Stay Updated
            </h3>

            <p className="mt-5 text-gray-400 leading-7">
              Subscribe to receive product updates,
              announcements and ecosystem news.
            </p>

            <div className="mt-8">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none placeholder:text-gray-500 focus:border-red-500"
              />

              <Link
                href="/subscribe"
                className="mt-4 block w-full rounded-xl bg-red-600 py-4 text-center font-semibold transition hover:bg-red-700"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-14 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Ratel Coin. All Rights Reserved.
          </p>

          <div className="flex flex-wrap gap-8">
            {legalLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-500 transition hover:text-red-400"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}