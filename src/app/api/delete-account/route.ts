import { NextRequest, NextResponse } from "next/server";
import { getActiveAccount, deleteAccountById } from "@/lib/authStorage";

export async function DELETE(req: NextRequest) {
  try {
    const { confirm } = await req.json();

    if (confirm !== true) {
      return NextResponse.json(
        { error: "Confirmation required" },
        { status: 400 }
      );
    }

    const user = getActiveAccount();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const result = deleteAccountById(user.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}