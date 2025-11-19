// app/api/users/shelves/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/db/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

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

    const {
      shelf,
      comic,
    }: {
      shelf: "favorites" | "readLater" | "alreadyRead";
      comic: {
        volumeId: string;
        title?: string;
        coverUrl?: string;
        publisher?: string;
        year?: string;
      };
    } = body;

    if (!["favorites", "readLater", "alreadyRead"].includes(shelf)) {
      return NextResponse.json({ message: "Invalid shelf" }, { status: 400 });
    }

    if (!comic?.volumeId) {
      return NextResponse.json(
        { message: "Missing comic volumeId" },
        { status: 400 }
      );
    }

    const update = {
      $addToSet: {
        [shelf]: {
          volumeId: comic.volumeId,
          title: comic.title ?? "",
          coverUrl: comic.coverUrl ?? "",
          publisher: comic.publisher ?? "",
          year: comic.year ?? "",
        },
      },
    };

    const existing = await User.findOne({
      _id: userId,
      [`${shelf}.volumeId`]: comic.volumeId,
    }).lean();

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    console.error("Error updating shelf", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
// 👇 NEW: remove a comic from a shelf
export async function DELETE(req: NextRequest) {
  try {
    await connectToDB();

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
    const {
      shelf,
      volumeId,
    }: {
      shelf: "favorites" | "readLater" | "alreadyRead";
      volumeId: string;
    } = body;

    if (!["favorites", "readLater", "alreadyRead"].includes(shelf)) {
      return NextResponse.json({ message: "Invalid shelf" }, { status: 400 });
    }

    if (!volumeId) {
      return NextResponse.json(
        { message: "Missing volumeId" },
        { status: 400 }
      );
    }

    const update = {
      $pull: {
        [shelf]: { volumeId },
      },
    };

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    console.error("Error removing from shelf", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
