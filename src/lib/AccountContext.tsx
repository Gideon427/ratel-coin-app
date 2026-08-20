"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getActiveAccount as getActiveAccountFromService,
  setActiveAccountId,
  Account,
} from "@/lib/accountService";

interface AccountContextType {
  activeAccount: Account | null;
  switchAccount: (id: string) => void;
  refreshAccount: () => void;
}

const AccountContext = createContext<AccountContextType>({
  activeAccount: null,
  switchAccount: () => {},
  refreshAccount: () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  const refreshAccount = () => {
    const acc = getActiveAccountFromService();
    setActiveAccount(acc);
  };

  const switchAccount = (id: string) => {
    setActiveAccountId(id);
    refreshAccount();
  };

  // Load on mount and re‑fetch when the user logs in/out or switches wallets
  useEffect(() => {
    refreshAccount();

    const handleChange = () => refreshAccount();

    window.addEventListener("active-account-changed", handleChange);
    window.addEventListener("auth-state-changed", handleChange); // 👈 New listener
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener("active-account-changed", handleChange);
      window.removeEventListener("auth-state-changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return (
    <AccountContext.Provider value={{ activeAccount, switchAccount, refreshAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}