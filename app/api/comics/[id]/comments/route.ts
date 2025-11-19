// app/api/comics/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/db/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Comment from "@/models/commentModel";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

// GET /api/comics/:id/comments
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 params is a Promise
) {
  try {
    await connectToDB();

    const { id: comicVolumeId } = await context.params; // 👈 await here

    if (!comicVolumeId) {
      return NextResponse.json(
        { message: "Missing comic id in URL" },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ comicVolumeId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: comments });
  } catch (err: any) {
    console.error("GET /api/comics/[id]/comments error:", err);
    return NextResponse.json(
      { message: "Failed to load comments" },
      { status: 500 }
    );
  }
}

// POST /api/comics/:id/comments
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 same idea
) {
  try {
    await connectToDB();

    const { id: comicVolumeId } = await context.params; // 👈 await again

    if (!comicVolumeId) {
      return NextResponse.json(
        { message: "Missing comic id in URL" },
        { status: 400 }
      );
    }

    // user from JWT cookie
    let userId: string;
    try {
      userId = getDataFromToken(req);
    } catch {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const text = (body?.text ?? "").trim();

    if (!text) {
      return NextResponse.json(
        { message: "Comment text is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("username");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const comment = await Comment.create({
      comicVolumeId,
      user: userId,
      username: user.username,
      text,
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/comics/[id]/comments error:", err);
    return NextResponse.json(
      { message: "Failed to post comment" },
      { status: 500 }
    );
  }
}
