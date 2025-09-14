// app/api/investments/route.js
import { NextResponse } from "next/server";
import { colUsers, colInvestments } from "@/lib/collections";
import { toId, asStringId } from "../_id";
import {
  computeCompanyFigures, computeUserFigures,
  sanitizeInvestmentForUser, buildNameMap
} from "@/lib/logic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const usersCol = await colUsers();
    const invCol   = await colInvestments();

    const user = await usersCol.findOne({ _id: toId(userId) });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allUsers = await usersCol.find({}, { projection: { password: 0 } }).toArray();
    const nameMap  = buildNameMap(allUsers.map(u => ({ ...u, _id: asStringId(u._id) })));

    const raw = await invCol.find({}).sort({ date: -1 }).toArray();
    const invs = raw.map(inv => ({
      ...inv,
      _id: asStringId(inv._id),
      participants: (inv.participants || []).map(p => ({ userId: asStringId(p.userId), amount: Number(p.amount) || 0 })),
      payments: (inv.payments || []).map(pm => ({ date: pm.date, amount: Number(pm.amount) || 0 })),
    }));

    const nowStr   = new Date().toISOString().slice(0,10);
    const userStrId = asStringId(user._id);
    const personal = computeUserFigures(userStrId, invs, nowStr);
    const company  = computeCompanyFigures(invs, nowStr);
    const visible  = invs.map(inv => sanitizeInvestmentForUser(inv, { ...user, _id: userStrId }, nameMap));
    const safeUsers = allUsers.map(u => ({ ...u, _id: asStringId(u._id) }));

    return NextResponse.json({ personal, company, investments: visible, users: safeUsers });
  } catch (e) {
    console.error("[API /investments GET] ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, data } = await req.json();
    const usersCol = await colUsers();
    const invCol   = await colInvestments();

    const admin = await usersCol.findOne({ _id: toId(userId) });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Map responsiblePerson (userId) -> name if needed
    let responsibleName = data.responsiblePerson;
    const rp = await usersCol.findOne({ _id: toId(data.responsiblePerson) }, { projection: { name: 1 } });
    if (rp?.name) responsibleName = rp.name;

    const now = new Date();
    const doc = {
      projectName: data.projectName,
      amount: Number(data.amount) || 0,
      date: now.toISOString().slice(0,10),
      responsiblePerson: responsibleName,
      returnDate: data.returnDate || "",
      principalLeft: Number(data.amount) || 0,
      status: "Ongoing",
      lastPaymentDate: now.toISOString().slice(0,10),
      carryForwardInterest: 0,
      interestPaid: 0,
      monthlyRate: Number(data.monthlyRate) || 0,
      participants: Array.isArray(data.participants)
        ? data.participants.map(p => ({ userId: toId(p.userId), amount: Number(p.amount) || 0 }))
        : [],
      payments: [],
    };

    const res = await invCol.insertOne(doc);
    // normalize on output
    const created = {
      ...doc,
      _id: asStringId(res.insertedId),
      participants: doc.participants.map(p => ({ userId: asStringId(p.userId), amount: p.amount })),
    };

    return NextResponse.json({ ok: true, investment: created });
  } catch (e) {
    console.error("[API /investments POST] ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
