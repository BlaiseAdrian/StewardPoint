import { NextResponse } from "next/server";
import { colUsers, colInvestments } from "@/lib/collections";
import { toId, asStringId } from "../_id";
import { computeInterestDue } from "@/lib/logic";

export async function POST(req) {
  const { userId, investmentId, amount, date } = await req.json();

  const usersCol = await colUsers();
  const invCol   = await colInvestments();

  const admin = await usersCol.findOne({ _id: toId(userId) });
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const inv = await invCol.findOne({ _id: toId(investmentId) });
  if (!inv) return NextResponse.json({ error: "Investment not found" }, { status: 404 });

  const payAmount = Math.round(Number(amount) || 0);
  const payDate   = date || new Date().toISOString().slice(0,10);
  if (payAmount <= 0) return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });

  const { interestDue } = computeInterestDue(inv, payDate);
  const totalInterestToSettle = interestDue + (inv.carryForwardInterest || 0);

  let principalLeft = inv.principalLeft || 0;
  let interestPaid  = inv.interestPaid  || 0;
  let carryForwardInterest = inv.carryForwardInterest || 0;

  if (payAmount < totalInterestToSettle) {
    interestPaid += payAmount;
    carryForwardInterest = totalInterestToSettle - payAmount;
  } else {
    interestPaid += totalInterestToSettle;
    carryForwardInterest = 0;
    const remainder = payAmount - totalInterestToSettle;
    principalLeft = Math.max(0, principalLeft - remainder);
  }

  const status = (principalLeft === 0 && carryForwardInterest === 0) ? "Ended" : inv.status;

  await invCol.updateOne(
    { _id: inv._id },
    {
      $set: {
        principalLeft,
        interestPaid,
        carryForwardInterest,
        lastPaymentDate: payDate,
        status,
      },
      $push: { payments: { date: payDate, amount: payAmount } },
    }
  );

  const updated = await invCol.findOne({ _id: inv._id });
  // normalize on the way out
  return NextResponse.json({
    ok: true,
    investment: {
      ...updated,
      _id: asStringId(updated._id),
      participants: (updated.participants || []).map(p => ({ userId: asStringId(p.userId), amount: Number(p.amount)||0 })),
      payments: (updated.payments || []).map(pm => ({ date: pm.date, amount: Number(pm.amount)||0 })),
    }
  });
}
