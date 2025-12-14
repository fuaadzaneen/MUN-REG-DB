import { google } from "googleapis";
import { supabaseAdmin } from "@/src/lib/supabase";

/**
 * Writes back to Google Sheet:
 * W = allotted_committee
 * X = allotted_portfolio
 * Y = status
 * Z = allotted_at
 *
 * Matches rows by EMAIL (col D, index 3).
 */
function getSheetsClientRW() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON in .env.local");

  const creds = JSON.parse(raw);

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"], // ✅ read + write
  });

  return google.sheets({ version: "v4", auth });
}

const COL = {
  email: 3, // D
};

const cell = (row: any[], idx: number) => (row?.[idx] ?? "").toString().trim();

export async function POST() {
  try {
    const sheetId = process.env.SHEET_ID;
    const sheetName = process.env.REG_SHEET_NAME;
    if (!sheetId) throw new Error("Missing SHEET_ID in .env.local");
    if (!sheetName) throw new Error("Missing REG_SHEET_NAME in .env.local");

    const sheets = getSheetsClientRW();

    // 1) Read sheet rows
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z`,
    });

    const values = resp.data.values ?? [];
    if (values.length < 2) {
      return Response.json({ ok: true, updated: 0, note: "No rows found" });
    }

    const header = values[0];
    const rows = values.slice(1);

    // Map email -> sheet row number (Google Sheets is 1-based; + header => start at 2)
    const emailToRowNum = new Map<string, number>();
    rows.forEach((r, i) => {
      const em = cell(r, COL.email).toLowerCase();
      if (!em) return;
      emailToRowNum.set(em, i + 2);
    });

    // 2) Pull delegates data from Supabase that we want to write back
    const { data, error } = await supabaseAdmin
      .from("delegates")
      .select("email, allotted_committee, allotted_portfolio, status, allotted_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const updates: { range: string; values: any[][] }[] = [];

    for (const d of data ?? []) {
      const email = (d.email ?? "").toLowerCase().trim();
      if (!email) continue;

      const rowNum = emailToRowNum.get(email);
      if (!rowNum) continue; // not found in sheet

      // Write into W:X:Y:Z
      updates.push({
        range: `${sheetName}!W${rowNum}:Z${rowNum}`,
        values: [
          [
            d.allotted_committee ?? "",
            d.allotted_portfolio ?? "",
            d.status ?? "",
            d.allotted_at ?? "",
          ],
        ],
      });
    }

    if (updates.length === 0) {
      return Response.json({ ok: true, updated: 0, note: "Nothing to write back" });
    }

    // 3) Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });

    return Response.json({ ok: true, updated: updates.length });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
