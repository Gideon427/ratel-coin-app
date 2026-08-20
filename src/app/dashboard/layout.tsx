"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import { AccountProvider } from "@/lib/AccountContext";
import { getActiveAccount } from "@/lib/authStorage";
import {
  Home,
  Wallet,
  ArrowUpDown,
  Gift,
  ShoppingBag,
  BarChart3,
  Settings,
  Headphones,
  TrendingUp,
  MessageCircle,
  Shield,
  Bell,
  CreditCard,
  User,
  ClipboardList,
  Activity,
  Users,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Menu,
  Lock,
  Unlock,
} from "lucide-react";

// ─── Type for nav items ──────────────────────────────────
type NavItem = {
  name: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
};

// ─── Sidebar nav items ──────────────────────────────────
const navItems: NavItem[] = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
  { name: "Savings", icon: CreditCard, href: "/dashboard/savings" },
  { name: "Order History", icon: ClipboardList, href: "/dashboard/order-history" },
  { name: "rewards", icon: Gift, href: "/dashboard/rewards" },
  { name: "Transactions", icon: ArrowUpDown, href: "/dashboard/wallet/transactions" },
  { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  {
    name: "Market",
    icon: TrendingUp,
    children: [
      { name: "Overview", icon: BarChart3, href: "/dashboard/market" },
      { name: "Portfolio", icon: Activity, href: "/dashboard/portfolio" },
      { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
      { name: "Reports", icon: BarChart3, href: "/dashboard/analytics/reports" },
    ],
  },
  { name: "Referral Program", icon: Gift, href: "/dashboard/referral-program" },
  { name: "Membership", icon: Users, href: "/dashboard/membership" },
  
  { name: "Help Center", icon: Headphones, href: "/dashboard/help-center" },
  { name: "Live Chat", icon: MessageSquare, href: "/dashboard/live-chat" },
  { name: "Account", icon: User, href: "/dashboard/account" },
  { name: "Community Chat", icon: MessageCircle, href: "/dashboard/chat" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

// ─── Mobile bottom nav items ─────────────────────────
const bottomNavItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
  { name: "Transactions", icon: ArrowUpDown, href: "/dashboard/wallet/transactions" },
  { name: "Market", icon: BarChart3, href: "/dashboard/market" },
  { name: "Profile", icon: User, href: "/dashboard/profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [dashboardDark, setDashboardDark] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // ── Help button state ──────────────────────────────────
  const [helpPos, setHelpPos] = useState({ x: 0, y: 0 });
  const [isDraggingHelp, setIsDraggingHelp] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const helpRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const [didDrag, setDidDrag] = useState(false);

  // Load saved position or set default
 useEffect(() => {
  const buttonSize = 56;
  const margin = 16;
  const saved = localStorage.getItem("helpPosition");
  let x, y;
  if (saved) {
    try {
      const pos = JSON.parse(saved);
      x = pos.x;
      y = pos.y;
    } catch (_) {}
  }
  if (x === undefined || y === undefined) {
    x = window.innerWidth - buttonSize - margin;
    y = window.innerHeight - buttonSize - margin;
  }
  // Clamp with margin
  x = Math.max(margin, Math.min(x, window.innerWidth - buttonSize - margin));
  y = Math.max(0, Math.min(y, window.innerHeight - buttonSize));
  // Snap to nearest side
  const halfWidth = window.innerWidth / 2;
  const snapX = x + buttonSize / 2 < halfWidth ? margin : window.innerWidth - buttonSize - margin;
  setHelpPos({ x: snapX, y });
}, []);

// Re‑clamp on window resize
useEffect(() => {
  const handleResize = () => {
    const buttonSize = 56;
    setHelpPos((prev) => ({
      x: Math.max(0, Math.min(prev.x, window.innerWidth - buttonSize)),
      y: Math.max(0, Math.min(prev.y, window.innerHeight - buttonSize)),
    }));
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

useEffect(() => {
  const buttonSize = 56;
  const margin = 16;
  const handleResize = () => {
    setHelpPos((prev) => {
      const newX = Math.max(margin, Math.min(prev.x, window.innerWidth - buttonSize - margin));
      const newY = Math.max(0, Math.min(prev.y, window.innerHeight - buttonSize));
      if (newX === prev.x && newY === prev.y) return prev;
      return { x: newX, y: newY };
    });
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  // Save position on change
  useEffect(() => {
    localStorage.setItem("helpPosition", JSON.stringify(helpPos));
  }, [helpPos]);

  // ── Drag handlers ──────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!helpRef.current) return;
    const rect = helpRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDraggingHelp(true);
    setDidDrag(false);
    // Prevent text selection during drag
    e.preventDefault();
  };

  // Global pointer events
 useEffect(() => {
  const buttonSize = 56;
  const margin = 16; // gap from screen edges

  const onPointerMove = (e: PointerEvent) => {
    if (!isDraggingHelp) return;
    setDidDrag(true);
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    // Clamp with margin
    newX = Math.max(margin, Math.min(newX, window.innerWidth - buttonSize - margin));
    newY = Math.max(0, Math.min(newY, window.innerHeight - buttonSize));
    setHelpPos({ x: newX, y: newY });
  };

  const onPointerUp = () => {
    if (!isDraggingHelp) return;
    setIsDraggingHelp(false);
    setHelpPos((prev) => {
      const halfWidth = window.innerWidth / 2;
      const centerX = prev.x + buttonSize / 2;
      // Snap to left or right with margin
      const snapX = centerX < halfWidth
        ? margin
        : window.innerWidth - buttonSize - margin;
      return { x: snapX, y: prev.y };
    });
  };

  if (isDraggingHelp) {
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  }
  return () => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
  };
}, [isDraggingHelp, dragOffset]);

  // ── Click (navigate) only if not dragged ──────────────
  const handleHelpClick = () => {
    if (didDrag) return;
    // Navigate to support page (you can change to /dashboard/help-center)
    window.location.href = "/dashboard/support";
  };

  // ── Sidebar toggle ──────────────────────────────────────
  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }

    const syncTheme = () => {
      const account = getActiveAccount();
      const storageKey = account?.id ? `ratel_appearance_${account.id}` : "dashboardDarkMode";
      const ds = localStorage.getItem(storageKey);
      setDashboardDark(ds === "true");
    };

    syncTheme();

    const handleDarkChange = () => {
      syncTheme();
    };

    window.addEventListener("dashboard-dark-mode-changed", handleDarkChange);
    window.addEventListener("auth-state-changed", handleDarkChange);
    window.addEventListener("storage", handleDarkChange);

    return () => {
      window.removeEventListener("dashboard-dark-mode-changed", handleDarkChange);
      window.removeEventListener("auth-state-changed", handleDarkChange);
      window.removeEventListener("storage", handleDarkChange);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
  };

  const isExpanded = isSidebarOpen || (!isSidebarOpen && isHovered);

  return (
    <AccountProvider>
      <div className={dashboardDark ? "dark" : ""}>
        <div
          className={
            dashboardDark
              ? "bg-gray-900 text-gray-100 min-h-screen"
              : "bg-gray-50 min-h-screen"
          }
        >
          <DashboardNavbar />
          <div className="max-w-[1800px] mx-auto flex gap-6 px-4 sm:px-6 py-6 relative">
            {/* ─── SIDEBAR ────────────────────────────────────── */}
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
                bg-white h-screen sticky top-0 self-start overflow-y-auto
              `}
            >
              {/* Logo + Toggle Button Row */}
              <div className="flex items-center w-full gap-3 mb-6">
                <Link
                  href="/dashboard"
                  className={`flex items-center ${
                    isExpanded ? "gap-3" : "justify-center flex-1"
                  }`}
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
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        Ratel Wallet
                      </h2>
                      <p className="text-xs text-gray-400">Dashboard</p>
                    </div>
                  )}
                </Link>

                <button
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 shrink-0 ${
                    !isExpanded && "ml-auto"
                  }`}
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

              {/* ─── Navigation ────────────────────────────────── */}
              <nav className="flex-1 w-full">
                {navItems.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isOpen = openDropdowns[item.name] || false;

                  if (hasChildren) {
                    const isChildActive = item.children!.some(
                      (child) => pathname === child.href
                    );
                    const isActive = isChildActive;

                    return (
                      <div key={item.name} className="w-full">
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`
                            flex items-center justify-between w-full rounded-xl px-3 py-3 text-sm font-medium transition
                            ${
                              isActive
                                ? "bg-red-600 text-white shadow-md shadow-red-200"
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

                  const isActive =
                    pathname === item.href ||
                    (item.href === "/dashboard" && pathname === "/dashboard");

                  return (
                    <Link
                      key={item.name}
                      href={item.href!}
                      className={`
                        flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                        ${
                          isActive
                            ? "bg-red-600 text-white shadow-md shadow-red-200"
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

              {/* Premium Badge / Card *
              {isExpanded ? (
                <div className="mt-auto pt-6 w-full">
                  <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-500 p-5 text-white">
                    <p className="text-red-100 text-xs font-medium">Premium Plan</p>
                    <h3 className="mt-2 text-lg font-bold">Unlock More</h3>
                    <button className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:scale-105 w-full shadow-lg">
                      Upgrade
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-auto pt-6 w-full flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-red-200">
                    P
                  </div>
                </div>
              )*/}
            </aside>

            {/* ─── MAIN CONTENT ────────────────────────────────── */}
            <section className="flex-1 min-w-0 pb-20 lg:pb-0">
              {children}
            </section>
          </div>

          {/* ─── MOBILE BOTTOM NAV ───────────────────────────── */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-4 lg:hidden z-50">
            {bottomNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/dashboard" && pathname === "/dashboard");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 text-xs"
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-red-600" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`${
                      isActive ? "text-red-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ─── FLOATING HELP & SUPPORT ICON ─────────────────── */}
                    {/* ─── FLOATING HELP & SUPPORT ICON ─────────────────── */}
          <div
  ref={helpRef}
  style={{
    position: "fixed",
    left: helpPos.x,
    top: helpPos.y,
    zIndex: 9999,
    touchAction: "none",
    transition: isDraggingHelp ? "none" : "left 0.25s ease", // animate only on snap release
  }}
  className="group flex items-center justify-center w-14 h-14 rounded-full bg-red-600 text-white shadow-2xl shadow-red-300 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200"
  onPointerDown={handlePointerDown}
  onClick={handleHelpClick}
  aria-label="Help & Support"
>
  <Headphones className="w-7 h-7" strokeWidth={2} />
  <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
    Help & Support
  </span>
</div>
</div>
</div>
    </AccountProvider>
  );
}