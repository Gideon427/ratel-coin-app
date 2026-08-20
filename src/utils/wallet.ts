// utils/wallet.ts

import {
  WalletData,
  normalizeAddress,
  readWalletState,
  persistWalletState,
  createTransaction,
  queuePendingReceiveEvent,
} from "@/lib/walletService";

// Helper: convert to integer cents (2 decimals)
function toCents(value: number): number {
  return Math.round(value * 100);
}

// Helper: convert back to number with 2 decimals
function fromCents(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export function debitWallet(address: string, amount: number, toAddress: string, hash: string): WalletData | null {
  const normalizedSender = normalizeAddress(address);
  const normalizedTo = normalizeAddress(toAddress) || toAddress.trim();
  if (!normalizedSender) return null;

  const existingData = readWalletState(normalizedSender);
  if (!existingData) return null;

  const amountCents = toCents(amount);
  const balanceCents = toCents(existingData.balance);
  const newBalanceCents = balanceCents - amountCents;
  if (newBalanceCents < 0) {
    return null;
  }

  const newBalance = fromCents(newBalanceCents);

  const updatedData: WalletData = {
    ...existingData,
    balance: newBalance,
    balanceUSD: Number((newBalance * 1.98).toFixed(2)), // keep exchange rate logic
    transactions: [
      createTransaction("sent", amount, normalizedTo, hash),
      ...existingData.transactions,
    ],
  };

  persistWalletState(normalizedSender, updatedData);
  return updatedData;
}

export function creditWallet(address: string, amount: number, fromAddress: string, hash: string): WalletData {
  const normalizedRecipient = normalizeAddress(address) || address;
  const normalizedFrom = normalizeAddress(fromAddress) || fromAddress;

  const existingData = readWalletState(normalizedRecipient);

  const amountCents = toCents(amount);
  const balanceCents = existingData ? toCents(existingData.balance) : 0;
  const newBalanceCents = balanceCents + amountCents;
  const newBalance = fromCents(newBalanceCents);

  const updatedData: WalletData = existingData
    ? {
        ...existingData,
        balance: newBalance,
        balanceUSD: Number((newBalance * 1.98).toFixed(2)),
        transactions: [
          createTransaction("received", amount, normalizedFrom, hash),
          ...existingData.transactions,
        ],
      }
    : {
        address: normalizedRecipient,
        email: `user_${normalizedRecipient.slice(0, 8)}@demo.com`,
        balance: newBalance,
        balanceUSD: Number((newBalance * 1.98).toFixed(2)),
        transactions: [createTransaction("received", amount, normalizedFrom, hash)],
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