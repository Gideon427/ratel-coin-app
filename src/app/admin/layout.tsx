"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  Store,
  ArrowUpDown,
  ChartLine,
  Shield,
  Headset,
  Settings,
  Lock,
  Unlock,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

// ─── Sidebar nav items ──────────────────────────────────
type NavItem = {
  name: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", icon: Home, href: "/admin" },
  { name: "User Management", icon: Users, href: "/admin/users" },
  { name: "Marketplace Management", icon: Store, href: "/admin/marketplace" },
  {
    name: "Transactions",
    icon: ArrowUpDown,
    children: [
      { name: "Deposits", icon: ArrowUpDown, href: "/admin/transactions/deposits" },
      { name: "Withdrawals", icon: ArrowUpDown, href: "/admin/transactions/withdrawals" },
      { name: "Transfers", icon: ArrowUpDown, href: "/admin/transactions/transfers" },
    ],
  },
  { name: "Revenue & Analytics", icon: ChartLine, href: "/admin/revenue" },
  { name: "Security Center", icon: Shield, href: "/admin/security" },
  { name: "Support Center", icon: Headset, href: "/admin/support" },
  { name: "System Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [adminDark, setAdminDark] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarOpen");
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }
    const dark = localStorage.getItem("adminDarkMode");
    if (dark !== null) setAdminDark(dark === "true");

    const handleDarkChange = () => {
      const v = localStorage.getItem("adminDarkMode");
      setAdminDark(v === "true");
    };

    window.addEventListener("admin-dark-mode-changed", handleDarkChange);
    window.addEventListener("storage", handleDarkChange);

    return () => {
      window.removeEventListener("admin-dark-mode-changed", handleDarkChange);
      window.removeEventListener("storage", handleDarkChange);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("adminSidebarOpen", JSON.stringify(newState));
  };

  const toggleDarkMode = () => {
    const newDark = !adminDark;
    setAdminDark(newDark);
    localStorage.setItem("adminDarkMode", JSON.stringify(newDark));
    window.dispatchEvent(new Event("admin-dark-mode-changed"));
  };

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0";
    window.location.href = "/admin/login";
  };

  const isExpanded = isSidebarOpen || (!isSidebarOpen && isHovered);

  // ─── Sidebar content (shared between desktop and mobile) ──
  const SidebarContent = () => (
    <>
      {/* Logo + Toggle Button (desktop only) */}
      <div className="flex items-center w-full gap-3 mb-6">
        <Link
          href="/admin"
          className={`flex items-center ${isExpanded ? "gap-3" : "justify-center flex-1"}`}
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="w-10 h-10 shrink-0"
          />
          {isExpanded && (
            <div>
              <h2 className="text-lg font-bold text-red-600 leading-tight">
                Ratel Admin
              </h2>
              <p className={`text-xs ${adminDark ? "text-gray-400" : "text-gray-400"}`}>
                Control Panel
              </p>
            </div>
          )}
        </Link>

        {/* Lock/Unlock button – only shown on desktop */}
        <button
          onClick={toggleSidebar}
          className={`hidden lg:flex p-2 rounded-lg transition ${
            adminDark
              ? "text-gray-400 hover:bg-gray-700"
              : "text-gray-600 hover:bg-gray-100"
          } shrink-0 ${!isExpanded && "ml-auto"}`}
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Unlock className="w-4 h-4" />
          )}
          {isExpanded && (
            <span className="ml-2 text-xs font-medium">
              {isSidebarOpen ? "Set Close" : "Set Open"}
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openDropdowns[item.name] || false;
          const isActive = hasChildren
            ? item.children!.some((child) => pathname === child.href)
            : pathname === item.href;

          if (hasChildren) {
            return (
              <div key={item.name} className="w-full">
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={`
                    flex items-center justify-between w-full rounded-xl px-3 py-3 text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-red-600 text-white shadow-md shadow-red-200"
                        : adminDark
                        ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                        : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                    }
                    ${!isExpanded && "justify-center"}
                  `}
                  title={!isExpanded ? item.name : undefined}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 shrink-0" />
                    {isExpanded && <span>{item.name}</span>}
                  </div>
                  {isExpanded && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {isExpanded && isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href!}
                          className={`
                            flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                            ${
                              isChildActive
                                ? "bg-red-50 text-red-600"
                                : adminDark
                                ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                                : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                            }
                          `}
                        >
                          <child.icon className="w-4 h-4 shrink-0" />
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-200"
                    : adminDark
                    ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                    : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                }
                ${!isExpanded && "justify-center"}
              `}
              title={!isExpanded ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isExpanded && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Card */}
      {isExpanded ? (
        <div className="mt-auto pt-6 w-full">
          <div
            className={`rounded-2xl p-5 ${
              adminDark
                ? "bg-gray-700 text-gray-200"
                : "bg-gradient-to-br from-red-600 to-red-500 text-white"
            }`}
          >
            <p className="text-xs font-medium">Admin Access</p>
            <h3 className="mt-2 text-lg font-bold">Super User</h3>
            <p className="mt-1 text-xs opacity-80">Full system control</p>
          </div>
        </div>
      ) : (
        <div className="mt-auto pt-6 w-full flex justify-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${
              adminDark
                ? "bg-gray-700 text-gray-300"
                : "bg-gradient-to-br from-red-600 to-red-500 text-white shadow-red-200"
            }`}
          >
            A
          </div>
        </div>
      )}
    </>
  );

  // ─── Render ────────────────────────────────────────────
  return (
    <div className={adminDark ? "dark" : ""}>
      <div className={adminDark ? "bg-gray-900 text-gray-100 min-h-screen" : "bg-gray-50 min-h-screen"}>
        {/* ─── TOP BAR ────────────────────────────────────── */}
        <header
          className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 sm:px-6 ${
            adminDark
              ? "border-gray-700 bg-gray-800 text-gray-100"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger menu – visible on mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Image
              src="/images/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-bold text-red-600 hidden sm:inline">Admin Panel</span>
            <span className="text-lg font-bold text-red-600 sm:hidden">Admin</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className={`rounded-lg p-2 transition ${
                adminDark
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={adminDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {adminDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-red-600 px-3 sm:px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ─── LAYOUT ────────────────────────────────────── */}
        <div className="flex gap-6 px-4 sm:px-6 py-6 relative">
          {/* ─── DESKTOP SIDEBAR ─────────────────────────── */}
          <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              hidden lg:flex flex-col transition-all duration-300 ease-in-out
              ${
                isExpanded
                  ? "w-[260px] p-5"
                  : "w-[72px] p-3 items-center"
              }
              h-[calc(100vh-7rem)] sticky top-20 self-start overflow-y-auto
              ${
                adminDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }
              rounded-2xl shadow-sm border
            `}
          >
            <SidebarContent />
          </aside>

          {/* ─── MOBILE SIDEBAR (overlay drawer) ──────────── */}
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              {/* Drawer */}
              <div
                className={`
                  fixed top-0 left-0 z-50 w-72 h-full overflow-y-auto
                  transform transition-transform duration-300 ease-in-out
                  ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                  ${
                    adminDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }
                  border-r shadow-xl p-5
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    <span className="text-lg font-bold text-red-600">Ratel Admin</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {/* Reuse the same content but force expanded */}
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <nav className="flex-1 w-full space-y-1">
                      {navItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isActive = hasChildren
                          ? item.children!.some((child) => pathname === child.href)
                          : pathname === item.href;

                        if (hasChildren) {
                          return (
                            <div key={item.name} className="w-full">
                              <button
                                onClick={() => toggleDropdown(item.name)}
                                className={`
                                  flex items-center justify-between w-full rounded-xl px-3 py-3 text-sm font-medium transition
                                  ${
                                    isActive
                                      ? "bg-red-600 text-white shadow-md shadow-red-200"
                                      : adminDark
                                      ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                                      : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                                  }
                                `}
                              >
                                <div className="flex items-center gap-3">
                                  <item.icon className="w-5 h-5 shrink-0" />
                                  <span>{item.name}</span>
                                </div>
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    openDropdowns[item.name] ? "rotate-90" : ""
                                  }`}
                                />
                              </button>

                              {openDropdowns[item.name] && (
                                <div className="ml-6 mt-1 space-y-1">
                                  {item.children!.map((child) => {
                                    const isChildActive = pathname === child.href;
                                    return (
                                      <Link
                                        key={child.name}
                                        href={child.href!}
                                        onClick={() => setMobileSidebarOpen(false)}
                                        className={`
                                          flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                                          ${
                                            isChildActive
                                              ? "bg-red-50 text-red-600"
                                              : adminDark
                                              ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                                              : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                                          }
                                        `}
                                      >
                                        <child.icon className="w-4 h-4 shrink-0" />
                                        <span>{child.name}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={item.name}
                            href={item.href!}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={`
                              flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                              ${
                                isActive
                                  ? "bg-red-600 text-white shadow-md shadow-red-200"
                                  : adminDark
                                  ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                                  : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                              }
                            `}
                          >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── MAIN CONTENT ────────────────────────────────── */}
          <section className="flex-1 min-w-0 pb-20 lg:pb-0">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}