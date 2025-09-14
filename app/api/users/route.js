// app/api/users/route.js
import { NextResponse } from "next/server";
import { colUsers } from "@/lib/collections";
import { asStringId } from "../_id";

export async function GET() {
  try {
    const usersCol = await colUsers();
    // exclude password field
    const docs = await usersCol.find({}, { projection: { password: 0 } }).toArray();

    // ensure _id is stringified for the client
    const safe = docs.map(u => ({
      ...u,
      _id: asStringId(u._id),
    }));

    return NextResponse.json(safe);
  } catch (e) {
    console.error("[API /users] ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
