"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsMainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings/appearance");
  }, [router]);

  return null;
}