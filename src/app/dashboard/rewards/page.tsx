"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gift, Star, Award, Trophy, Sparkles, Clock } from "lucide-react";

export default function RewardsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [rewards] = useState([
    { id: 1, title: "Welcome Bonus", points: 500, claimed: true, icon: Gift },
    { id: 2, title: "Daily Check-in", points: 50, claimed: false, icon: Clock },
    { id: 3, title: "Referral Reward", points: 1000, claimed: false, icon: Star },
    { id: 4, title: "Staking Bonus", points: 250, claimed: false, icon: Award },
    { id: 5, title: "Loyalty Reward", points: 750, claimed: true, icon: Trophy },
    { id: 6, title: "Special Event", points: 300, claimed: false, icon: Sparkles },
  ]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
            <p className="text-sm text-gray-500">Earn points and unlock benefits</p>
          </div>
          <div className="mt-4 sm:mt-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl px-6 py-3 text-white shadow-lg">
            <p className="text-sm">Total Points</p>
            <p className="text-2xl font-bold">2,850</p>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const IconComponent = reward.icon;
            return (
              <div
                key={reward.id}
                className={`bg-white rounded-2xl shadow-sm border p-6 transition hover:shadow-md ${
                  reward.claimed ? "border-green-200" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    reward.claimed ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <IconComponent className={reward.claimed ? "text-green-600" : "text-red-600"} size={24} />
                  </div>
                  {reward.claimed && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Claimed</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-4">{reward.title}</h3>
                <p className="text-2xl font-bold text-red-600 mt-2">+{reward.points} pts</p>
                <button
                  className={`w-full mt-4 py-2.5 rounded-lg font-medium transition ${
                    reward.claimed
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  disabled={reward.claimed}
                >
                  {reward.claimed ? "Claimed" : "Claim Reward"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}