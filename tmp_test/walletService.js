"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletStorageKey = getWalletStorageKey;
exports.normalizeAddress = normalizeAddress;
exports.generateWalletAddress = generateWalletAddress;
exports.generateRandomWalletAddress = generateRandomWalletAddress;
exports.formatAddress = formatAddress;
exports.isValidAddress = isValidAddress;
exports.readWalletState = readWalletState;
exports.persistWalletState = persistWalletState;
exports.initializeWalletData = initializeWalletData;
exports.createTransaction = createTransaction;
exports.debitWallet = debitWallet;
exports.creditWallet = creditWallet;
exports.generateUserId = generateUserId;
const ethers_1 = require("ethers");
const WALLET_STORAGE_PREFIX = "wallet_data_";
function getWalletStorageKey(address) {
    return `${WALLET_STORAGE_PREFIX}${address}`;
}
function normalizeAddress(address) {
    if (!address)
        return null;
    try {
        // ethers.getAddress enforces checksum formatting
        return ethers_1.ethers.getAddress(address.trim());
    }
    catch (err) {
        try {
            // fallback: if address missing 0x or has whitespace, try trimming and prefix
            const trimmed = address.trim();
            if (trimmed.startsWith("0x") && trimmed.length === 42) {
                return ethers_1.ethers.getAddress(trimmed);
            }
        }
        catch (e) {
            return null;
        }
        return null;
    }
}
function generateWalletAddress(userId) {
    const hash = ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(userId + "ratel-chain-salt"));
    return ethers_1.ethers.getAddress(`0x${hash.slice(2, 42)}`);
}
function generateRandomWalletAddress() {
    const wallet = ethers_1.ethers.Wallet.createRandom();
    return wallet.address;
}
function formatAddress(address) {
    if (!address)
        return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function isValidAddress(address) {
    try {
        return ethers_1.ethers.isAddress(address);
    }
    catch {
        return false;
    }
}
function readWalletState(address) {
    if (!address || typeof window === "undefined")
        return null;
    const normalized = normalizeAddress(address);
    if (!normalized)
        return null;
    const storageKey = getWalletStorageKey(normalized);
    const storedData = localStorage.getItem(storageKey);
    if (!storedData)
        return null;
    try {
        return JSON.parse(storedData);
    }
    catch (error) {
        console.error("Failed to parse wallet state:", error);
        return null;
    }
}
function persistWalletState(address, data) {
    if (!address || typeof window === "undefined")
        return;
    const normalized = normalizeAddress(address);
    if (!normalized)
        return;
    try {
        // Ensure stored `address` field uses the normalized value
        const dataToStore = { ...data, address: normalized };
        localStorage.setItem(getWalletStorageKey(normalized), JSON.stringify(dataToStore));
    }
    catch (error) {
        console.error("Failed to persist wallet state:", error);
    }
}
function initializeWalletData(address, email, initialBalance = 1000) {
    const normalized = normalizeAddress(address) || address;
    const existingData = readWalletState(normalized);
    if (existingData)
        return existingData;
    const initialData = {
        address: normalized,
        email,
        balance: initialBalance,
        balanceUSD: Number((initialBalance * 1.98).toFixed(2)),
        transactions: [
            {
                id: Date.now(),
                type: "received",
                amount: initialBalance,
                address: "Ratel Coin Faucet",
                from: "Ratel Coin Faucet",
                date: new Date().toLocaleString(),
                status: "completed",
                hash: "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
            },
        ],
        createdAt: new Date().toISOString(),
    };
    persistWalletState(address, initialData);
    return initialData;
}
function createTransaction(type, amount, counterpartyAddress, hash) {
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
function debitWallet(address, amount, toAddress, hash) {
    const normalizedSender = normalizeAddress(address);
    const normalizedTo = normalizeAddress(toAddress) || toAddress.trim();
    if (!normalizedSender)
        return null;
    const existingData = readWalletState(normalizedSender);
    if (!existingData)
        return null;
    const updatedData = {
        ...existingData,
        balance: Number((existingData.balance - amount).toFixed(2)),
        balanceUSD: Number(((existingData.balance - amount) * 1.98).toFixed(2)),
        transactions: [
            createTransaction("sent", amount, normalizedTo, hash),
            ...existingData.transactions,
        ],
    };
    persistWalletState(normalizedSender, updatedData);
    return updatedData;
}
function creditWallet(address, amount, fromAddress, hash) {
    const normalizedRecipient = normalizeAddress(address) || address;
    const normalizedFrom = normalizeAddress(fromAddress) || fromAddress;
    const existingData = readWalletState(normalizedRecipient);
    const updatedData = existingData
        ? {
            ...existingData,
            balance: Number((existingData.balance + amount).toFixed(2)),
            balanceUSD: Number(((existingData.balance + amount) * 1.98).toFixed(2)),
            transactions: [
                createTransaction("received", amount, normalizedFrom, hash),
                ...existingData.transactions,
            ],
        }
        : {
            address: normalizedRecipient,
            email: `user_${normalizedRecipient.slice(0, 8)}@demo.com`,
            balance: Number(amount.toFixed(2)),
            balanceUSD: Number((amount * 1.98).toFixed(2)),
            transactions: [createTransaction("received", amount, normalizedFrom, hash)],
            createdAt: new Date().toISOString(),
        };
    persistWalletState(normalizedRecipient, updatedData);
    return updatedData;
}
function generateUserId(email) {
    return `${email.split("@")[0]}_${Date.now().toString(36)}`;
}
