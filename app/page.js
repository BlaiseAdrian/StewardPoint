"use client";
import React from "react";
import { useRouter } from "next/navigation";
import DashboardClientPage from "./DashboardClientPage";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = React.useState(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      console.log("[HOME] Read localStorage.user:", raw);
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log("[HOME] Parsed user:", parsed);
        if (parsed && parsed._id && parsed.role) {
          setUser(parsed);
          setReady(true);
          console.log("[HOME] Auth OK → render dashboard");
          return;
        } else {
          console.log("[HOME] Parsed user missing _id/role");
        }
      } else {
        console.log("[HOME] No localStorage.user");
      }
    } catch (e) {
      console.log("[HOME] Error reading localStorage.user:", e);
    }
    console.log("[HOME] Redirect to /login");
    router.replace("/login");
  }, [router]);

  if (!ready) {
    console.log("[HOME] Not ready → render null");
    return null;
  }

  console.log("[HOME] Rendering DashboardClientPage with user:", user);
  return <DashboardClientPage currentUser={user} />;
}
