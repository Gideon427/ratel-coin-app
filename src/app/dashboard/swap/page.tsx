import Link from "next/link";

export default function DashboardSwapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Wallet</p>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Swap assets</h1>
          <p className="mt-3 text-gray-600">Exchange supported assets directly from your wallet.</p>
          <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-8">
            <p className="text-sm text-gray-500">Select pair</p>
            <div className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700">
              RTC ↔ USDT
            </div>
            <button className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white">Review swap</button>
          </div>
          <div className="mt-6">
            <Link href="/dashboard" className="text-sm font-semibold text-red-600">Back to dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
