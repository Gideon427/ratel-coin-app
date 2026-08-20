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

export async function GET(req: Request, context: { params: Promise<{ address: string }> }) {
  try {
    const params = await context.params;
    const addr = params?.address;
    if (!addr) return NextResponse.json({ error: 'missing address' }, { status: 400 });
    let normalized: string;
    try {
      normalized = ethers.getAddress(String(addr).trim());
    } catch (e) {
      return NextResponse.json({ error: 'invalid address' }, { status: 400 });
    }

    const store = readStore();
    const data = store[normalized] || null;
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (e) {
    console.error('GET wallet error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
