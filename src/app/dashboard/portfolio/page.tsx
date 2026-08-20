"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortfolioPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/analytics");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4">Redirecting to Analytics...</p>
      </div>
    </div>
  );
}
