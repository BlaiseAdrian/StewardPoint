"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const j = await res.json();
    if (!res.ok) return alert(j.error || "Invalid code");
    localStorage.setItem("user", JSON.stringify(j)); // store user
    router.replace("/"); // go to dashboard
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: "30vh auto", padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 12, fontWeight: 800 }}>StewardPoint Capital</div>
      <input type="password" inputMode="numeric" placeholder="5-digit code"
        value={password} onChange={(e)=>setPassword(e.target.value)}
        style={{ width:"100%", padding:10, border:"1px solid #ddd", borderRadius:8 }} />
      <button type="submit" style={{ marginTop:10, width:"100%", padding:10, borderRadius:8, border:"1px solid #333", background: "rgb(6,6,128)", fontWeight:700 }}>
        Sign in
      </button>
    </form>
  );
}
