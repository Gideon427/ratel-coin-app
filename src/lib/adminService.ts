import { getStoredAccounts, setAccountDisabled, AuthAccount } from "@/lib/authStorage";

export interface UserData {
  id: string;
  name: string;
  address: string;
  email?: string;
  password?: string;
  balanceUSD: number;
  disabled?: boolean;
  createdAt: string;
  profilePhoto?: string | null;
}

export interface TransactionSummary {
  id: string;
  type: string;
  userEmail: string;
  amount: number;
  date: string;
  status: string;
}

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
  users: UserData[];
  recentUsers: UserData[];
  recentTransactions: TransactionSummary[];
}

interface WalletRecord {
  address: string;
  email?: string;
  balanceUSD?: number;
  balance?: number;
  transactions?: Array<{
    id?: string | number;
    type?: string;
    amount?: number;
    address?: string;
    from?: string;
    date?: string;
    status?: string;
    hash?: string;
  }>;
  createdAt?: string;
}

function getWalletRecords(): WalletRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const records: WalletRecord[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith("wallet_data_")) {
      continue;
    }

    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || "{}") as WalletRecord;
      if (parsed?.address) {
        records.push(parsed);
      }
    } catch {
      // Ignore malformed wallet entries
    }
  }

  return records;
}

export function getAllUserData(): AdminStats {
  const accounts = getStoredAccounts();
  const walletRecords = getWalletRecords();

  const users: UserData[] = accounts.map((account) => {
    const wallet = walletRecords.find((item) => item.address === account.walletAddress);
    return {
      id: account.id,
      name: account.fullName,
      address: account.walletAddress || wallet?.address || "Not connected",
      email: account.email,
      password: account.password,
      disabled: (account as AuthAccount).disabled ?? false,
      balanceUSD: wallet?.balanceUSD ?? wallet?.balance ?? 0,
      createdAt: account.createdAt,
      profilePhoto: account.profilePhoto,
    };
  });

  const recentTransactions: TransactionSummary[] = walletRecords.flatMap((wallet) =>
    (wallet.transactions || []).map((tx) => ({
      id: String(tx.id || `${wallet.address}-${tx.hash || Math.random()}`),
      type: tx.type || "transaction",
      userEmail: wallet.email || "unknown@ratelcoin.io",
      amount: tx.amount || 0,
      date: tx.date || wallet.createdAt || new Date().toISOString(),
      status: tx.status || "completed",
    }))
  );

  recentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const deposits = recentTransactions.filter((tx) => /deposit|receive|received|incoming/i.test(tx.type)).length;
  const withdrawals = recentTransactions.filter((tx) => /withdraw|send|sent|outgoing/i.test(tx.type)).length;
  const transfers = recentTransactions.filter((tx) => !/deposit|receive|received|incoming|withdraw|send|sent|outgoing/i.test(tx.type)).length;

  return {
    totalUsers: users.length,
    totalRevenue: users.reduce((sum, user) => sum + user.balanceUSD, 0),
    totalTransactions: recentTransactions.length,
    totalDeposits: deposits,
    totalWithdrawals: withdrawals,
    totalTransfers: transfers,
    users,
    recentUsers: sortedUsers.slice(0, 5),
    recentTransactions: recentTransactions.slice(0, 5),
  };
}

export function toggleAccountDisabled(accountId: string, disabled: boolean) {
  return setAccountDisabled(accountId, disabled);
}