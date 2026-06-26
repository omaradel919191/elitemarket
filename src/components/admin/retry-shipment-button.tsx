"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** Re-runs the OTO shipment for a paid/failed order and shows the result. */
export function RetryShipmentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function retry() {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/retry-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Shipment created.");
        router.refresh();
      } else {
        setMsg(data.error || "Failed.");
      }
    } catch {
      setMsg("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={retry}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-xs text-gold transition-colors hover:bg-gold/[0.08] disabled:opacity-40"
      >
        <RefreshCw className={`h-3 w-3 ${busy ? "animate-spin" : ""}`} />
        {busy ? "Retrying…" : "Retry shipment"}
      </button>
      {msg && <p className="mt-1 max-w-[16rem] text-[0.62rem] leading-tight text-ash-dim">{msg}</p>}
    </div>
  );
}
