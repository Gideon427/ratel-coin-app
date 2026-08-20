import Link from "next/link";
import Footer from "../components/Footer";

const resourceSections = [
  {
    title: "Documentation",
    description: "Browse setup guides, wallet usage notes, and ecosystem references.",
    href: "/documentation",
  },
  {
    title: "API Docs",
    description: "Access developer references for integrating with Ratel Coin services.",
    href: "/api-docs",
  },
  {
    title: "Whitepaper",
    description: "Read the latest overview of the Ratel Coin vision and roadmap.",
    href: "/whitepaper",
  },
  {
    title: "Blog",
    description: "Stay updated with ecosystem stories, product updates, and ideas.",
    href: "/blog",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="bg-gradient-to-b from-red-50 to-white px-6 py-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-100 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Resources</p>
          <h1 className="mt-4 text-4xl font-bold">Resources and learning materials</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Explore the latest documentation, guides, and product updates for the Ratel Coin ecosystem.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {resourceSections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:border-red-200 hover:bg-white"
              >
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                <p className="mt-3 text-gray-600">{section.description}</p>
                <span className="mt-5 inline-block text-sm font-semibold text-red-600">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
