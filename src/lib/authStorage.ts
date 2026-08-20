// lib/authStorage.ts

export interface AuthAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  username: string;
  walletAddress: string;
  demoMode: boolean;
  profilePhoto: string | null;
  disabled?: boolean;
  createdAt: string;
  // 👇 Additional profile fields (used in profile page)
  phone?: string;
  address?: string;
  dob?: string;
  location?: string;
  bio?: string;
  // 👇 Optional security settings (persisted with updateUserSettings)
  twoFactorEnabled?: boolean;
  notificationsEnabled?: boolean;
}

const ACCOUNTS_KEY = "ratel_accounts_v1";
const CURRENT_ACCOUNT_ID_KEY = "ratel_current_account_id_v1";

// ─── Helpers ──────────────────────────────────────────────

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildUsername(fullName: string): string {
  const base = fullName.trim() || "user";
  return `@${base.toLowerCase().replace(/\s+/g, "")}`;
}

function notifyAuthStateChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-state-changed"));
  }
}

function setCompatSession(account: AuthAccount) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("isLoggedIn", "true");
  sessionStorage.setItem("userEmail", account.email);
  sessionStorage.setItem("userName", account.fullName);
  sessionStorage.setItem("userId", account.id);
  sessionStorage.setItem("walletAddress", account.walletAddress);
  sessionStorage.setItem("walletConnected", account.walletAddress ? "true" : "false");

  if (account.profilePhoto) {
    sessionStorage.setItem("profilePhoto", account.profilePhoto);
  } else {
    sessionStorage.removeItem("profilePhoto");
  }
}

function clearCompatSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("walletAddress");
  sessionStorage.removeItem("walletConnected");
  sessionStorage.removeItem("profilePhoto");
}

// ─── Core Storage Functions ──────────────────────────────

export function getStoredAccounts(): AuthAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuthAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: AuthAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getActiveAccount(): AuthAccount | null {
  if (typeof window === "undefined") return null;

  const accountId = sessionStorage.getItem(CURRENT_ACCOUNT_ID_KEY);
  if (!accountId) return null;

  return getStoredAccounts().find((account) => account.id === accountId) ?? null;
}

export function setActiveAccount(accountId: string) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(CURRENT_ACCOUNT_ID_KEY, accountId);
  const account = getStoredAccounts().find((item) => item.id === accountId);
  if (account) {
    setCompatSession(account);
    notifyAuthStateChanged();
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(CURRENT_ACCOUNT_ID_KEY);
  clearCompatSession();
  notifyAuthStateChanged();
}

// ─── Account Management ──────────────────────────────────

export function createAccount(input: {
  email: string;
  password: string;
  fullName: string;
  walletAddress?: string;
  demoMode?: boolean;
  username?: string;
  profilePhoto?: string | null;
}): { success: boolean; account?: AuthAccount; error?: string } {
  const email = normalizeEmail(input.email);
  const existing = getStoredAccounts().find((account) => normalizeEmail(account.email) === email);

  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const account: AuthAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    password: input.password,
    fullName: input.fullName.trim() || "User",
    username: input.username?.trim() || buildUsername(input.fullName),
    walletAddress: input.walletAddress || "",
    demoMode: Boolean(input.demoMode),
    profilePhoto: input.profilePhoto ?? null,
    disabled: false,
    createdAt: new Date().toISOString(),
  };

  const accounts = [...getStoredAccounts(), account];
  saveStoredAccounts(accounts);
  setActiveAccount(account.id);

  return { success: true, account };
}

export function authenticateAccount(email: string, password: string): AuthAccount | null {
  const normalizedEmail = normalizeEmail(email);
  const account = getStoredAccounts().find(
    (item) => normalizeEmail(item.email) === normalizedEmail && item.password === password
  );

  if (!account) return null;

  setActiveAccount(account.id);
  return account;
}

export function updateAccountProfile(
  accountId: string,
  update: Partial<AuthAccount>
): AuthAccount | null {
  const accounts = getStoredAccounts().map((account) =>
    account.id === accountId ? { ...account, ...update } : account
  );

  saveStoredAccounts(accounts);

  const updatedAccount = accounts.find((account) => account.id === accountId) ?? null;
  if (updatedAccount) {
    setCompatSession(updatedAccount);
    notifyAuthStateChanged();
  }

  return updatedAccount;
}

// ─── Convenience Wrappers (for API routes) ──────────────

export function updateUserPassword(userId: string, newPassword: string): AuthAccount | null {
  return updateAccountProfile(userId, { password: newPassword });
}

export function updateUserSettings(
  userId: string,
  settings: Partial<AuthAccount>
): AuthAccount | null {
  return updateAccountProfile(userId, settings);
}

export function deleteAccountById(accountId: string): { success: boolean; error?: string } {
  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => a.id === accountId);
  if (!existing) {
    return { success: false, error: "Account not found." };
  }

  const filtered = accounts.filter((a) => a.id !== accountId);
  saveStoredAccounts(filtered);

  // If the deleted account was active, clear session
  const active = getActiveAccount();
  if (active && active.id === accountId) {
    clearSession();
  }

  return { success: true };
}

// Toggle account disabled state (used by admin tools)
export function setAccountDisabled(accountId: string, disabled: boolean): AuthAccount | null {
  const updated = updateAccountProfile(accountId, { disabled });
  if (updated && disabled) {
    const active = getActiveAccount();
    if (active && active.id === accountId) {
      clearSession();
    }
  }

  return updated;
}