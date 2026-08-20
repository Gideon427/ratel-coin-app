// src/lib/walletService.ts
import { ethers } from "ethers";

export interface Transaction {
  id: number;
  type: "sent" | "received";
  amount: number;
  from?: string;
  to?: string;
  address: string;
  date: string;
  status: "completed" | "pending" | "failed";
  hash: string;
}

export interface WalletData {
  address: string;
  email: string;
  balance: number;
  balanceUSD: number;
  transactions: Transaction[];
  createdAt: string;
}

const WALLET_STORAGE_PREFIX = "wallet_data_";
const PENDING_RECEIVE_EVENTS_KEY = "pending_receive_events";
const USD_RATE = 1;

export interface PendingReceiveEvent {
  id: string;
  address: string;
  amount: number;
  from: string;
  hash: string;
  timestamp: string;
}

export function getWalletStorageKey(address: string) {
  return `${WALLET_STORAGE_PREFIX}${address}`;
}

export function normalizeAddress(address: string): string | null {
  if (!address) return null;
  try {
    return ethers.getAddress(address.trim());
  } catch (err) {
    try {
      const trimmed = address.trim();
      if (trimmed.startsWith("0x") && trimmed.length === 42) {
        return ethers.getAddress(trimmed);
      }
    } catch (e) {
      return null;
    }
    return null;
  }
}

export function generateWalletAddress(_userId: string): string {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
}

export function generateRandomWalletAddress(): string {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

export function readWalletState(address?: string): WalletData | null {
  if (!address || typeof window === "undefined") return null;

  const normalized = normalizeAddress(address);
  if (!normalized) return null;

  const storageKey = getWalletStorageKey(normalized);
  const storedData = localStorage.getItem(storageKey);
  if (!storedData) return null;

  try {
    const parsed = JSON.parse(storedData) as WalletData;
    const normalizedBalanceUSD = Number((parsed.balance * USD_RATE).toFixed(2));
    const repairedData: WalletData = {
      ...parsed,
      address: normalized,
      balanceUSD: normalizedBalanceUSD,
    };

    if (parsed.balanceUSD !== normalizedBalanceUSD) {
      persistWalletState(normalized, repairedData);
    }

    return repairedData;
  } catch (error) {
    console.error("Failed to parse wallet state:", error);
    return null;
  }
}

export function persistWalletState(address: string, data: WalletData) {
  if (!address || typeof window === "undefined") return;

  const normalized = normalizeAddress(address);
  if (!normalized) return;

  try {
    const dataToStore = { ...data, address: normalized };
    localStorage.setItem(getWalletStorageKey(normalized), JSON.stringify(dataToStore));
  } catch (error) {
    console.error("Failed to persist wallet state:", error);
  }
}

export interface SavingsData {
  address: string;
  balance: number;
  goal: number;
  updatedAt: string;
}

export function getSavingsStorageKey(address: string) {
  const normalized = normalizeAddress(address);
  return normalized ? `savings_data_${normalized}` : `savings_data_${address}`;
}

export function readSavingsState(address: string): SavingsData | null {
  if (!address || typeof window === "undefined") return null;
  const key = getSavingsStorageKey(address);
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SavingsData;
  } catch (error) {
    console.error("Failed to parse savings state:", error);
    return null;
  }
}

export function persistSavingsState(address: string, data: SavingsData) {
  if (!address || typeof window === "undefined") return;
  const key = getSavingsStorageKey(address);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to persist savings state:", error);
  }
}

export function initializeSavingsState(address: string, balance = 0, goal = 500): SavingsData {
  const normalized = normalizeAddress(address) || address;
  const existing = readSavingsState(normalized);
  if (existing) return existing;

  const initial: SavingsData = {
    address: normalized,
    balance,
    goal,
    updatedAt: new Date().toISOString(),
  };

  persistSavingsState(normalized, initial);
  return initial;
}

export function initializeWalletData(
  address: string,
  email: string,
  initialBalance = 0   // 👈 changed from 1000 to 0
): WalletData {
  const normalized = normalizeAddress(address) || address;

  const existingData = readWalletState(normalized);
  if (existingData) return existingData;

  const initialData: WalletData = {
    address: normalized,
    email,
    balance: initialBalance,
    balanceUSD: Number((initialBalance * USD_RATE).toFixed(2)),
    transactions: initialBalance > 0
      ? [
          {
            id: Date.now(),
            type: "received",
            amount: initialBalance,
            address: "Ratel Coin Faucet",
            from: "Ratel Coin Faucet",
            date: new Date().toLocaleString(),
            status: "completed",
            hash:
              "0x" +
              Array.from({ length: 64 }, () =>
                "0123456789abcdef"[Math.floor(Math.random() * 16)]
              ).join(""),
          },
        ]
      : [],
    createdAt: new Date().toISOString(),
  };

  persistWalletState(address, initialData);
  return initialData;
}

