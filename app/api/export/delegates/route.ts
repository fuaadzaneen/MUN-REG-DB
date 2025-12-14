import { supabaseAdmin } from "@/src/lib/supabase";

function csvEscape(val: any) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const category = (searchParams.get("category") ?? "").trim();
    const status = (searchParams.get("status") ?? "").trim();
    const round = (searchParams.get("round") ?? "").trim();

    let query = supabaseAdmin
      .from("delegates")
      .select(
        `
        reg_id,
        source_timestamp,
        round,
        full_name,
        email,
        whatsapp,
        college,
        course,
        category,
        ca_code,
        mun_experience,
        accommodation,
        status,
        allotted_committee,
        allotted_portfolio,
        allotted_at,
        preferences
        `
      )
      .order("source_timestamp", { ascending: false });

    if (category) query = query.eq("category", category);
    if (status) query = query.eq("status", status);
    if (round) query = query.eq("round", round);

    if (q) {
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,college.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const headers = [
      "Reg ID",
      "Timestamp",
      "Round",
      "Full Name",
      "Email",
      "WhatsApp",
      "College",
      "Course",
      "Category",
      "CA Code",
      "MUN Experience",
      "Accommodation",
      "Status",
      "Allotted Committee",
      "Allotted Portfolio",
      "Allotted At",
      "Preferences (JSON)",
    ];

    const rows = (data ?? []).map((r) => [
      r.reg_id,
      r.source_timestamp,
      r.round,
      r.full_name,
      r.email,
      r.whatsapp,
      r.college,
      r.course,
      r.category,
      r.ca_code,
      r.mun_experience,
      r.accommodation,
      r.status,
      r.allotted_committee,
      r.allotted_portfolio,
      r.allotted_at,
      JSON.stringify(r.preferences),
    ]);

    const csv =
      headers.map(csvEscape).join(",") +
      "\n" +
      rows.map((row) => row.map(csvEscape).join(",")).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="delegates_export_${Date.now()}.csv"`,
      },
    });
  } catch (e: any) {
    return new Response(e?.message ?? "Export failed", { status: 500 });
  }
}
