// scripts/run_wallet_demo.js
// Simulate browser localStorage in Node and test debit/credit flows

// Simple in-memory localStorage shim
const store = Object.create(null);
global.window = {};
global.localStorage = {
  getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  key: (i) => Object.keys(store)[i] || null,
  get length() { return Object.keys(store).length; },
};

async function run() {
  try {
    const walletService = require('../tmp_test/walletService.js');

    // Generate two addresses
    const sender = walletService.generateRandomWalletAddress();
    const recipient = walletService.generateRandomWalletAddress();

    console.log('Sender:', sender);
    console.log('Recipient:', recipient);

    // Initialize sender and recipient
    const senderData = walletService.initializeWalletData(sender, 'sender@example.com', 500);
    const recipientData = walletService.initializeWalletData(recipient, 'recipient@example.com', 10);

    console.log('Initial sender balance:', senderData.balance);
    console.log('Initial recipient balance:', recipientData.balance);

    // Simulate a send of 50
    const amount = 50;
    const fakeHash = '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

    const updatedSender = walletService.debitWallet(sender, amount, recipient, fakeHash);
    const updatedRecipient = walletService.creditWallet(recipient, amount, sender, fakeHash);

    console.log('After transfer:');
    console.log('Sender balance:', updatedSender.balance);
    console.log('Recipient balance:', updatedRecipient.balance);

    // Dump localStorage keys related to wallets
    console.log('\nLocalStorage wallet entries:');
    for (const k of Object.keys(store)) {
      if (k.startsWith('wallet_data_')) {
        console.log(k, '=>', store[k]);
      }
    }
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 2;
  }
}

run();
