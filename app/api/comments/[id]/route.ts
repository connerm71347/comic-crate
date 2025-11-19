// app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/db/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Comment from "@/models/commentModel";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    // 🔐 who is trying to delete?
    let userId: string;
    try {
      userId = getDataFromToken(req);
    } catch {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // ⬇️ same pattern as like route
    const { id: commentId } = await context.params;

    if (!commentId) {
      return NextResponse.json(
        { message: "Missing comment id" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    // 🧠 only allow owner or admin to delete
    const user = await User.findById(userId).select("isAdmin");
    const isOwner = String(comment.user) === String(userId);
    const isAdmin = !!user?.isAdmin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "You are not allowed to delete this comment." },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/comments/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
