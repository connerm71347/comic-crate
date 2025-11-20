// app/api/comments/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/db/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Comment from "@/models/commentModel";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 params is a Promise
) {
  try {
    await connectToDB();

    // 🔐 Auth: if this fails, return 401 instead of 500
    let userId: string;
    try {
      userId = getDataFromToken(req);
    } catch (err) {
      console.error("[LIKE] Not authenticated:", err);
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // ⬇️ THIS is the important part
    const { id: commentId } = await context.params; // 👈 await the Promise

    console.log("[LIKE] hit for comment:", commentId, "user:", userId);

    if (!commentId) {
      return NextResponse.json(
        { message: "Missing comment id" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.log("[LIKE] Comment not found:", commentId);
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    const alreadyLiked = comment.likes.some(
      (likeId: unknown) => String(likeId) === String(userId)
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (likeId: unknown) => String(likeId) !== String(userId)
      );
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    return NextResponse.json({ data: comment });
  } catch (err: unknown) {
    console.error("POST /api/comments/[id]/like error:", err);
    return NextResponse.json(
      { message: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
