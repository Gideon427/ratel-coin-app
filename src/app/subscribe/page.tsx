import Link from "next/link";
import Footer from "../components/Footer";

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="bg-gradient-to-b from-red-50 to-white px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-red-100 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Newsletter</p>
          <h1 className="mt-4 text-4xl font-bold">Subscribe for updates</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Get product announcements, ecosystem news, and early access updates delivered right to your inbox.
          </p>

          <div className="mt-10 rounded-3xl border border-gray-200 bg-gray-50 p-8">
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500"
            />
            <button className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
              Join the list
            </button>
          </div>

          <div className="mt-10">
            <Link href="/" className="text-sm font-semibold text-red-600 hover:text-red-700">
              Return home →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
