import { NextRequest, NextResponse } from "next/server";
import { getActiveAccount, updateUserSettings } from "@/lib/authStorage";

export async function POST(req: NextRequest) {
  try {
    const { enabled } = await req.json();

    const user = getActiveAccount();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const updated = updateUserSettings(user.id, { twoFactorEnabled: enabled });
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update 2FA setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      twoFactorEnabled: enabled,
      message: enabled
        ? "Two‑factor authentication enabled. Check your email for setup instructions."
        : "Two‑factor authentication disabled.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}