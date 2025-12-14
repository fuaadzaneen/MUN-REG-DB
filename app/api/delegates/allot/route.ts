import { supabaseAdmin } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, allotted_committee, allotted_portfolio, clear } = body ?? {};

    if (!id) throw new Error("Missing delegate id");

    // CLEAR MODE
    if (clear) {
      const { error } = await supabaseAdmin
        .from("delegates")
        .update({
          allotted_committee: null,
          allotted_portfolio: null,
          allotted_at: null,
          status: "Registered",
        })
        .eq("id", id);

      if (error) throw new Error(error.message);
      return Response.json({ ok: true });
    }

    // SAVE MODE
    if (!allotted_committee?.trim()) throw new Error("Missing allotted_committee");
    if (!allotted_portfolio?.trim()) throw new Error("Missing allotted_portfolio");

    const { error } = await supabaseAdmin
      .from("delegates")
      .update({
        allotted_committee: allotted_committee.trim(),
        allotted_portfolio: allotted_portfolio.trim(),
        allotted_at: new Date().toISOString(),
        status: "Allotted",
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 400 }
    );
  }
}
