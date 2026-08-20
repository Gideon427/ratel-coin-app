"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Settings,
  Shield,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useAccount } from "@/lib/AccountContext";
import { getNotifications, markAsRead, Notification as NotificationItem } from "@/lib/notifications";

type FilterTab = "all" | "wallet" | "transactions" | "marketplace" | "updates";

const CATEGORY_LABELS: Record<FilterTab, string> = {
  all: "All",
  wallet: "Wallet",
  transactions: "Transactions",
  marketplace: "Marketplace",
  updates: "Updates",
};

function getIcon(item: NotificationItem) {
  if (item.type === "transaction") {
    if (item.direction === "received") {
      return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
    }
    return <ArrowUpRight className="h-5 w-5 text-red-600" />;
  }

  switch (item.type) {
    case "security":
      return <Shield className="h-5 w-5 text-red-600" />;
    case "marketplace":
      return <ShoppingBag className="h-5 w-5 text-red-600" />;
    case "system":
    default:
      return <Bell className="h-5 w-5 text-red-600" />;
  }
}

function getCategoryFromType(type: NotificationItem["type"]): FilterTab {
  if (type === "transaction") return "transactions";
  if (type === "marketplace") return "marketplace";
  if (type === "security") return "updates";
  return "wallet";
}

function humanTimeLabel(date: string) {
  const now = new Date();
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return "Just now";

  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { activeAccount } = useAccount();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [tab, setTab] = useState<FilterTab>("all");

  useEffect(() => {
    if (!activeAccount?.address) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const reload = () => {
      const items = getNotifications(activeAccount.address);
      setNotifications(items);
      setLoading(false);
    };

    reload();
    window.addEventListener("notifications-updated", reload);
    window.addEventListener("storage", reload);

    return () => {
      window.removeEventListener("notifications-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, [activeAccount]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (tab === "all") return true;
      return getCategoryFromType(item.type) === tab;
    });
  }, [notifications, tab]);

  const priorityNotifications = useMemo(() => {
    return filteredNotifications.filter((item) => item.priority);
  }, [filteredNotifications]);

  const earliestNotifications = useMemo(() => {
    return filteredNotifications.filter((item) => !item.priority);
  }, [filteredNotifications]);

  const openNotification = (item: NotificationItem) => {
    if (!item.link) return;
    if (!item.read) markAsRead(item.id);
    router.push(item.link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-6 text-[#161616] lg:flex lg:items-center lg:justify-center lg:px-8">
      <div className="mx-auto w-full max-w-[980px] rounded-[38px] border border-black/5 bg-[#f6f6f6] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.12)] lg:p-5">
        <div className="mx-auto w-full max-w-[430px] rounded-[30px] bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
          <div className="rounded-[30px] bg-white">
            <div className="flex items-center justify-between px-4 pt-4 text-[13px] font-semibold text-gray-700">
              
              {/*<div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                <span className="h-2.5 w-4 rounded-full bg-gray-900" />
              </div>*/}
            </div>


            <div className="px-4 pb-4 pt-3">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="rounded-full p-1 text-gray-700 transition hover:bg-gray-200"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h1 className="text-[26px] font-semibold leading-none text-gray-900">Notifications</h1>
                    <p className="mt-1 text-sm text-gray-500">Stay updated with your Ratel Coin activity</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/dashboard/settings/notifications")}
                  className="rounded-full bg-white p-2 text-gray-700 shadow-sm ring-1 ring-gray-200"
                >
                  <Settings size={18} />
                </button>
              </div>

              <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
                {(Object.keys(CATEGORY_LABELS) as FilterTab[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex min-w-[74px] items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                      tab === key ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {key === "all" && <Bell size={14} />}
                    {key === "wallet" && <Wallet size={14} />}
                    {key === "transactions" && <ArrowUpRight size={14} />}
                    {key === "marketplace" && <ShoppingBag size={14} />}
                    {key === "updates" && <Shield size={14} />}
                    <span>{CATEGORY_LABELS[key]}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-gray-900">Priority</h2>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      {priorityNotifications.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {priorityNotifications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
                        No priority notifications right now.
                      </div>
                    ) : (
                      priorityNotifications.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 ${
                            item.type === "transaction" && item.direction === "received"
                              ? "bg-green-50 ring-green-100"
                              : "bg-[#fff1f1] ring-red-100"
                          }`}>
                            {getIcon(item)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-semibold text-gray-900">{item.title}</p>
                                <p className="truncate text-sm text-gray-500">{item.body}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2 text-xs text-gray-400">
                                <span className="whitespace-nowrap">{humanTimeLabel(item.date)}</span>
                                <button
                                  onClick={() => openNotification(item)}
                                  className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
                                  aria-label={`View ${item.title}`}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-gray-900">Earlier</h2>
                    <span className="text-xs font-medium text-gray-500">{earliestNotifications.length}</span>
                  </div>

                  <div className="space-y-3">
                    {earliestNotifications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
                        No earlier notifications.
                      </div>
                    ) : (
                      earliestNotifications.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 ${
                            item.type === "transaction" && item.direction === "received"
                              ? "bg-green-50 ring-green-100"
                              : "bg-[#fff1f1] ring-red-100"
                          }`}>
                            {getIcon(item)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-semibold text-gray-900">{item.title}</p>
                                <p className="truncate text-sm text-gray-500">{item.body}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2 text-xs text-gray-400">
                                <span className="whitespace-nowrap">{humanTimeLabel(item.date)}</span>
                                <button
                                  onClick={() => openNotification(item)}
                                  className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
                                  aria-label={`View ${item.title}`}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}