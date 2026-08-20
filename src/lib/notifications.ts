import { readWalletState, formatAddress } from "./walletService";

export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  type: "transaction" | "system" | "security" | "marketplace";
  direction?: "received" | "sent";
  link?: string;
  priority: boolean;
}

const NOTIFICATIONS_READ_KEY = "notifications_read_v1";

// ─── Private helpers ──────────────────────────────────────
function getReadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(ids));
}

// ─── Public API ────────────────────────────────────────────

/** Mark a single notification as read */
export function markAsRead(notificationId: string) {
  const ids = getReadIds();
  if (!ids.includes(notificationId)) {
    ids.push(notificationId);
    saveReadIds(ids);
    // Notify all components that the read state has changed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications-updated"));
    }
  }
}

/** Mark all notifications as read */
export function markAllRead() {
  if (typeof window === "undefined") return;
  const address = localStorage.getItem("walletAddress");
  if (!address) return;
  const notifs = getNotifications(address);
  const allIds = notifs.map((n) => n.id);
  saveReadIds(allIds);
  window.dispatchEvent(new Event("notifications-updated"));
}

/** Generate notifications from wallet data + apply read status */
export function getNotifications(address: string): Notification[] {
  if (!address || typeof window === "undefined") return [];
  const data = readWalletState(address);
  if (!data) return [];

  const now = new Date();
  const notifs: Notification[] = [];

  // 1. Transaction notifications
  data.transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const isReceived = tx.type === "received";
    const amount = tx.amount;
    const addressFormatted = formatAddress(tx.address);
    const title = isReceived
      ? `You received ${amount.toFixed(2)} RTC`
      : `You sent ${amount.toFixed(2)} RTC`;
    const body = isReceived
      ? `From ${addressFormatted}`
      : `To ${addressFormatted}`;
    const link = `/dashboard/wallet/transactions/receipt?id=${tx.id}`;
    const priority = isReceived ? amount > 50 : amount > 100;

    // Only show recent transactions (last 30 days)
    const daysDiff = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 30) {
      notifs.push({
        id: `tx-${tx.id}`,
        title,
        body,
        date: tx.date,
        read: false,
        type: "transaction",
        direction: isReceived ? "received" : "sent",
        link,
        priority,
      });
    }
  });

  // 2. Low balance alert
  if (data.balance < 50 && data.balance > 0) {
    notifs.push({
      id: "low-balance",
      title: "Low Balance Alert",
      body: `Your wallet balance is low (${data.balance.toFixed(2)} RTC)`,
      date: new Date().toISOString(),
      read: false,
      type: "system",
      link: "/dashboard/wallet",
      priority: true,
    });
  }

  // 3. Welcome notification for new accounts
  const daysSinceCreation =
    (now.getTime() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 2) {
    notifs.push({
      id: "welcome",
      title: "Welcome to Ratel Coin!",
      body: "Your wallet is ready. Start transacting today.",
      date: data.createdAt,
      read: false,
      type: "security",
      link: "/dashboard/wallet",
      priority: true,
    });
  }

  // Sort newest first
  notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply read status from localStorage
  const readIds = getReadIds();
  return notifs.map((n) => ({
    ...n,
    read: readIds.includes(n.id),
  }));
}

/** Convenience wrapper */
export function readNotifications(address: string): Notification[] {
  return getNotifications(address);
}

/** Get count of unread notifications */
export function getUnreadCount(address: string): number {
  return getNotifications(address).filter((n) => !n.read).length;
}