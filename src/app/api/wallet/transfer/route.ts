import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';

const STORE_FILE = path.join(process.cwd(), '.wallet_store.json');

function readStore() {
  try {
    if (!fs.existsSync(STORE_FILE)) return {};
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('readStore error', e);
    return {};
  }
}

function writeStore(store: any) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('writeStore error', e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sender, recipient, amount, hash } = body;

    if (!sender || !recipient || typeof amount !== 'number') {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    // normalize addresses
    let sAddr: string;
    let rAddr: string;
    try {
      sAddr = ethers.getAddress(String(sender).trim());
      rAddr = ethers.getAddress(String(recipient).trim());
    } catch (e) {
      return NextResponse.json({ error: 'invalid address' }, { status: 400 });
    }

    const store = readStore();

    const now = new Date().toLocaleString();
    const transferKey = `${sAddr}:${rAddr}:${String(amount)}:${hash || ""}`;

    const senderState = store[sAddr];
    const recipientState = store[rAddr];

    if (senderState?.transactions?.some((tx: any) => tx.hash === hash && tx.type === 'sent')) {
      return NextResponse.json({ ok: true, duplicate: true, sender: senderState, recipient: recipientState });
    }

    if (recipientState?.transactions?.some((tx: any) => tx.hash === hash && tx.type === 'received')) {
      return NextResponse.json({ ok: true, duplicate: true, sender: senderState, recipient: recipientState });
    }

    // ensure sender exists
    if (!store[sAddr]) {
      store[sAddr] = {
        address: sAddr,
        email: `user_${sAddr.slice(0, 8)}@demo.com`,
        balance: 0,
        balanceUSD: 0,
        transactions: [],
        createdAt: new Date().toISOString(),
      };
    }

    // ensure recipient exists
    if (!store[rAddr]) {
      store[rAddr] = {
        address: rAddr,
        email: `user_${rAddr.slice(0, 8)}@demo.com`,
        balance: 0,
        balanceUSD: 0,
        transactions: [],
        createdAt: new Date().toISOString(),
      };
    }

    // debit sender
    store[sAddr].balance = Number((store[sAddr].balance - amount).toFixed(2));
    store[sAddr].balanceUSD = Number((store[sAddr].balance * 1.98).toFixed(2));
    store[sAddr].transactions = [
      {
        id: Date.now() + Math.floor(Math.random() * 10000),
        type: 'sent',
        amount,
        address: rAddr,
        to: rAddr,
        date: now,
        status: 'completed',
        hash: hash || '',
      },
      ...(store[sAddr].transactions || []),
    ];

    // credit recipient
    store[rAddr].balance = Number((store[rAddr].balance + amount).toFixed(2));
    store[rAddr].balanceUSD = Number((store[rAddr].balance * 1.98).toFixed(2));
    store[rAddr].transactions = [
      {
        id: Date.now() + Math.floor(Math.random() * 10000),
        type: 'received',
        amount,
        address: sAddr,
        from: sAddr,
        date: now,
        status: 'completed',
        hash: hash || '',
      },
      ...(store[rAddr].transactions || []),
    ];

    writeStore(store);

    return NextResponse.json({ ok: true, sender: store[sAddr], recipient: store[rAddr] });
  } catch (e) {
    console.error('transfer error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
