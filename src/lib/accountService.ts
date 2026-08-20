// src/lib/accountService.ts

export interface Account {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  profilePhoto?: string | null;
  phone?: string;        // ✅ added
  dob?: string;          // ✅ added
  location?: string;     // ✅ added
}

// ─── SSR-safe helpers ──────────────────────────────────────
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeGetItem(key: string): string | null {
  return isBrowser() ? sessionStorage.getItem(key) : null;
}

function safeSetItem(key: string, value: string): void {
  if (isBrowser()) sessionStorage.setItem(key, value);
}

// ─── User‑specific key helpers ─────────────────────────────
function getUserEmail(): string | null {
  return safeGetItem("userEmail");
}

function getUserId(): string | null {
  return safeGetItem("userId");
}

function accountsKey(): string | null {
  const userId = getUserId();
  if (userId) {
    return `accounts_${userId}`;
  }

  const email = getUserEmail();
  if (email) {
    return `accounts_${email}`;
  }

  return null;
}

function activeAccountKey(): string | null {
  const userId = getUserId();
  if (userId) {
    return `activeAccountId_${userId}`;
  }

  const email = getUserEmail();
  if (email) {
    return `activeAccountId_${email}`;
  }

  return null;
}

// ─── Public functions ──────────────────────────────────────
export function getAccounts(): Account[] {
  if (!isBrowser()) return [];
  const key = accountsKey();
  if (!key) return [];

  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]) {
  if (!isBrowser()) return;
  const key = accountsKey();
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(accounts));
}

export function getActiveAccountId(): string | null {
  const key = activeAccountKey();
  if (!key) return null;
  return safeGetItem(key);
}

export function setActiveAccountId(id: string) {
  const key = activeAccountKey();
  if (!key) return;
  safeSetItem(key, id);
  if (isBrowser()) {
    window.dispatchEvent(new Event("active-account-changed"));
  }
}

export function getActiveAccount(): Account | null {
  const id = getActiveAccountId();
  if (!id) return null;
  const accounts = getAccounts();
  return accounts.find((a) => a.id === id) || null;
}