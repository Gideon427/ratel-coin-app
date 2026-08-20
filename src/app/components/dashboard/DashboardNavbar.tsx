
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Settings,
  User,
  Menu,
  X,
  Home,
  Wallet,
  Gift,
  HelpCircle,
  Activity,
  Users,
  MessageSquare,
  Search,
  BarChart3,
} from "lucide-react";
import { getActiveAccount } from "@/lib/accountService";
import { clearSession } from "@/lib/authStorage";
import {
  getUnreadCount,
  readNotifications,
  markAsRead,
  markAllRead,
  Notification,
} from "@/lib/notifications";

export default function DashboardNavbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAccount, setActiveAccount] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ─── Sync active account ──────────────────────────────
  useEffect(() => {
    const updateActive = () => {
      const acc = getActiveAccount();
      setActiveAccount(acc);
    };
    updateActive();
    window.addEventListener("auth-state-changed", updateActive);
    window.addEventListener("active-account-changed", updateActive);
    window.addEventListener("storage", updateActive);
    window.addEventListener("pageshow", updateActive);
    return () => {
      window.removeEventListener("auth-state-changed", updateActive);
      window.removeEventListener("active-account-changed", updateActive);
      window.removeEventListener("storage", updateActive);
      window.removeEventListener("pageshow", updateActive);
    };
  }, []);

  // ─── Load profile photo ──────────────────────────────
  useEffect(() => {
    const syncProfilePhoto = () => {
      const account = getActiveAccount() as { profilePhoto?: string | null } | null;
      const savedPhoto = account?.profilePhoto ?? sessionStorage.getItem("profilePhoto");
      setProfilePhoto(savedPhoto);
    };
    syncProfilePhoto();
    const handleAuthChange = () => syncProfilePhoto();
    window.addEventListener("auth-state-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("pageshow", handleAuthChange);
    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("pageshow", handleAuthChange);
    };
  }, []);

  // ─── Load notifications when account changes ──────────
  const loadNotifications = () => {
    if (!activeAccount?.address) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const address = activeAccount.address;
    const notifs = readNotifications(address);
    setNotifications(notifs);
    setUnreadCount(getUnreadCount(address));
  };

  useEffect(() => {
    loadNotifications();

    // Listen for updates
    const onUpdate = () => loadNotifications();
    window.addEventListener("notifications-updated", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("notifications-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [activeAccount]);

  // ─── Notification handlers ─────────────────────────────
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const openNotificationsPage = () => {
    setShowNotifications(false);
    router.push("/dashboard/notifications");
  };

  const handleMarkAllRead = () => {
    markAllRead();
    loadNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
      loadNotifications();
    }
    if (notification.link) {
      router.push(notification.link);
      setShowNotifications(false);
    }
  };

  // ─── Logout ─────────────────────────────────────────────
  const handleLogout = () => {
    clearSession();
    setShowLogoutModal(false);
    setIsMenuOpen(false);
    router.push("/login");
  };

  // ─── Search ─────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
    // { icon: ClipboardList, label: "Order History", href: "/dashboard/order-history" },
    { icon: BarChart3, label: "Market", href: "/dashboard/market" },
    { icon: Activity, label: "Portfolio", href: "/dashboard/portfolio" },
    // { icon: BarChart3, label: "Portfolio Analytics", href: "/dashboard/portfolio-analytics" },
    { icon: Gift, label: "Rewards", href: "/dashboard/rewards" },
    { icon: Users, label: "Membership", href: "/dashboard/membership" },
    // { icon: HelpCircle, label: "Support", href: "/dashboard/support" },
    { icon: HelpCircle, label: "Help Center", href: "/dashboard/support" },
    { icon: MessageSquare, label: "Live Chat", href: "/dashboard/live-chat" },
    { icon: User, label: "Account", href: "/dashboard/account" },
    { icon: Wallet, label: "Accounts", href: "/dashboard/accounts" },
    // { icon: Shield, label: "Security", href: "/dashboard/settings/security" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-red-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">
                <span className="text-red-600">Ratel Coin</span>{" "}
                <span className="text-gray-900 hidden sm:inline">Wallet</span>
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Decentralized Digital Wallet
              </p>
            </div>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button type="submit" className="sr-only">Search</button>
          </form>

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition border border-gray-200 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-700" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Menu</span>
          </button>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Account Switcher */}
            <Link
              href="/dashboard/accounts"
              className="hidden md:flex items-center gap-3 rounded-full border border-red-100 bg-white px-5 py-3 shadow-sm hover:shadow-md transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Image src="/images/logo.png" alt="" width={20} height={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Active Wallet</p>
                <p className="font-semibold">{activeAccount?.name || "My Wallet"}</p>
              </div>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-600 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="font-semibold">Notifications</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Mark all read
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={openNotificationsPage}
                        className="text-xs text-red-600 hover:underline"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No notifications
                      </div>
                    )}
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition ${
                          n.read ? "opacity-70" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{n.body}</p>
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {new Date(n.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        {!n.read && (
                          <div className="mt-1">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          </div>
                        )}
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-100">
                        Showing 5 of {notifications.length}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              href="/dashboard/settings"
              className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <Settings size={20} />
            </Link>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className="hidden sm:flex items-center gap-3 rounded-full bg-white border border-gray-200 p-1 pr-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white overflow-hidden">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-semibold">My Account</p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="block md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <button type="submit" className="sr-only">Search</button>
          </form>
        </div>
      </header>

      {/* Mobile sidebar */}
      <div
        className={`
          fixed inset-0 z-50 transition-all duration-300 ease-in-out
          ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`
            absolute left-0 top-0 h-full w-[75%] max-w-sm bg-white shadow-2xl
            transition-transform duration-300 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">My Account</p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition text-gray-700 hover:text-red-600"
                >
                  <item.icon size={20} className="text-gray-500" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 p-4">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setShowLogoutModal(true);
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-50 px-6 py-3 text-red-600 hover:bg-red-100 transition"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <LogOut size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Are you sure you want to logout?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                You will be redirected to the login page and will need to sign in again to access your wallet.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}