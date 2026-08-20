"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  Settings,
  Lock,
  Shield,
  Bell,
  Palette,
  Globe,
} from "lucide-react";

const settingTabs = [
  
  { name: "Preferences", icon: Settings, href: "/dashboard/settings/preferences" },// keep old or replace
  { name: "Security Center", icon: Shield, href: "/dashboard/settings/security-center" }, // new
  { name: "Notifications", icon: Bell, href: "/dashboard/settings/notifications" },
  { name: "Appearance", icon: Palette, href: "/dashboard/settings/appearance" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Manage your account preferences and security
        </p>

        {/* Sub‑navigation tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {settingTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all
                    ${
                      isActive
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-white"
                    }
                  `}
                >
                  <tab.icon size={18} />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page content */}
        {children}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}