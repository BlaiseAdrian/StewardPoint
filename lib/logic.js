const diffDays = (a, b) => Math.ceil((new Date(b) - new Date(a)) / (1000*60*60*24));

export function computeInterestDue(inv, paymentDateStr) {
  const paymentDate = new Date(paymentDateStr);
  const last = new Date(inv.lastPaymentDate || inv.date);
  let monthsDue = inv.payments.length == 0 ? Math.ceil(Math.max(0, (diffDays(inv.date, paymentDate) - 7)) / 30) : Math.ceil(Math.max(0, (diffDays(inv.date, paymentDate) - 7)) / 30) - Math.ceil((diffDays(inv.date, last) - 7) / 30);
  const rate = (inv.monthlyRate || 0) / 100;
  const interestDue = Math.round((inv.principalLeft || 0) * rate * monthsDue);
  return { interestDue, monthsDue };
}

export function computeCompanyFigures(invs, nowDateStr) {
  let currentInvested = 0, totalInvestments = 0, expectedEOM = 0, totalEarnings = 0;
  invs.forEach(inv => {
    totalInvestments += inv.amount || 0;
    totalEarnings += inv.interestPaid || 0;
    if ((inv.status || "") === "Ongoing") currentInvested += inv.principalLeft || 0;
    const { interestDue } = computeInterestDue(inv, nowDateStr);
    expectedEOM += interestDue + inv.carryForwardInterest;
  });
  return { currentInvested, totalInvestments, expectedEOM, totalEarnings };
}

export function computeUserFigures(userId, invs, nowDateStr) {
  let currentInvested = 0, totalInvestments = 0, expectedEOM = 0, totalEarnings = 0;
  invs.forEach(inv => {
    const part = Number(inv.participants?.find(p => String(p.userId) === String(userId))?.amount || 0);
    const amt  = Number(inv.amount || 0);
    totalInvestments += part;
    if (inv.status === "Ongoing" && amt > 0 && part > 0) {
      const term = (Number(inv.principalLeft || 0) * part) / amt;
      if (Number.isFinite(term)) currentInvested += term;
    }
    const { interestDue } = computeInterestDue(inv, nowDateStr);
    if (amt > 0 && part > 0) {
      const frac = part / amt;
      expectedEOM += (interestDue + inv.carryForwardInterest) * frac;
      totalEarnings += (Number(inv.interestPaid || 0)) * frac;
    }
  });
  return {
    currentInvested: Math.round(currentInvested) || 0,
    totalInvestments: Math.round(totalInvestments) || 0,
    expectedEOM: Math.round(expectedEOM) || 0,
    totalEarnings: Math.round(totalEarnings) || 0,
  };
}

export function buildNameMap(users) {
  const m = new Map();
  users.forEach(u => m.set(String(u._id), u.name));
  return m;
}

export function sanitizeInvestmentForUser(inv, user, nameMap) {
  const isAdmin = user.role === "admin";
  const base = {
    _id: String(inv._id),
    projectName: inv.projectName,
    amount: inv.amount,
    date: inv.date,
    responsiblePerson: inv.responsiblePerson,
    returnDate: inv.returnDate,
    principalLeft: inv.principalLeft,
    status: inv.status,
    interestPaid: inv.interestPaid,
    monthlyRate: inv.monthlyRate,
    payments: inv.payments || [],
  };
  if (isAdmin) {
    return {
      ...base,
      lastPaymentDate: inv.lastPaymentDate,
      carryForwardInterest: inv.carryForwardInterest,
      participants: (inv.participants || []).map(p => ({
        userId: String(p.userId),
        name: nameMap?.get(String(p.userId)) || String(p.userId),
        amount: p.amount,
      })),
    };
  }
  const yourParticipation = inv.participants?.find(p => String(p.userId) === String(user._id))?.amount || 0;
  const { projectName, ...rest } = base; // hide project name for non-admins if you want
  return { ...rest, yourParticipation, totalProjectAmount: inv.amount };
}