export async function fetchAndSyncWallet(address: string): Promise<WalletData | null> {
  if (!address || typeof window === "undefined") return null;
  try {
    const normalized = normalizeAddress(address) || address;
    const resp = await fetch(`/api/wallet/${encodeURIComponent(normalized)}`);
    if (!resp.ok) return null;
    const json = await resp.json();
    const data = json.data as WalletData;
    if (data) {
      const normalizedData: WalletData = {
        ...data,
        address: normalized,
        balanceUSD: Number((data.balance * USD_RATE).toFixed(2)),
      };
      persistWalletState(normalized, normalizedData);
      return normalizedData;
    }
    return null;
  } catch (e) {
    console.error("fetchAndSyncWallet error", e);
    return null;
  }
}

export function createTransaction(
  type: "sent" | "received",
  amount: number,
  counterpartyAddress: string,
  hash: string
): Transaction {
  return {
    id: Date.now() + Math.floor(Math.random() * 10000),
    type,
    amount,
    address: counterpartyAddress,
    from: type === "received" ? counterpartyAddress : undefined,
    to: type === "sent" ? counterpartyAddress : undefined,
    date: new Date().toLocaleString(),
    status: "completed",
    hash,
  };
}

export function debitWallet(
  address: string,
  amount: number,
  toAddress: string,
  hash: string
): WalletData | null {
  const normalizedSender = normalizeAddress(address);
  const normalizedTo = normalizeAddress(toAddress) || toAddress.trim();
  if (!normalizedSender) return null;

  const existingData = readWalletState(normalizedSender);
  if (!existingData) return null;

  const nextBalance = Number((existingData.balance - amount).toFixed(2));
  if (nextBalance < 0) {
    return null;
  }

  const updatedData: WalletData = {
    ...existingData,
    balance: nextBalance,
    balanceUSD: Number((nextBalance * USD_RATE).toFixed(2)),
    transactions: [
      createTransaction("sent", amount, normalizedTo, hash),
      ...existingData.transactions,
    ],
  };

  persistWalletState(normalizedSender, updatedData);
  return updatedData;
}

export function creditWallet(
  address: string,
  amount: number,
  fromAddress: string,
  hash: string
): WalletData {
  const normalizedRecipient = normalizeAddress(address) || address;
  const normalizedFrom = normalizeAddress(fromAddress) || fromAddress;

  const existingData = readWalletState(normalizedRecipient);

  const updatedData: WalletData = existingData
    ? {
        ...existingData,
        balance: Number((existingData.balance + amount).toFixed(2)),
        balanceUSD: Number(((existingData.balance + amount) * USD_RATE).toFixed(2)),
        transactions: [
          createTransaction("received", amount, normalizedFrom, hash),
          ...existingData.transactions,
        ],
      }
    : {
        address: normalizedRecipient,
        email: `user_${normalizedRecipient.slice(0, 8)}@demo.com`,
        balance: Number(amount.toFixed(2)),
        balanceUSD: Number((amount * USD_RATE).toFixed(2)),
        transactions: [
          createTransaction("received", amount, normalizedFrom, hash),
        ],
        createdAt: new Date().toISOString(),
      };

  persistWalletState(normalizedRecipient, updatedData);

  queuePendingReceiveEvent(normalizedRecipient, {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    address: normalizedRecipient,
    amount,
    from: normalizedFrom,
    hash,
    timestamp: new Date().toISOString(),
  });

  return updatedData;
}

export function readPendingReceiveEvents(): PendingReceiveEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_RECEIVE_EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingReceiveEvent[];
  } catch (error) {
    console.error("Failed to read pending receive events:", error);
    return [];
  }
}

export function writePendingReceiveEvents(events: PendingReceiveEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_RECEIVE_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Failed to write pending receive events:", error);
  }
}

export function queuePendingReceiveEvent(address: string, event: PendingReceiveEvent) {
  if (!address || typeof window === "undefined") return;
  const events = readPendingReceiveEvents();
  const updated = [event, ...events.filter((item) => item.address !== address)];
  writePendingReceiveEvents(updated);

  window.dispatchEvent(
    new CustomEvent("wallet-receive-success", {
      detail: { ...event, address },
    })
  );
}

export function consumePendingReceiveEvent(address: string): PendingReceiveEvent | null {
  if (!address || typeof window === "undefined") return null;
  const events = readPendingReceiveEvents();
  const matching = events.filter((event) => event.address === address);
  if (matching.length === 0) return null;

  const latest = matching[0];
  const updated = events.filter((event) => event.id !== latest.id);
  writePendingReceiveEvents(updated);
  return latest;
}

export function generateUserId(email: string): string {
  return `${email.split("@")[0]}_${Date.now().toString(36)}`;
}