import { connectToDB } from "@/db/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";

connectToDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { token } = reqBody;
    console.log("Received token:🪙", token);
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }
    console.log("User found:👤", user); //for future debugging
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();
    return NextResponse.json({
      message: "Email verified successfully✅📩",
      success: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json(
      { message: "Failed to verify email", error: message },
      { status: 500 }
    );
  }
}
