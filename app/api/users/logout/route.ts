import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Logged out successfully",
      success: true,
    });
    response.cookies.set("token", "", {
      httpOnly: true,
    });
    return response;
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
