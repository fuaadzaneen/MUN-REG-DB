import { supabaseAdmin } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, patch } = body ?? {};

    if (!id) throw new Error("Missing delegate id");
    if (!patch || typeof patch !== "object") throw new Error("Missing patch object");

    // allowlist only (so nobody updates random columns)
    const allowed = [
      "full_name",
      "whatsapp",
      "college",
      "course",
      "category",
      "ca_code",
      "round",
      "status",
      "accommodation",
      "mun_experience",
    ] as const;

    const clean: Record<string, any> = {};
    for (const k of allowed) {
      if (k in patch) {
        const v = patch[k];
        clean[k] = typeof v === "string" ? v.trim() : v;
      }
    }

    if (Object.keys(clean).length === 0) throw new Error("Nothing to update");

    const { error } = await supabaseAdmin.from("delegates").update(clean).eq("id", id);
    if (error) throw new Error(error.message);

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}
