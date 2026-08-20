import Link from "next/link";
import Footer from "../components/Footer";

export default function BuyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="bg-gradient-to-b from-red-50 to-white px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-red-100 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Purchase</p>
          <h1 className="mt-4 text-4xl font-bold">Buy Ratel Coin</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Start your journey with the ecosystem by purchasing Ratel Coin through our secure onboarding flow.
          </p>

          <div className="mt-10 grid gap-6 rounded-3xl border border-gray-200 bg-gray-50 p-8 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold">Fast checkout</h2>
              <p className="mt-3 text-gray-600">
                Secure payment options and instant wallet activation make getting started simple.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Trusted support</h2>
              <p className="mt-3 text-gray-600">
                Our team is ready to help you complete your purchase and set up your wallet.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/signup" className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
              Create account
            </Link>
            <Link href="/" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600">
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
