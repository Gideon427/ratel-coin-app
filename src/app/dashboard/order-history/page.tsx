"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default function OrderHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
              <p className="mt-1 text-sm text-gray-500">Review your recent order activity and history.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
            No orders to display yet. Start trading to populate your history.
          </div>
        </div>
      </div>
    </div>
  );
}
