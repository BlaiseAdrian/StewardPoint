import { NextResponse } from "next/server";
import { colUsers } from "@/lib/collections";
import { asStringId } from "../_id";

export async function POST(req) {
  const { password } = await req.json();
  const users = await colUsers();

  // Simple: find by password (your 5-digit code)
  const user = await users.findOne({ password: String(password) });
  if (!user) return NextResponse.json({ error: "Invalid code" }, { status: 401 });

  // Return the user without password, and stringify _id for the client
  const { password: _omit, ...rest } = user;
  return NextResponse.json({ ...rest, _id: asStringId(user._id) });
}
