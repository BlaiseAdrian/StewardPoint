"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, DollarSign, Calendar, Users, PiggyBank, Percent, Plus, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";

/* =========================
   Theme (minimal + readable)
   ========================= */
const THEME = {
  navy: "#12243a",
  gold: "#f4c542",
  sky: "#e8f1ff",
  cardBg: "rgb(220,220,220, 0.4)",
  pageBg: "#f6f8fb",
  divider: "rgba(0,0,0,0.12)",
  text: "#0f172a",
  subtext: "#64748b",
  accent: "#4f46e5",
  danger: "#ef4444",
};

/* =========================
   Responsive helpers
   ========================= */
function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = React.useState(
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : true
  );
  React.useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isDesktop;
}
function useViewportHeights({ navH = 56, tabsH = 44, vPad = 16, gridGap = 12 } = {}) {
  const isDesktop = useIsDesktop();
  const [dims, setDims] = React.useState({ mainH: 600, cardH: 280 });
  React.useLayoutEffect(() => {
    const recalc = () => {
      const h = typeof window !== "undefined" ? window.innerHeight : 800;
      const chrome = navH + (isDesktop ? 0 : tabsH) + vPad * 2;
      const mainH = Math.max(0, h - chrome);
      const cardH = Math.max(160, (mainH - gridGap) / 2);
      setDims({ mainH, cardH });
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [isDesktop, navH, tabsH, vPad, gridGap]);
  return { isDesktop, ...dims };
}

/* =========================
   Utilities
   ========================= */
function formatUGX(value) {
  const n = new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(value || 0);
  return `UGX ${n}`;
}
function ordinal(n){const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
function endOfCurrentMonthLabel(d=new Date()){const e=new Date(d.getFullYear(),d.getMonth()+1,0);return `${ordinal(e.getDate())} ${e.toLocaleString(undefined,{month:"long"})} ${e.getFullYear()}`;}

/* =========================
   Minimal Modal
   ========================= */
function Modal({ title, children, footer, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ width: "min(620px, 92vw)", background: THEME.cardBg, borderRadius: 12, border: `1px solid ${THEME.divider}`, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${THEME.divider}`, fontWeight: 800, color: THEME.navy }}>{title}</div>
        <div style={{ padding: 16 }}>{children}</div>
        <div style={{ padding: 12, borderTop: `1px solid ${THEME.divider}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {footer ?? (
            <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${THEME.divider}`, background: THEME.cardBg, cursor: "pointer" }}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Top Nav (with Logout)
   ========================= */
function TopNav() {
  const router = useRouter();
  function onLogout() {
    try { localStorage.removeItem("user"); } catch {}
    router.replace("/login");
  }
  return (
    <div style={{ position: "sticky", top: 0, background: THEME.cardBg, borderBottom: `1px solid ${THEME.divider}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, height: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: THEME.navy }}>StewardPoint Capital</span>
      </div>
      <button onClick={onLogout} title="Log out" style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${THEME.danger}`, background: `${THEME.danger}10`, color: THEME.danger, cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}

/* =========================
   Mobile Tabs
   ========================= */
function MobileTabs({ active, onChange }) {
  const items = [{ key: "summary", label: "Summary" }, { key: "investments", label: "Investments" }];
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    const el = scrollRef.current?.querySelector(".active-pill");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);
  return (
    <div ref={scrollRef} style={{ display: "flex", gap: 10, padding: "10px 12px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      {items.map(it => {
        const isActive = active === it.key;
        return (
          <button key={it.key} onClick={()=>onChange(it.key)} className={isActive ? "active-pill" : undefined} style={{
            flexShrink: 0, padding: "8px 16px", borderRadius: 999, fontWeight: 600, cursor: "pointer",
            background: isActive ? THEME.navy : THEME.cardBg, color: isActive ? THEME.gold : THEME.navy,
            border: `1px solid ${THEME.divider}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", whiteSpace: "nowrap",
          }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================
   Summary Cards (2×2 desktop, 1×4 mobile)
   ========================= */
function StatCell({ label, value, Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "1.6vw"}}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: THEME.sky, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {Icon ? <Icon size={18} color={THEME.navy} /> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 11, color: THEME.subtext, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontWeight: 900, fontSize: 24, lineHeight: 1, color: THEME.text, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}
function StatsCard({ title, figures, height, isDesktop }) {
  const eomLabel = endOfCurrentMonthLabel();
  const gridCols = isDesktop ? "1fr 1fr" : "1fr";
  const gridRows = isDesktop ? undefined : "auto auto auto auto";
  const gap = isDesktop ? 12 : 10;
  return (
    <div style={{ border: `1px solid ${THEME.divider}`, borderRadius: "16px 16px 12px 12px", padding: 12, background: "rgb(220,220,220, 0.4)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", height }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: THEME.navy, margin: 0, display: "flex", alignItems: "center", gap: 8, padding: "1vh", paddingBottom: 0 }}>
        {title}
      </h3>
      <div style={{ height: 1, background: "gray", margin: "8px 0", borderRadius: 1 }} />
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gridTemplateRows: gridRows, gap, alignContent: "start", flex: "1 1 auto" }}>
        <StatCell label="Currently Invested" value={formatUGX(figures.currentInvested)} Icon={Wallet} />
        <StatCell label="Total Investments" value={formatUGX(figures.totalInvestments)} Icon={DollarSign} />
        <StatCell label="Unpaid earnings" value={formatUGX(figures.expectedEOM)} Icon={Calendar} />
        <StatCell label="Total Paid Earnings" value={formatUGX(figures.totalEarnings)} Icon={TrendingUp} />
      </div>
    </div>
  );
}

/* =========================
   Investments (Accordion)
   ========================= */
function InvestmentsList({ items = [], currentUser, onOpenPayment, users = [], filter = "" }) {
  const [openIndex, setOpenIndex] = React.useState(null);
  const isAdmin = currentUser?.role === "admin";
  const toggle = (i) => setOpenIndex(prev => prev === i ? null : i);
 
  const nameById = React.useMemo(() => {
    const m = new Map();
    users.forEach(u => m.set(u._id, u.name));
    return m;
  }, [users]);

  const filteredItems = items.filter(inv => 
    inv.date?.toLowerCase().includes(filter.toLowerCase()) || 
    inv.projectName?.toLowerCase().includes(filter.toLowerCase()) ||
    inv.status?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ marginTop: 8, height: "100%", overflowY: "auto", paddingRight: 8 }}>
      {filteredItems.length === 0 && (
        <div style={{ padding: 12, textAlign: "center", background: THEME.cardBg, border: `1px solid ${THEME.divider}`, borderRadius: 8 }}>
          No records found.
        </div>
      )}

      {filteredItems.map((inv, i) => {
        const isOpen = openIndex === i;
        const borderColor = inv.status === "Ongoing" ? THEME.navy : THEME.divider;

        return (
          <div key={inv._id || i} style={{ border: `2px solid ${borderColor}`, borderRadius: 10, marginBottom: 10, background: THEME.cardBg, overflow: "hidden" }}>
            {/* Header: DATE + STATUS (below) left; AMOUNT LEFT right */}
            <button onClick={() => toggle(i)} aria-expanded={isOpen} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div>
                <div style={{ fontSize: 14, color: THEME.navy, fontWeight: 800 }}>{inv.date || "-"}</div>
                <div style={{ fontSize: 12, color: THEME.subtext, marginTop: 4 }}>Status: <strong style={{ color: THEME.navy }}>{inv.status}</strong></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 14, color: THEME.navy, fontWeight: 800 }}>Left: {formatUGX(inv.principalLeft || 0)}</div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}>
                  <path d="M6 9L12 15L18 9" stroke={THEME.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div style={{ padding: 12, background: "#fff" }}>
                {/* Details: hide project name, last payment, carryForwardInterest for non-admins */}
                <div style={{ marginBottom: 10 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <tbody>
                      {isAdmin && (
                        <tr><td style={{ padding: 6, width: "40%", fontWeight: 700 }}>Project</td><td style={{ padding: 6 }}>{inv.projectName}</td></tr>
                      )}
                      <tr><td style={{ padding: 6, fontWeight: 700 }}>Amount</td><td style={{ padding: 6 }}>{formatUGX(inv.amount)}</td></tr>
                      <tr><td style={{ padding: 6, fontWeight: 700 }}>Monthly rate</td><td style={{ padding: 6 }}>{inv.monthlyRate}%</td></tr>
                      {isAdmin && (
                        <tr><td style={{ padding: 6, fontWeight: 700 }}>Last payment</td><td style={{ padding: 6 }}>{inv.lastPaymentDate || "-"}</td></tr>
                      )}
                      <tr><td style={{ padding: 6, fontWeight: 700 }}>Interest paid</td><td style={{ padding: 6 }}>{formatUGX(inv.interestPaid || 0)}</td></tr>
                      {isAdmin && (
                        <tr><td style={{ padding: 6, fontWeight: 700 }}>Carry fwd interest</td><td style={{ padding: 6 }}>{formatUGX(inv.carryForwardInterest || 0)}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Participants visibility */}
                <div style={{ marginTop: 6 }}>
                {isAdmin ? (
                  <>
                    <div style={{ fontWeight: 800, marginBottom: 6, color: THEME.navy }}>Participants</div>
                    <ul style={{ paddingLeft: 16 }}>
                      {(inv.participants || []).map((p, idx) => (
                        <li key={idx}>{p.name || p.userId} — {formatUGX(p.amount)}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                    <div style={{ padding: 6, fontWeight: 700 }}>
                      <strong>Your Participation:</strong> {formatUGX(inv.yourParticipation || 0)}
                    </div>
                  )}
                </div>

                {/* Payments */}
                {isAdmin && (<div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 800, marginBottom: 6, color: THEME.navy }}>Payments</div>
                  {Array.isArray(inv.payments) && inv.payments.length > 0 ? (
                    <ul style={{ paddingLeft: 16 }}>
                      {inv.payments.map((p, idx) => {
                        // server may return objects or [date, amount]
                        const date = p.date ?? p[0];
                        const amt  = p.amount ?? p[1];
                        return <li key={idx}>{date} — {formatUGX(amt)}</li>;
                      })}
                    </ul>
                  ) : (
                    <div style={{ fontSize: 12, color: THEME.subtext }}>No payments recorded.</div>
                  )}
                </div>
                  )}
                {/* Admin-only payment button */}
                {isAdmin && (
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => onOpenPayment(inv)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${THEME.accent}`, background: `${THEME.accent}15`, color: THEME.accent, cursor: "pointer", fontWeight: 700 }}>
                      Record Payment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InvestmentsPanel({ items = [], currentUser, onOpenAdd, onOpenPayment }) {
  const [filter, setFilter] = React.useState("");
  const isAdmin = currentUser?.role === "admin";
  return (
    <div style={{ border: `1px solid ${THEME.divider}`, borderRadius: "12px 12px 8px 8px", padding: 12, background: THEME.cardBg, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: THEME.navy, display: "flex", gap: 8, alignItems: "center" }}>
          <Users size={16} color={THEME.accent} /> Investments
        </h3>
        {isAdmin && (
          <button onClick={onOpenAdd} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 8, border: `1px solid ${THEME.accent}`, background: `${THEME.accent}15`, color: THEME.accent, cursor: "pointer", fontWeight: 700 }}>
            <Plus size={16} /> Add Investment
          </button>
        )}
      </div>
      {isAdmin && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} color={THEME.subtext} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              placeholder="Search by date, project, or status..." 
              style={{ 
                width: "100%", 
                padding: "8px 12px 8px 36px", 
                border: `1px solid ${THEME.divider}`, 
                borderRadius: 8, 
                fontSize: 14 
              }} 
            />
          </div>
        </div>
      )}
      <div style={{ height: 1, background: THEME.divider, margin: "0 0 6px" }} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <InvestmentsList items={items} currentUser={currentUser} onOpenPayment={onOpenPayment} filter={filter} />
      </div>
    </div>
  );
}

/* =========================
   Modals (Admin)
   ========================= */
function AddInvestmentModal({ onClose, currentUser, onCreated }) {
  const [users, setUsers] = React.useState([]);
  const [form, setForm] = React.useState({
    projectName: "",
    amount: "",
    responsiblePerson: "", // store userId
    returnDate: "",
    monthlyRate: "",
  });
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [participantAmount, setParticipantAmount] = React.useState("");
  const [participants, setParticipants] = React.useState([]);

  const isMobile = !useIsDesktop(640);

  React.useEffect(() => {
    // Try to load users from /api/users; if not present, fallback to inferring from investments payload later
    (async () => {
      try {
        const r = await fetch("/api/users");
        if (r.ok) {
         const u = await r.json();
         setUsers(u);
         // default responsible person = current user if present
         if (!form.responsiblePerson) {
           const me = u.find(x => x._id === currentUser._id);
           setForm(f => ({ ...f, responsiblePerson: me?._id || "" }));
         }
         return;
        }
      } catch {}
      // fallback: minimal list with current user
      setUsers([{ _id: currentUser._id, name: currentUser.name, role: currentUser.role }]);
      if (!form.responsiblePerson) setForm(f => ({ ...f, responsiblePerson: currentUser._id }));
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addParticipant = () => {
    if (!selectedUserId || !participantAmount) return;
    const amt = Number(participantAmount);
    if (isNaN(amt) || amt <= 0) return;
    setParticipants(prev => {
      const existing = prev.find(p => p.userId === selectedUserId);
      if (existing) return prev.map(p => p.userId === selectedUserId ? { ...p, amount: p.amount + amt } : p);
      return [...prev, { userId: selectedUserId, amount: amt }];
    });
    setParticipantAmount("");
  };

  const submit = async () => {
    const payload = {
      userId: currentUser._id,
      data: {
        ...form,
        amount: Number(form.amount) || 0,
        monthlyRate: Number(form.monthlyRate) || 0,
        // convert responsiblePerson from userId to display name server-side as needed;
        // for now we send userId; your API stores responsiblePerson as string,
        // you can map it server-side to the actual name.
        responsiblePerson: form.responsiblePerson,
        participants,
      },
    };
    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (res.ok) {
      onCreated(j.investment);
      onClose();
    } else {
      alert(j.error || "Failed to create");
    }
  };

  return (
    <Modal
      title="Add new investment"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${THEME.divider}`, background: THEME.cardBg, color: THEME.text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${THEME.accent}`, background: THEME.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Submit</button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: THEME.subtext }}>Project name</div>
          <input value={form.projectName} onChange={(e)=>setForm({...form, projectName: e.target.value})} style={{ width: "100%", padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: THEME.subtext }}>Amount (UGX)</div>
          <input value={form.amount} onChange={(e)=>setForm({...form, amount: e.target.value})} style={{ width: "100%", padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: THEME.subtext }}>Responsible person</div>
          <select value={form.responsiblePerson} onChange={(e)=>setForm({...form, responsiblePerson: e.target.value})} style={{ width: "100%", padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10 }}>
            <option value="">Select member</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: THEME.subtext }}>Return date</div>
          <input type="date" value={form.returnDate} onChange={(e)=>setForm({...form, returnDate: e.target.value})} style={{ width: "100%", padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: THEME.subtext }}>Monthly rate (%)</div>
          <input value={form.monthlyRate} onChange={(e)=>setForm({...form, monthlyRate: e.target.value})} style={{ width: "100%", padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10 }} />
        </div>
      </div>

      {/* Participants row: responsive to prevent overflow on mobile */}
      <div style={{ marginTop: 12, borderTop: `1px solid ${THEME.divider}`, paddingTop: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6, color: THEME.navy }}>Participants</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <select value={selectedUserId} onChange={(e)=>setSelectedUserId(e.target.value)} style={{ padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10, width: "100%" }}>
            <option value="">Select member</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <input placeholder="Amount (UGX)" value={participantAmount} onChange={(e)=>setParticipantAmount(e.target.value)} style={{ padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10, width: "100%" }} />
          <button onClick={addParticipant} style={{ justifySelf: isMobile ? "end" : "auto", padding: "10px 12px", borderRadius: 10, border: `1px solid ${THEME.accent}`, background: `${THEME.accent}15`, color: THEME.accent, fontWeight: 700, cursor: "pointer" }}>
            Add
          </button>
        </div>

        {participants.length > 0 && (
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {participants.map((p, idx) => {
              const u = users.find(x => x._id === p.userId);
              return <li key={idx}>{u?.name || p.userId} — {formatUGX(p.amount)}</li>;
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function PaymentModal({ onClose, currentUser, investment, onRecorded }) {
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0,10));

  const submit = async () => {
    const payload = { userId: currentUser._id, investmentId: investment._id, amount: Number(amount)||0, date };
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const j = await res.json();
    if (res.ok) { onRecorded(j.investment); onClose(); }
    else alert(j.error || "Failed to record payment");
  };

  return (
    <Modal
      title={`Record Payment — ${investment.projectName} (Left: ${formatUGX(investment.principalLeft)})`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${THEME.divider}`, background: THEME.cardBg, color: THEME.text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${THEME.accent}`, background: THEME.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Submit</button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: THEME.subtext }}>Amount (UGX)</div>
          <input value={amount} onChange={(e)=>setAmount(e.target.value)} style={{ width: "100%", padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: THEME.subtext }}>Date</div>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} style={{ width: "100%", padding: 10, border: `1px solid ${THEME.divider}`, borderRadius: 10 }} />
        </div>
      </div>
    </Modal>
  );
}

/* =========================
   Page (fetch server figures/items)
   ========================= */
export default function DashboardClientPage({ currentUser }) {
  const { isDesktop, mainH, cardH } = useViewportHeights({ navH: 56, tabsH: 44, vPad: 16, gridGap: 12 });
  const [activeTab, setActiveTab] = React.useState("summary");

  const [personal, setPersonal] = React.useState({ currentInvested: 0, totalInvestments: 0, expectedEOM: 0, totalEarnings: 0 });
  const [company, setCompany] = React.useState({ currentInvested: 0, totalInvestments: 0, expectedEOM: 0, totalEarnings: 0 });
  const [items, setItems] = React.useState([]);

  const [showAdd, setShowAdd] = React.useState(false);
  const [showPay, setShowPay] = React.useState(null);
  const [users, setUsers] = React.useState([]);

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/investments?userId=${encodeURIComponent(currentUser._id)}`);
    if (!res.ok) { window.location.href = "/login"; return; }
    const j = await res.json();
    setPersonal(j.personal);
    setCompany(j.company);
    setItems(j.investments);
    setUsers(j.users || []);
  }, [currentUser._id]);
  
  React.useEffect(() => { load(); }, [load]);

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: THEME.pageBg, color: THEME.text }}>
      <TopNav />

      {!isDesktop && (
        <div style={{ height: 44, display: "flex", alignItems: "center" }}>
          <MobileTabs active={activeTab} onChange={setActiveTab} />
        </div>
      )}

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 16,
          display: "grid",
          gridTemplateColumns: isDesktop ? "7fr 5fr" : "1fr",
          gap: 12,
          alignItems: "stretch",
          height: mainH,
          boxSizing: "border-box",
        }}
      >
        {(isDesktop || activeTab === "summary") && (
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12, height: "100%" }}>
            <StatsCard title="Your figures"     figures={personal} height={cardH} isDesktop={isDesktop} />
            <StatsCard title="Company figures" figures={company}  height={cardH} isDesktop={isDesktop} />
          </div>
        )}

        {(isDesktop || activeTab === "investments") && (
          <div style={{ height: "100%", minHeight: 0 }}>
            <InvestmentsPanel
              items={items}
              currentUser={currentUser}
              users={users}
              onOpenAdd={() => setShowAdd(true)}
              onOpenPayment={(inv) => setShowPay(inv)}
            />
          </div>
        )}
      </main>

      {showAdd && currentUser.role === "admin" && (
        <AddInvestmentModal
          onClose={() => setShowAdd(false)}
          currentUser={currentUser}
          users={users}             
          onCreated={() => load()}
        />
      )}

      {showPay && currentUser.role === "admin" && (
        <PaymentModal
          onClose={() => setShowPay(null)}
          currentUser={currentUser}
          investment={showPay}
          onRecorded={() => load()}
        />
      )}
    </div>
  );
}