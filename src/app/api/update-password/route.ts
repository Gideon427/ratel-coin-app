import { NextRequest, NextResponse } from "next/server";
import { getActiveAccount, updateUserPassword } from "@/lib/authStorage";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = getActiveAccount();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const updated = updateUserPassword(user.id, newPassword);
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}