import { google } from "googleapis";
import { supabaseAdmin } from "@/src/lib/supabase";

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");

  const creds = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Column mappings per sheet.
 * IMPORTANT: If your Lightning sheet column layout differs, update COL_LIGHTNING.
 */

// Priority sheet mapping
const COL_PRIORITY = {
  timestamp: 0,
  full_name: 1,
  college: 2,
  course: 3,
  whatsapp: 4,
  email: 5,
  ca_code: 6,
  accommodation: 7,
  c1: 8,
  c1_p1: 9,
  c1_p2: 10,
  c1_p3: 11,
  c2: 12,
  c2_p1: 13,
  c2_p2: 14,
  c2_p3: 15,
  c3: 16,
  c3_p1: 17,
  c3_p2: 18,
  c3_p3: 19,
  mun_experience: 20,
};

// First Round sheet mapping (Column C skipped in your sheet)
const COL_FIRST = {
  timestamp: 0,
  full_name: 1,
  // Column 2 (Column C) is empty/skipped in your First Round sheet
  college: 3,
  course: 4,
  whatsapp: 5,
  email: 6,
  ca_code: 7,
  accommodation: 8,
  c1: 9,
  c1_p1: 10,
  c1_p2: 11,
  c1_p3: 12,
  c2: 13,
  c2_p1: 14,
  c2_p2: 15,
  c2_p3: 16,
  c3: 17,
  c3_p1: 18,
  c3_p2: 19,
  c3_p3: 20,
  mun_experience: 21,
};

// Lightning Round sheet mapping (default: same as First Round)
const COL_LIGHTNING = {
  timestamp: 0,       // A Timestamp
  full_name: 1,       // B Name
  college: 2,         // C College/School
  course: 3,          // D Course/Grade
  whatsapp: 4,        // E Contact Number(WhatsApp)
  email: 5,           // F E-Mail ID
  ca_code: 6,         // G Campus Ambassador Code
  mun_experience: 7,  // H Previous MUN Experiences and Prizes(if any)
  accommodation: 8,   // I Accommodation & Transportation Group

  c1: 9,              // J Committee Preference - 1
  c1_p1: 10,          // K Portfolio Preference 1
  c1_p2: 11,          // L Portfolio Preference 2
  c1_p3: 12,          // M Portfolio Preference 3

  c2: 13,             // N Committee Preference - 2
  c2_p1: 14,          // O Portfolio Preference 1
  c2_p2: 15,          // P Portfolio Preference 2
  c2_p3: 16,          // Q Portfolio Preference 3

  c3: 17,             // R Committee Preference - 3
  c3_p1: 18,          // S Portfolio Preference 1
  c3_p2: 19,          // T Portfolio Preference 2
  c3_p3: 20,          // U Portfolio Preference 3
};

const cell = (r: any[], i: number) => (r?.[i] ?? "").toString().trim();

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const round = searchParams.get("round");

    if (!round || !["Priority", "First", "Lightning"].includes(round)) {
      throw new Error("Missing or invalid round");
    }

    // Select correct mapping based on round
    const mapping =
      round === "Priority" ? COL_PRIORITY : round === "First" ? COL_FIRST : COL_LIGHTNING;

    const SHEET_ID =
      round === "Priority"
        ? process.env.PRIORITY_SHEET_ID
        : round === "First"
        ? process.env.FIRST_SHEET_ID
        : process.env.LIGHTNING_SHEET_ID;

    const SHEET_NAME =
      round === "Priority"
        ? process.env.PRIORITY_SHEET_NAME
        : round === "First"
        ? process.env.FIRST_SHEET_NAME
        : process.env.LIGHTNING_SHEET_NAME;

    if (!SHEET_ID || !SHEET_NAME) {
      throw new Error("Missing sheet env vars");
    }

    const sheets = getSheetsClient();

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:AZ`,
    });

    const values = resp.data.values ?? [];
    if (values.length < 2) return Response.json({ ok: true, imported: 0 });

    const rows = values.slice(1);

    const payload = rows
      .filter((r) => cell(r, mapping.email))
      .map((r) => {
        const email = cell(r, mapping.email);
        const ts = cell(r, mapping.timestamp);
        const emailKey = email.split("@")[0].slice(0, 6);
        const tsTail = ts.replace(/\D+/g, "").slice(-8);

        const prefix = round === "Priority" ? "PR" : round === "First" ? "FR" : "LR";

        return {
          reg_id: `${prefix}-${emailKey}-${tsTail}`,
          source_timestamp: ts,
          round,

          full_name: cell(r, mapping.full_name),
          whatsapp: cell(r, mapping.whatsapp),
          email,

          college: cell(r, mapping.college),
          course: cell(r, mapping.course),
          category: "Delegate",
          ca_code: cell(r, mapping.ca_code),

          mun_experience: cell(r, mapping.mun_experience),
          accommodation: cell(r, mapping.accommodation),

          preferences: {
            pref1: {
              committee: cell(r, mapping.c1),
              portfolios: [
                cell(r, mapping.c1_p1),
                cell(r, mapping.c1_p2),
                cell(r, mapping.c1_p3),
              ].filter(Boolean),
            },
            pref2: {
              committee: cell(r, mapping.c2),
              portfolios: [
                cell(r, mapping.c2_p1),
                cell(r, mapping.c2_p2),
                cell(r, mapping.c2_p3),
              ].filter(Boolean),
            },
            pref3: {
              committee: cell(r, mapping.c3),
              portfolios: [
                cell(r, mapping.c3_p1),
                cell(r, mapping.c3_p2),
                cell(r, mapping.c3_p3),
              ].filter(Boolean),
            },
          },
          // NOTE: Status is omitted here to preserve existing "Allotted" statuses
        };
      });

    const unique = new Map<string, any>();
    for (const row of payload) {
      unique.set(row.email.toLowerCase(), row);
    }

    const { error } = await supabaseAdmin.from("delegates").upsert([...unique.values()], {
      onConflict: "email",
    });

    if (error) throw error;

    return Response.json({ ok: true, imported: unique.size });
  } catch (e: any) {
    console.error(e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
