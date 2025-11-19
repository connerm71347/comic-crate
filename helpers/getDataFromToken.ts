import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function getDataFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(
      token,
      process.env.TOKEN_SECRET!
    ) as { id: string };
    return decodedToken.id;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid token";
    throw new Error(message);
  }
}
