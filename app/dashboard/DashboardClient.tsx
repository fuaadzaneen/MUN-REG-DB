"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Row = any;

function fmtDate(v: any) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function Badge({ text, title }: { text: string; title?: string }) {
  const t = (text ?? "").toString();

  const lower = t.toLowerCase();

  // Existing status colors (allotted/registered/pending)
  const statusBg =
    lower.includes("allotted") ? "#173a2a" :
    lower.includes("registered") ? "#1d2a45" :
    lower.includes("pending") ? "#3a2c16" :
    "#222";

  const statusBd =
    lower.includes("allotted") ? "#2e7d54" :
    lower.includes("registered") ? "#3b6bb8" :
    lower.includes("pending") ? "#a57a2a" :
    "#333";

  // Email status colors (not_sent/sent/failed)
  const isEmail = ["not_sent", "sent", "failed"].includes(lower);

  const emailBg =
    lower === "sent" ? "#173a2a" :
    lower === "failed" ? "#2a1515" :
    "#1d2a45";

  const emailBd =
    lower === "sent" ? "#2e7d54" :
    lower === "failed" ? "#7a2e2e" :
    "#3b6bb8";

  const bg = isEmail ? emailBg : statusBg;
  const bd = isEmail ? emailBd : statusBd;

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

function Button({
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
    borderRadius: 10,
    border: "1px solid #333",
    background: "#151515",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    fontWeight: 700,
    fontSize: 13,
    transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
    userSelect: "none",
  };

  const styles =
    variant === "primary"
      ? { background: "#1b1b1b", borderColor: "#3a3a3a" }
      : variant === "danger"
      ? { background: "#2a1515", borderColor: "#7a2e2e" }
      : { background: "#111", borderColor: "#2a2a2a" };

  return (
    <button
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...styles }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
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

  // ---- Email state ----
  const [sendingOneId, setSendingOneId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  // ---- Allotment modal state ----
  const [selected, setSelected] = useState<Row | null>(null);
  const [ac, setAc] = useState("");
  const [ap, setAp] = useState("");
  const [saving, setSaving] = useState(false);

  // Better scroll: allow wheel to scroll horizontally when hovering table container
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

  function openAllot(r: Row) {
    setSelected(r);
    setAc(r.allotted_committee ?? "");
    setAp(r.allotted_portfolio ?? "");
  }

  async function saveAllotment() {
    if (!selected) return;

    if (!ac.trim() || !ap.trim()) {
      alert("Committee + Portfolio required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/delegates/allot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          allotted_committee: ac,
          allotted_portfolio: ap,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");

      setSelected(null);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
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

      setSelected(null);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Clear failed");
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
    setSyncing(true);
    try {
      const res = await fetch("/api/sync/registrations", { method: "POST" });
      const json = await res.json();
      alert(
        `Sync: ${json.ok ? "OK" : "FAILED"} | imported: ${json.imported ?? "?"}`
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

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `delegates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // -------------------------
  // EMAIL ACTIONS
  // -------------------------
  async function sendOneEmail(row: Row) {
    if (!row?.id) return;

    // sanity check before hitting API (API also enforces)
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

    // warn if many are not allotted
    const missingAllot = filteredRows.filter(
      (r) => !r.allotted_committee || !r.allotted_portfolio
    ).length;

    const msg =
      missingAllot > 0
        ? `Send emails to ${ids.length} delegates?\n\nNote: ${missingAllot} delegates in this view have missing allotment and will fail (logged as failed). Continue?`
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
    <div style={{ padding: 18, color: "white" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.2 }}>
            Delegates Dashboard
          </div>
          <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>
            Showing <b>{filteredRows.length}</b> of <b>{rows.length}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Button onClick={exportCsv} variant="ghost" title="Export current filtered view">
            Export CSV
          </Button>

          <Button
            onClick={bulkSendView}
            disabled={bulkSending}
            title="Send allotment emails to all delegates in the current filtered view"
          >
            {bulkSending ? "Bulk Sending…" : "Bulk Email (View)"}
          </Button>

          <Button
            onClick={syncNow}
            disabled={syncing}
            title="Pull latest Google Form responses into Supabase"
          >
            {syncing ? "Syncing…" : "Sync from Sheets"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14,
          padding: 12,
          border: "1px solid #2a2a2a",
          borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name / email / college / CA code…"
          style={{
            padding: 12,
            width: 340,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#0f0f0f",
            color: "white",
            outline: "none",
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#0f0f0f",
            color: "white",
            outline: "none",
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#0f0f0f",
            color: "white",
            outline: "none",
          }}
        >
          <option value="">All status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={round}
          onChange={(e) => setRound(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#0f0f0f",
            color: "white",
            outline: "none",
          }}
        >
          <option value="">All rounds</option>
          {rounds.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={applyFilters} variant="primary">
            Apply
          </Button>
          <Button onClick={clearFilters} variant="ghost">
            Clear
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          border: "1px solid #2a2a2a",
          borderRadius: 14,
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
        }}
      >
        <div ref={scrollerRef} style={{ maxHeight: "68vh", overflow: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: 13,
              minWidth: 1500,
            }}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
              <tr style={{ background: "#101010" }}>
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
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 12px",
                      borderBottom: "1px solid #2a2a2a",
                      position: "sticky",
                      top: 0,
                      background: "#101010",
                      whiteSpace: "nowrap",
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

                const canSend =
                  !!r.email && !!r.allotted_committee && !!r.allotted_portfolio;

                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid #1f1f1f",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background =
                        "rgba(255,255,255,0.03)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background =
                        "transparent")
                    }
                  >
                    <td style={{ padding: 12, minWidth: 180, fontWeight: 800 }}>
                      {r.full_name}
                    </td>

                    <td style={{ padding: 12, minWidth: 240 }}>
                      <span
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontSize: 12,
                          opacity: 0.95,
                        }}
                      >
                        {r.email}
                      </span>
                    </td>

                    <td style={{ padding: 12, minWidth: 140 }}>{r.whatsapp}</td>

                    <td style={{ padding: 12, minWidth: 220 }}>{r.college}</td>

                    <td style={{ padding: 12, minWidth: 160 }}>{r.course}</td>

                    <td style={{ padding: 12, minWidth: 150 }}>{r.category}</td>

                    {/* CA code */}
                    <td style={{ padding: 12, minWidth: 120 }}>
                      {r.ca_code ? (
                        <span
                          style={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 10,
                            border: "1px solid #333",
                            background: "#0f0f0f",
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

                    {/* Email status */}
                    <td style={{ padding: 12, minWidth: 140 }}>
                      <Badge
                        text={emailStatus}
                        title={emailStatus === "failed" && err ? err : undefined}
                      />
                    </td>

                    {/* Sent at */}
                    <td style={{ padding: 12, minWidth: 170 }}>
                      {sentAt ? (
                        <span style={{ opacity: 0.9 }}>{sentAt}</span>
                      ) : (
                        <span style={{ opacity: 0.45 }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: 12, minWidth: 240 }}>
                      {r.allotted_committee || r.allotted_portfolio ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>
                            {r.allotted_committee}
                          </div>
                          <div style={{ opacity: 0.8 }}>{r.allotted_portfolio}</div>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.55 }}>Not allotted</span>
                      )}
                    </td>

                    <td style={{ padding: 12, minWidth: 360 }}>
                      <details>
                        <summary style={{ cursor: "pointer", userSelect: "none" }}>
                          View
                        </summary>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            marginTop: 10,
                            opacity: 0.9,
                          }}
                        >
                          {JSON.stringify(r.preferences ?? {}, null, 2)}
                        </pre>
                      </details>
                    </td>

                    <td style={{ padding: 12, minWidth: 260 }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Button
                          onClick={() => openAllot(r)}
                          variant="primary"
                          title="Open allotment modal"
                        >
                          Allot / Edit
                        </Button>

                        <Button
                          onClick={() => sendOneEmail(r)}
                          disabled={
                            sendingOneId === r.id || !canSend
                          }
                          variant="ghost"
                          title={
                            !canSend
                              ? "Requires email + committee + portfolio"
                              : "Send allotment email"
                          }
                        >
                          {sendingOneId === r.id ? "Sending…" : "Send Email"}
                        </Button>
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

        <div
          style={{
            padding: 10,
            borderTop: "1px solid #2a2a2a",
            opacity: 0.7,
            fontSize: 12,
          }}
        >
          Tip: Scroll on the table to move left/right. Header stays sticky.
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
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
              width: "min(720px, 100%)",
              borderRadius: 16,
              border: "1px solid #2a2a2a",
              background: "#0e0e0e",
              padding: 16,
              boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {selected.full_name}
                </div>
                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  <span
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 12,
                    }}
                  >
                    {selected.email}
                  </span>
                </div>
                {selected.ca_code ? (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ opacity: 0.7, marginRight: 6 }}>CA:</span>
                    <span
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    >
                      {selected.ca_code}
                    </span>
                  </div>
                ) : null}
              </div>

              <Button onClick={() => setSelected(null)} variant="ghost">
                Close
              </Button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                  Allotted Committee
                </div>
                <input
                  value={ac}
                  onChange={(e) => setAc(e.target.value)}
                  placeholder="e.g., UNHRC"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #333",
                    background: "#0b0b0b",
                    color: "white",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                  Allotted Portfolio
                </div>
                <input
                  value={ap}
                  onChange={(e) => setAp(e.target.value)}
                  placeholder="e.g., France"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #333",
                    background: "#0b0b0b",
                    color: "white",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                border: "1px solid #222",
                borderRadius: 14,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                Preferences
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  fontSize: 12,
                  opacity: 0.9,
                }}
              >
                {JSON.stringify(selected.preferences ?? {}, null, 2)}
              </pre>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <Button
                onClick={clearAllotment}
                disabled={saving}
                variant="danger"
                title="Clear committee + portfolio"
              >
                {saving ? "Working…" : "Clear Allotment"}
              </Button>

              <Button onClick={saveAllotment} disabled={saving} variant="primary">
                {saving ? "Saving…" : "Save Allotment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
