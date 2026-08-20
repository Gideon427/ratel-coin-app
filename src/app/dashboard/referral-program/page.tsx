"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";

export default function ReferralProgramPage() {
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
            <Gift className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
              <p className="mt-1 text-sm text-gray-500">Invite friends, earn rewards, and grow your network.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8">
            <p className="text-gray-600">
              Share your referral link and earn bonuses when your friends sign up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
