"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Link2,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Copy,
  AlertCircle,
} from "lucide-react";
import { getAccounts, saveAccounts } from "@/lib/accountService";
import { useAccount } from "@/lib/AccountContext";

interface Account {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export default function AccountsPage() {
  const router = useRouter();
  const { activeAccount, switchAccount } = useAccount();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Add account panel state
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addMode, setAddMode] = useState<"create" | "import">("create");

  // Create form state
  const [createWalletName, setCreateWalletName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<{ address: string; privateKey: string } | null>(null);
  const [createError, setCreateError] = useState("");

  // Import form state
  const [importMethod, setImportMethod] = useState<"privateKey" | "seedPhrase">("privateKey");
  const [privateKey, setPrivateKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [showImportInput, setShowImportInput] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");

  // Load accounts (no demo wallet creation)
  useEffect(() => {
    const syncAccounts = () => {
      const list = getAccounts();
      setAccounts(list);
    };

    syncAccounts();
    window.addEventListener("auth-state-changed", syncAccounts);
    window.addEventListener("storage", syncAccounts);
    window.addEventListener("pageshow", syncAccounts);

    return () => {
      window.removeEventListener("auth-state-changed", syncAccounts);
      window.removeEventListener("storage", syncAccounts);
      window.removeEventListener("pageshow", syncAccounts);
    };
  }, [switchAccount]);

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      alert("You must have at least one account.");
      return;
    }
    const updated = accounts.filter((a) => a.id !== id);
    saveAccounts(updated);
    setAccounts(updated);
    if (activeAccount?.id === id) {
      switchAccount(updated[0].id);
    }
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = () => {
    if (!editingId || !editName.trim()) return;
    const updated = accounts.map((a) =>
      a.id === editingId ? { ...a, name: editName.trim() } : a
    );
    saveAccounts(updated);
    setAccounts(updated);
    setEditingId(null);
    window.dispatchEvent(new Event("active-account-changed"));
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditName("");
  };

  // ─── Create Wallet Logic ───────────────────────────────────
  const handleCreate = async () => {
    if (!createWalletName.trim()) {
      setCreateError("Please enter a wallet name.");
      return;
    }
    setCreateError("");
    setIsCreating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const dummy = {
        address:
          "0x" +
          Array.from({ length: 40 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join(""),
        privateKey:
          "0x" +
          Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join(""),
      };
      setCreatedWallet(dummy);

      const newAccount: Account = {
        id: "acc_" + Date.now(),
        name: createWalletName.trim(),
        address: dummy.address,
        createdAt: new Date().toISOString(),
      };
      const all = getAccounts();
      all.push(newAccount);
      saveAccounts(all);
      switchAccount(newAccount.id);
      setAccounts(all);

      setTimeout(() => {
        setShowAddPanel(false);
        setCreatedWallet(null);
        setCreateWalletName("");
      }, 2000);
    } catch {
      setCreateError("Wallet creation failed. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // ─── Import Wallet Logic ───────────────────────────────────
  const handleImport = async () => {
    setImportError("");
    if (importMethod === "privateKey") {
      if (!privateKey.trim()) {
        setImportError("Please enter your private key.");
        return;
      }
      if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey.trim())) {
        setImportError("Invalid private key format (0x + 64 hex characters).");
        return;
      }
    } else {
      const words = seedPhrase.trim().split(/\s+/);
      if (words.length < 12) {
        setImportError("Seed phrase must contain at least 12 words.");
        return;
      }
    }

    setIsImporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const dummyAddress =
        "0x" +
        Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

      const newAccount: Account = {
        id: "acc_" + Date.now(),
        name: "Imported Wallet",
        address: dummyAddress,
        createdAt: new Date().toISOString(),
      };
      const all = getAccounts();
      all.push(newAccount);
      saveAccounts(all);
      switchAccount(newAccount.id);
      setAccounts(all);

      setTimeout(() => {
        setShowAddPanel(false);
        setPrivateKey("");
        setSeedPhrase("");
      }, 1000);
    } catch {
      setImportError("Failed to import wallet. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
          <button
            onClick={() => {
              setShowAddPanel(!showAddPanel);
              setAddMode("create");
              setCreateWalletName("");
              setPrivateKey("");
              setSeedPhrase("");
              setCreateError("");
              setImportError("");
              setCreatedWallet(null);
            }}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            <Plus size={18} /> Add New Account
          </button>
        </div>

        {/* ─── Account List ──────────────────────────────────── */}
        {accounts.length > 0 ? (
          <div className="space-y-4 mb-8">
            {accounts.map((account) => {
              const isActive = account.id === activeAccount?.id;
              return (
                <div
                  key={account.id}
                  className={`rounded-2xl border p-5 transition ${
                    isActive
                      ? "border-red-200 bg-red-50/50 shadow-sm"
                      : "border-gray-200 bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => switchAccount(account.id)}
                        className="text-red-600 hover:scale-110 transition shrink-0"
                        title={isActive ? "Active account" : "Set as active"}
                      >
                        {isActive ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Circle size={20} className="text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        {editingId === account.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                              autoFocus
                            />
                            <button onClick={saveRename} className="p-1 hover:bg-green-100 rounded">
                              <Save size={16} className="text-green-600" />
                            </button>
                            <button onClick={cancelRename} className="p-1 hover:bg-gray-100 rounded">
                              <X size={16} className="text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-gray-900">{account.name}</h3>
                            <p className="text-xs text-gray-500 font-mono">
                              {account.address.slice(0, 6)}...{account.address.slice(-4)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {isActive && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Active
                        </span>
                      )}
                      <button
                        onClick={() => startRename(account.id, account.name)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition rounded-lg hover:bg-gray-100"
                        title="Rename"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteAccount(account.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Empty State ──────────────────────────────────── */
          !showAddPanel && (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Plus size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No wallets yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Create a new wallet or import an existing one to get started.
              </p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                <Plus size={18} /> Add Your First Wallet
              </button>
            </div>
          )
        )}

        {/* ─── Add Account Panel (Create/Import) ─────────────── */}
        {showAddPanel && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Add New Account</h2>
              <button onClick={() => setShowAddPanel(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 rounded-xl bg-gray-100 p-1 mb-6">
              <button
                onClick={() => {
                  setAddMode("create");
                  setCreateError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  addMode === "create" ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Create New Wallet
              </button>
              <button
                onClick={() => {
                  setAddMode("import");
                  setImportError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  addMode === "import" ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Import Existing
              </button>
            </div>

            {/* Create Panel */}
            {addMode === "create" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Name</label>
                  <input
                    type="text"
                    placeholder="e.g., My Main Wallet"
                    value={createWalletName}
                    onChange={(e) => {
                      setCreateWalletName(e.target.value);
                      if (createError) setCreateError("");
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                  />
                </div>
                {createError && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                    <AlertCircle size={16} /> {createError}
                  </div>
                )}
                {createdWallet && (
                  <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
                    Wallet created! Address: {createdWallet.address.slice(0, 10)}...
                  </div>
                )}
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {isCreating ? "Creating..." : "Create Wallet"}
                </button>
              </div>
            )}

            {/* Import Panel */}
            {addMode === "import" && (
              <div className="space-y-4">
                <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
                  <button
                    onClick={() => {
                      setImportMethod("privateKey");
                      setImportError("");
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                      importMethod === "privateKey" ? "bg-white shadow text-red-600" : "text-gray-500"
                    }`}
                  >
                    Private Key
                  </button>
                  <button
                    onClick={() => {
                      setImportMethod("seedPhrase");
                      setImportError("");
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                      importMethod === "seedPhrase" ? "bg-white shadow text-red-600" : "text-gray-500"
                    }`}
                  >
                    Seed Phrase
                  </button>
                </div>

                {importMethod === "privateKey" ? (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Private Key</label>
                    <div className="relative">
                      <input
                        type={showImportInput ? "text" : "password"}
                        placeholder="0x..."
                        value={privateKey}
                        onChange={(e) => {
                          setPrivateKey(e.target.value);
                          setImportError("");
                        }}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowImportInput(!showImportInput)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showImportInput ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Seed Phrase</label>
                    <textarea
                      rows={3}
                      placeholder="Enter your 12-24 word seed phrase..."
                      value={seedPhrase}
                      onChange={(e) => {
                        setSeedPhrase(e.target.value);
                        setImportError("");
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition resize-none"
                    />
                  </div>
                )}

                {importError && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                    <AlertCircle size={16} /> {importError}
                  </div>
                )}

                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-full rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {isImporting ? "Importing..." : "Import Wallet"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}