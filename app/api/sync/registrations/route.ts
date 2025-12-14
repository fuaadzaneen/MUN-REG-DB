import { google } from "googleapis";
import { supabaseAdmin } from "@/src/lib/supabase";

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON in .env.local");

  const creds = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

const COL = {
  timestamp: 0,
  full_name: 1,
  whatsapp: 2,
  email: 3,
  college: 4,
  course: 5,
  category: 6,
  ca_code: 7,
  mun_experience: 8,
  accommodation: 9,

  c1: 10,
  c1_p1: 11,
  c1_p2: 12,
  c1_p3: 13,

  c2: 14,
  c2_p1: 15,
  c2_p2: 16,
  c2_p3: 17,

  c3: 18,
  c3_p1: 19,
  c3_p2: 20,
  c3_p3: 21,
};

const cell = (row: any[], idx: number) => (row?.[idx] ?? "").toString().trim();

export async function POST() {
  try {
    const sheetId = process.env.SHEET_ID;
    const sheetName = process.env.REG_SHEET_NAME;

    if (!sheetId) throw new Error("Missing SHEET_ID in .env.local");
    if (!sheetName) throw new Error("Missing REG_SHEET_NAME in .env.local");

    const sheets = getSheetsClient();

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z`,
    });

    const values = resp.data.values ?? [];
    if (values.length < 2) return Response.json({ ok: true, imported: 0 });

    const rows = values.slice(1);

    const payload = rows
      .filter((r) => cell(r, COL.email).length > 0)
      .map((r) => {
        const preferences = {
          pref1: {
            committee: cell(r, COL.c1),
            portfolios: [cell(r, COL.c1_p1), cell(r, COL.c1_p2), cell(r, COL.c1_p3)].filter(Boolean),
          },
          pref2: {
            committee: cell(r, COL.c2),
            portfolios: [cell(r, COL.c2_p1), cell(r, COL.c2_p2), cell(r, COL.c2_p3)].filter(Boolean),
          },
          pref3: {
            committee: cell(r, COL.c3),
            portfolios: [cell(r, COL.c3_p1), cell(r, COL.c3_p2), cell(r, COL.c3_p3)].filter(Boolean),
          },
        };

        const ts = cell(r, COL.timestamp);
        const tsTail = ts.replace(/\D+/g, "").slice(-8);
        const email = cell(r, COL.email);
        const emailKey = email.split("@")[0].slice(0, 6);

        return {
          reg_id: `PR-${emailKey}-${tsTail}`,
          source_timestamp: ts,

          round: "Priority",
          full_name: cell(r, COL.full_name),
          whatsapp: cell(r, COL.whatsapp),
          email,

          college: cell(r, COL.college),
          course: cell(r, COL.course),
          category: cell(r, COL.category),
          ca_code: cell(r, COL.ca_code),

          mun_experience: cell(r, COL.mun_experience),
          accommodation: cell(r, COL.accommodation),

          preferences,
          status: "Registered",
        };
      });

    // ✅ Deduplicate by email BEFORE upsert
    const uniqueByEmail = new Map<string, any>();
    for (const row of payload) {
      const key = (row.email || "").toLowerCase().trim();
      if (!key) continue;
      uniqueByEmail.set(key, row); // latest wins
    }
    const dedupedPayload = Array.from(uniqueByEmail.values());

    const { error } = await supabaseAdmin
      .from("delegates")
      .upsert(dedupedPayload, { onConflict: "email" });

    if (error) throw new Error(error.message);

    return Response.json({ ok: true, imported: dedupedPayload.length });
  } catch (e: any) {
    console.error("SYNC ERROR:", e?.message, e);
    return Response.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
