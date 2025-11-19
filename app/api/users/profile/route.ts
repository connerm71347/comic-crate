// app/api/users/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/db/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

// GET /api/users/profile  -> get current user's full profile
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const userId = getDataFromToken(req); // throws if no/invalid token
    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (err: unknown) {
    console.error("GET /api/users/profile error:", err);
    return NextResponse.json(
      { message: "Failed to load profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/profile  -> update bio / favorites / avatar, etc.
export async function PATCH(req: NextRequest) {
  try {
    await connectToDB();

    const userId = getDataFromToken(req);

    const body = await req.json();
    const {
      bio,
      favoriteHero,
      favoriteComic,
      avatarKey,
    }: {
      bio?: string;
      favoriteHero?: string;
      favoriteComic?: string;
      avatarKey?: string;
    } = body || {};

    // Build an update object with only provided fields
    const update: Record<string, string> = {};
    if (typeof bio === "string") update.bio = bio;
    if (typeof favoriteHero === "string") update.favoriteHero = favoriteHero;
    if (typeof favoriteComic === "string") update.favoriteComic = favoriteComic;
    if (typeof avatarKey === "string") update.avatarKey = avatarKey;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: "No profile fields to update" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated", data: user });
  } catch (err: unknown) {
    console.error("PATCH /api/users/profile error:", err);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
