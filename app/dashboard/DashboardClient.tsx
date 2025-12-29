"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Row = any;

function fmtDate(v: any) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function Badge({ text, title }: { text: string; title?: string }) {
  const t = (text ?? "").toString();
  const lower = t.toLowerCase();

  const isEmail = ["not_sent", "sent", "failed"].includes(lower);

  const bg = isEmail
    ? lower === "sent"
      ? "rgba(46,125,84,0.18)"
      : lower === "failed"
      ? "rgba(122,46,46,0.18)"
      : "rgba(59,107,184,0.16)"
    : lower.includes("allotted")
    ? "rgba(46,125,84,0.18)"
    : lower.includes("registered")
    ? "rgba(59,107,184,0.16)"
    : lower.includes("pending")
    ? "rgba(165,122,42,0.18)"
    : "rgba(255,255,255,0.06)";

  const bd = isEmail
    ? lower === "sent"
      ? "rgba(46,125,84,0.6)"
      : lower === "failed"
      ? "rgba(122,46,46,0.7)"
      : "rgba(59,107,184,0.65)"
    : lower.includes("allotted")
    ? "rgba(46,125,84,0.6)"
    : lower.includes("registered")
    ? "rgba(59,107,184,0.65)"
    : lower.includes("pending")
    ? "rgba(165,122,42,0.7)"
    : "rgba(255,255,255,0.16)";

  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${bd}`,
        background: bg,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      {t}
    </span>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  title?: string;
}) {
  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    fontWeight: 800,
    fontSize: 13,
    transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
    userSelect: "none",
  };

  const styles =
    variant === "primary"
      ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.22)" }
      : variant === "danger"
      ? { background: "rgba(122,46,46,0.22)", borderColor: "rgba(122,46,46,0.75)" }
      : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.14)" };

  return (
    <button
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...styles }}
      onMouseDown={(e) => (((e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"))}
      onMouseUp={(e) => (((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"))}
      onMouseLeave={(e) => (((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"))}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(0,0,0,0.35)",
          color: "white",
          outline: "none",
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
        }}
      />
    </div>
  );
}

export default function DashboardClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const [round, setRound] = useState(sp.get("round") ?? "");

  const [syncing, setSyncing] = useState(false);

  // email actions
  const [sendingOneId, setSendingOneId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  // modal
  const [selected, setSelected] = useState<Row | null>(null);
  const [tab, setTab] = useState<"allot" | "details">("allot");

  // allotment
  const [ac, setAc] = useState("");
  const [ap, setAp] = useState("");

  // editable fields
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [catEdit, setCatEdit] = useState("");
  const [roundEdit, setRoundEdit] = useState("");
  const [statusEdit, setStatusEdit] = useState("");
  const [caCode, setCaCode] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [munExperience, setMunExperience] = useState("");

  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // scroll improvements
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const canScrollX = el.scrollWidth > el.clientWidth;
      if (!canScrollX) return;
      if (e.shiftKey) return;

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  // ESC close modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // computed filters
  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.category && set.add(r.category));
    return Array.from(set).sort();
  }, [rows]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.status && set.add(r.status));
    return Array.from(set).sort();
  }, [rows]);

  const rounds = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.round && set.add(r.round));
    return Array.from(set).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okQ =
        !qq ||
        (r.full_name ?? "").toLowerCase().includes(qq) ||
        (r.email ?? "").toLowerCase().includes(qq) ||
        (r.college ?? "").toLowerCase().includes(qq) ||
        (r.ca_code ?? "").toLowerCase().includes(qq);

      const okCat = !category || (r.category ?? "") === category;
      const okStatus = !status || (r.status ?? "") === status;
      const okRound = !round || (r.round ?? "") === round;

      return okQ && okCat && okStatus && okRound;
    });
  }, [rows, q, category, status, round]);

  function openModal(r: Row, which: "allot" | "details" = "allot") {
    setSelected(r);
    setTab(which);

    // allot fields
    setAc(r.allotted_committee ?? "");
    setAp(r.allotted_portfolio ?? "");

    // detail fields
    setFullName(r.full_name ?? "");
    setWhatsapp(r.whatsapp ?? "");
    setCollege(r.college ?? "");
    setCourse(r.course ?? "");
    setCatEdit(r.category ?? "");
    setRoundEdit(r.round ?? "");
    setStatusEdit(r.status ?? "");
    setCaCode(r.ca_code ?? "");
    setAccommodation(r.accommodation ?? "");
    setMunExperience(r.mun_experience ?? "");
  }

  async function saveAllotment() {
    if (!selected) return;
    if (!ac.trim() || !ap.trim()) return alert("Committee + Portfolio required");

    setSaving(true);
    try {
      const res = await fetch("/api/delegates/allot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          allotted_committee: ac.trim(),
          allotted_portfolio: ap.trim(),
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");

      // keep modal open after Save (so you can press Finalize next if you want)
      router.refresh();
      alert("Saved ✅ (now you can Finalize)");
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function finalizeAllotment() {
    if (!selected) return;
    if (!ac.trim() || !ap.trim()) return alert("Committee + Portfolio required");

    // IMPORTANT:
    // This assumes your backend route /api/delegates/finalize will:
    // 1) save allotted_committee + allotted_portfolio
    // 2) set status = "Allotted" (or whatever you use)
    // If you DON'T have this route yet, create it, or change this to /api/delegates/update.
    setFinalizing(true);
    try {
      const res = await fetch("/api/delegates/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          allotted_committee: ac.trim(),
          allotted_portfolio: ap.trim(),
          status: "Allotted",
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Finalize failed");

      setSelected(null);
      router.refresh();
      alert("Finalized ✅");
    } catch (e: any) {
      alert(e?.message ?? "Finalize failed");
      router.refresh();
    } finally {
      setFinalizing(false);
    }
  }

  async function clearAllotment() {
    if (!selected) return;
    if (!confirm("Clear allotment for this delegate?")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/delegates/allot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          allotted_committee: "",
          allotted_portfolio: "",
          clear: true,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");

      router.refresh();
      alert("Cleared ✅");
      setAc("");
      setAp("");
    } catch (e: any) {
      alert(e?.message ?? "Clear failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveDetails() {
    if (!selected) return;

    setSaving(true);
    try {
      const patch = {
        full_name: fullName,
        whatsapp,
        college,
        course,
        category: catEdit,
        round: roundEdit,
        status: statusEdit,
        ca_code: caCode,
        accommodation,
        mun_experience: munExperience,
      };

      const res = await fetch("/api/delegates/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, patch }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Update failed");

      setSelected(null);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (round) params.set("round", round);
    router.push(`/dashboard?${params.toString()}`);
  }

  function clearFilters() {
    setQ("");
    setCategory("");
    setStatus("");
    setRound("");
    router.push("/dashboard");
  }

  async function syncNow() {
  const activeRound = round || "Priority"; // fallback safety

  setSyncing(true);
  try {
    const res = await fetch(`/api/sync/registrations?round=${activeRound}`, {
      method: "POST",
    });

    const json = await res.json();
    alert(
      `Sync ${activeRound}: ${json.ok ? "OK" : "FAILED"} | imported: ${json.imported ?? "?"}`
    );
    router.refresh();
  } catch (e: any) {
    alert(e?.message ?? "Sync failed");
  } finally {
    setSyncing(false);
  }
}


  function exportCsv() {
    const headers = [
      "Full Name",
      "Email",
      "WhatsApp",
      "College",
      "Course",
      "Category",
      "CA Code",
      "Round",
      "Status",
      "Allotted Committee",
      "Allotted Portfolio",
      "Email Status",
      "Email Sent At",
      "Email Error",
    ];

    const lines = [
      headers.join(","),
      ...filteredRows.map((r) => {
        const vals = [
          r.full_name ?? "",
          r.email ?? "",
          r.whatsapp ?? "",
          r.college ?? "",
          r.course ?? "",
          r.category ?? "",
          r.ca_code ?? "",
          r.round ?? "",
          r.status ?? "",
          r.allotted_committee ?? "",
          r.allotted_portfolio ?? "",
          r.email_status ?? "",
          r.email_sent_at ?? "",
          r.email_error ?? "",
        ].map((v: any) => `"${String(v).replaceAll(`"`, `""`)}"`);
        return vals.join(",");
      }),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delegates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function sendOneEmail(row: Row) {
    if (!row?.id) return;

    if (!row.email) return alert("Missing delegate email.");
    if (!row.allotted_committee || !row.allotted_portfolio) {
      return alert("Allotment missing (committee/portfolio). Allot first.");
    }

    setSendingOneId(row.id);
    try {
      const res = await fetch("/api/email/allotment/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");

      alert("Email sent ✅");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Email failed");
      router.refresh();
    } finally {
      setSendingOneId(null);
    }
  }

  async function bulkSendView() {
    const ids = filteredRows.map((r) => r.id).filter(Boolean);
    if (ids.length === 0) return alert("No delegates in current view.");

    const missingAllot = filteredRows.filter((r) => !r.allotted_committee || !r.allotted_portfolio).length;

    const msg =
      missingAllot > 0
        ? `Send emails to ${ids.length} delegates?\n\nNote: ${missingAllot} delegates in this view have missing allotment and will fail.\nContinue?`
        : `Send emails to ${ids.length} delegates?`;

    if (!confirm(msg)) return;

    setBulkSending(true);
    try {
      const res = await fetch("/api/email/allotment/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Bulk failed");

      alert(`Done ✅ Sent: ${json.sent}, Failed: ${json.failed}`);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Bulk failed");
      router.refresh();
    } finally {
      setBulkSending(false);
    }
  }

  return (
    <div
      style={{
        padding: 18,
        color: "white",
        borderRadius: 18,
        background:
          "radial-gradient(1000px 500px at 30% -20%, rgba(96,165,250,0.18), transparent 55%), radial-gradient(900px 600px at 110% 0%, rgba(168,85,247,0.14), transparent 55%), rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 950, letterSpacing: 0.2 }}>Delegates Dashboard</div>
          <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
            Showing <b>{filteredRows.length}</b> of <b>{rows.length}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
  <Btn onClick={exportCsv} variant="ghost">
    Export CSV
  </Btn>

  <Btn onClick={bulkSendView} disabled={bulkSending} title="Send emails to current view">
    {bulkSending ? "Bulk Sending…" : "Bulk Email (View)"}
  </Btn>

  <Btn onClick={syncNow} disabled={syncing} title="Sync from Google Sheets">
    {syncing ? "Syncing…" : "Sync from Sheets"}
  </Btn>

  {/* 🔥 ROUND SHORTCUTS (NEW TABS) */}
  <a
    href="/dashboard?round=Priority"
    target="_blank"
    rel="noopener noreferrer"
    style={{ textDecoration: "none" }}
  >
    <Btn variant="ghost">Priority Round</Btn>
  </a>

  <a
    href="/dashboard?round=First"
    target="_blank"
    rel="noopener noreferrer"
    style={{ textDecoration: "none" }}
  >
    <Btn variant="ghost">First Round</Btn>
  </a>
</div>

      </div>

      {/* filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14,
          padding: 12,
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name / email / college / CA code…"
          style={{
            padding: 12,
            width: 360,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.35)",
            color: "white",
            outline: "none",
          }}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selStyle()}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selStyle()}>
          <option value="">All status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select value={round} onChange={(e) => setRound(e.target.value)} style={selStyle()}>
          <option value="">All rounds</option>
          {rounds.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={applyFilters} variant="primary">
            Apply
          </Btn>
          <Btn onClick={clearFilters} variant="ghost">
            Clear
          </Btn>
        </div>
      </div>

      {/* table */}
      <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, overflow: "hidden", background: "rgba(0,0,0,0.22)" }}>
        <div ref={scrollerRef} style={{ maxHeight: "70vh", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13, minWidth: 1600 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
              <tr style={{ background: "rgba(10,10,10,0.96)" }}>
                {[
                  "Name",
                  "Email",
                  "WhatsApp",
                  "College",
                  "Course",
                  "Category",
                  "CA Code",
                  "Round",
                  "Status",
                  "Email Status",
                  "Sent At",
                  "Allotment",
                  "Preferences",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.10)",
                      position: "sticky",
                      top: 0,
                      background: "rgba(10,10,10,0.96)",
                      whiteSpace: "nowrap",
                      ...(i === 0 ? { left: 0, zIndex: 6 } : {}),
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((r) => {
                const emailStatus = (r.email_status ?? "not_sent").toString();
                const sentAt = fmtDate(r.email_sent_at);
                const err = (r.email_error ?? "").toString();
                const canSend = !!r.email && !!r.allotted_committee && !!r.allotted_portfolio;

                return (
                  <tr
                    key={r.id}
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.035)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    {/* sticky name */}
                    <td
                      style={{
                        padding: 12,
                        minWidth: 200,
                        fontWeight: 900,
                        position: "sticky",
                        left: 0,
                        background: "inherit",
                        borderRight: "1px solid rgba(255,255,255,0.06)",
                        zIndex: 3,
                      }}
                    >
                      {r.full_name}
                    </td>

                    <td style={{ padding: 12, minWidth: 250 }}>
                      <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, opacity: 0.95 }}>{r.email}</span>
                    </td>

                    <td style={{ padding: 12, minWidth: 140 }}>{r.whatsapp}</td>
                    <td style={{ padding: 12, minWidth: 220 }}>{r.college}</td>
                    <td style={{ padding: 12, minWidth: 160 }}>{r.course}</td>
                    <td style={{ padding: 12, minWidth: 150 }}>{r.category}</td>

                    <td style={{ padding: 12, minWidth: 120 }}>
                      {r.ca_code ? (
                        <span
                          style={{
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: 12,
                            padding: "4px 10px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(0,0,0,0.35)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.ca_code}
                        </span>
                      ) : (
                        <span style={{ opacity: 0.45 }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: 12, minWidth: 120 }}>{r.round}</td>
                    <td style={{ padding: 12, minWidth: 130 }}>
                      <Badge text={r.status ?? ""} />
                    </td>

                    <td style={{ padding: 12, minWidth: 140 }}>
                      <Badge text={emailStatus} title={emailStatus === "failed" && err ? err : undefined} />
                    </td>

                    <td style={{ padding: 12, minWidth: 170 }}>
                      {sentAt ? <span style={{ opacity: 0.9 }}>{sentAt}</span> : <span style={{ opacity: 0.45 }}>—</span>}
                    </td>

                    <td style={{ padding: 12, minWidth: 260 }}>
                      {r.allotted_committee || r.allotted_portfolio ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ fontWeight: 900 }}>{r.allotted_committee}</div>
                          <div style={{ opacity: 0.85 }}>{r.allotted_portfolio}</div>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.55 }}>Not allotted</span>
                      )}
                    </td>

                    <td style={{ padding: 12, minWidth: 360 }}>
                      <details>
                        <summary style={{ cursor: "pointer", userSelect: "none" }}>View</summary>
                        <pre style={{ whiteSpace: "pre-wrap", marginTop: 10, opacity: 0.9 }}>{JSON.stringify(r.preferences ?? {}, null, 2)}</pre>
                      </details>
                    </td>

                    <td style={{ padding: 12, minWidth: 320 }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Btn onClick={() => openModal(r, "allot")} variant="primary">
                          Allot
                        </Btn>
                        <Btn onClick={() => openModal(r, "details")} variant="ghost">
                          Edit
                        </Btn>
                        <Btn
                          onClick={() => sendOneEmail(r)}
                          disabled={sendingOneId === r.id || !canSend}
                          variant="ghost"
                          title={!canSend ? "Requires email + committee + portfolio" : "Send allotment email"}
                        >
                          {sendingOneId === r.id ? "Sending…" : "Send Email"}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={14} style={{ padding: 16, opacity: 0.7 }}>
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.10)", opacity: 0.75, fontSize: 12 }}>
          Tip: Scroll on the table to move left/right. Hold <b>Shift</b> to use native horizontal scroll.
        </div>
      </div>

      {/* modal */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            style={{
              width: "min(820px, 100%)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "radial-gradient(900px 500px at 20% 0%, rgba(96,165,250,0.18), transparent 50%), radial-gradient(900px 500px at 120% 0%, rgba(168,85,247,0.16), transparent 55%), rgba(10,10,10,0.94)",
              boxShadow: "0 20px 90px rgba(0,0,0,0.70)",
              overflow: "hidden",
            }}
          >
            {/* THIS wrapper is the fix so buttons never disappear off-screen */}
            <div style={{ padding: 16, maxHeight: "86vh", overflowY: "auto" }}>
              {/* top */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 950 }}>{selected.full_name}</div>
                  <div style={{ opacity: 0.82, marginTop: 4 }}>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>{selected.email}</span>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selected.ca_code ? <Badge text={`CA: ${selected.ca_code}`} /> : <Badge text="CA: —" />}
                    {selected.round ? <Badge text={`Round: ${selected.round}`} /> : null}
                    {selected.status ? <Badge text={selected.status} /> : null}
                  </div>
                </div>

                <Btn onClick={() => setSelected(null)} variant="ghost">
                  Close (Esc)
                </Btn>
              </div>

              {/* tabs */}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => setTab("allot")} style={tabBtnStyle(tab === "allot")}>
                  Allotment
                </button>
                <button onClick={() => setTab("details")} style={tabBtnStyle(tab === "details")}>
                  Edit Details
                </button>
              </div>

              {/* content */}
              {tab === "allot" ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                    <Field label="Allotted Committee" value={ac} onChange={setAc} placeholder="e.g., UNHRC" />
                    <Field label="Allotted Portfolio" value={ap} onChange={setAp} placeholder="e.g., France" />
                  </div>

                  <div style={panelStyle()}>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Preferences</div>
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 12, opacity: 0.9 }}>
                      {JSON.stringify(selected.preferences ?? {}, null, 2)}
                    </pre>
                  </div>

                  {/* BUTTONS YOU NEEDED (SAVE + FINALIZE) */}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14, flexWrap: "wrap" }}>
                    <Btn onClick={clearAllotment} disabled={saving || finalizing} variant="danger">
                      {saving ? "Working…" : "Clear Allotment"}
                    </Btn>

                    <Btn onClick={saveAllotment} disabled={saving || finalizing} variant="ghost" title="Just save committee+portfolio (does not change status)">
                      {saving ? "Saving…" : "Save (Draft)"}
                    </Btn>

                    <Btn
                      onClick={finalizeAllotment}
                      disabled={saving || finalizing || !ac.trim() || !ap.trim()}
                      variant="primary"
                      title="Finalize = saves allotment + sets Status to Allotted"
                    >
                      {finalizing ? "Finalizing…" : "Finalize Allotment"}
                    </Btn>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    Finalize will set <b>Status</b> to <b>Allotted</b> (so you can filter + email safely).
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                    <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="Full name" />
                    <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="+91..." mono />
                    <Field label="College" value={college} onChange={setCollege} placeholder="College" />
                    <Field label="Course" value={course} onChange={setCourse} placeholder="Course" />
                    <Field label="Category" value={catEdit} onChange={setCatEdit} placeholder="Category" />
                    <Field label="Round" value={roundEdit} onChange={setRoundEdit} placeholder="Priority/Regular..." />
                    <Field label="Status" value={statusEdit} onChange={setStatusEdit} placeholder="Registered/Allotted..." />
                    <Field label="CA Code" value={caCode} onChange={setCaCode} placeholder="Campus ambassador code" mono />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                    <Field label="Accommodation" value={accommodation} onChange={setAccommodation} placeholder="Yes/No/Notes" />
                    <Field label="MUN Experience" value={munExperience} onChange={setMunExperience} placeholder="Experience" />
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
                    <Btn onClick={saveDetails} disabled={saving} variant="primary">
                      {saving ? "Saving…" : "Save Details"}
                    </Btn>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function selStyle(): React.CSSProperties {
  return {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    outline: "none",
  };
}

function panelStyle(): React.CSSProperties {
  return {
    marginTop: 12,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    background: "rgba(0,0,0,0.25)",
  };
}

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)"}`,
    background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  };
}
