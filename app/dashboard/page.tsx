// app/dashboard/page.tsx
import DashboardClient from "./DashboardClient";
import { supabaseAdmin } from "@/src/lib/supabase";

type SP = Record<string, string | string[] | undefined>;

function first(sp: SP, key: string) {
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams; // ✅ unwrap Promise in your Next version

  const q = first(sp, "q").trim();
  const category = first(sp, "category").trim();
  const status = first(sp, "status").trim();
  const round = first(sp, "round").trim();

  let query = supabaseAdmin
    .from("delegates")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    // search across multiple fields
    query = query.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,college.ilike.%${q}%`
    );
  }
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  if (round) query = query.eq("round", round);

  const { data, error } = await query;

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Dashboard error</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Dashboard</h1>
      <p style={{ marginTop: 6, opacity: 0.75 }}>
        Total delegates: <b>{data?.length ?? 0}</b>
      </p>

      <DashboardClient rows={data ?? []} />
    </div>
  );
}
