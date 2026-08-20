import type { ReactNode } from "react";
import Footer from "./Footer";

type InfoPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function InfoPage({ title, description, children }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="bg-gray-50 min-h-[calc(100vh-80px)] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-10 shadow-sm">
            <div className="mb-8">
              <p className="text-sm uppercase font-semibold tracking-[.24em] text-red-600">
                Footer Navigation
              </p>
              <h1 className="mt-4 text-4xl font-bold">{title}</h1>
              <p className="mt-4 text-gray-600">{description}</p>
            </div>
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
