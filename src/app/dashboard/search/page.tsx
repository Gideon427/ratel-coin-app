import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 px-4 py-12 text-center text-gray-500">Loading search...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}