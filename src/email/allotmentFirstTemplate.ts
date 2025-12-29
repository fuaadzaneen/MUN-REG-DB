/**
 * ============================================================
 * GLCE MUN 2026 — FIRST ROUND ALLOTMENT EMAIL TEMPLATE
 * ============================================================
 *
 * • NO environment variables
 * • EVERYTHING explicitly defined here
 * • Designed to be edited safely by humans
 * • Same visual + structural richness as Priority
 *
 * 👉 IMPORTANT:
 *   Look for 🔴 EDIT HERE 🔴 blocks to change:
 *   - Registration Fee
 *   - Payment Deadline
 * ============================================================
 */

type FirstRoundAllotmentParams = {
  name: string;
  committee: string;
  portfolio: string;
};

/* ------------------------------------------------------------
 * Small HTML escape helper (same as Priority)
 * ------------------------------------------------------------ */
function esc(s: any) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderFirstRoundAllotmentEmail(p: FirstRoundAllotmentParams) {
  /* ============================================================
   * EVENT IDENTITY (STATIC — SAFE TO EDIT)
   * ============================================================ */
  const EVENT_NAME = "GLCE MUN";
  const EVENT_YEAR = "2026";
  const EVENT_DATES = "23rd to 25th January, 2026";
  const EVENT_TAGLINE = "Fiat Justitia Ruat Caelum";

  const LOGO_URL =
    "https://i.ibb.co/VpYfctHt/Untitled-design-20251214-074757-0000.png"; // must be direct image URL

  const ACCOMMODATION_WHATSAPP_GROUP =
    "https://chat.whatsapp.com/CJmuBfKYOngA74KHrjFCtc";

  /* ============================================================
   * 🔴 🔴 🔴 FIRST ROUND — PAYMENT CONFIG (EDIT HERE) 🔴 🔴 🔴
   * ============================================================ */

  // 💰 REGISTRATION FEES — FIRST ROUND
  const REG_FEE_GENERAL = "₹1399"; // 🔴 CHANGE THIS WHEN NEEDED
  const REG_FEE_GLCE = "₹1199";    // 🔴 CHANGE THIS WHEN NEEDED
  const REFUND_AMOUNT = "₹100";
  const MIN_DELEGATION_SIZE = "12";

  // ⏰ PAYMENT DEADLINE — FIRST ROUND
  const PAYMENT_DEADLINE =
    "11:59 PM on 2ND January, 2026"; // 🔴 CHANGE THIS WHEN NEEDED

  /* ============================================================
   * PAYMENT LINKS (STATIC)
   * ============================================================ */
  const PAYMENT_FORM_URL = "https://forms.gle/UjZ9n5DSzELCwnek6";
  const BANK_REFERENCE_FORM_URL = PAYMENT_FORM_URL;

  /* ============================================================
   * BANK DETAILS
   * ============================================================ */
  const BANK_ACCOUNT_NO = "24770100006816";
  const BANK_IFSC = "FDRL0002477";

  /* ============================================================
   * CONTACT DETAILS
   * ============================================================ */
  const CONTACT_1_NAME = "Pramith";
  const CONTACT_1_PHONE = "+91 85473 00815";
  const CONTACT_1_WA = "https://wa.link/iwoac1";

  const CONTACT_2_NAME = "Anna";
  const CONTACT_2_PHONE = "+91 80866 35149";
  const CONTACT_2_WA = "https://wa.link/uitm7a";

  const OFFICIAL_EMAIL = "glcemun2026@gmail.com";

  /* ============================================================
   * SUBJECT
   * ============================================================ */
  const subject = `${EVENT_NAME} ${EVENT_YEAR} — First Round Allotment: ${p.committee} (${p.portfolio})`;

  const name = esc(p.name);
  const committee = esc(p.committee);
  const portfolio = esc(p.portfolio);

  /* ============================================================
   * TEXT VERSION (PLAIN FALLBACK)
   * ============================================================ */
  const text = `
Greetings ${p.name},

Congratulations!

You have been allotted a portfolio in the FIRST ROUND of ${EVENT_NAME} ${EVENT_YEAR}.

Committee: ${p.committee}
Portfolio: ${p.portfolio}

Event Dates: ${EVENT_DATES}

REGISTRATION FEE (First Round):
• ${REG_FEE_GENERAL} (General Delegates)
• ${REG_FEE_GLCE} (GLCE Delegates)

Payment Deadline:
${PAYMENT_DEADLINE}

Failure to complete payment before the deadline will result in cancellation of the allotment.

Payment Form:
${PAYMENT_FORM_URL}

Bank Details:
Account No: ${BANK_ACCOUNT_NO}
IFSC: ${BANK_IFSC}

For queries:
${CONTACT_1_NAME}: ${CONTACT_1_PHONE}
${CONTACT_2_NAME}: ${CONTACT_2_PHONE}

Official Email:
${OFFICIAL_EMAIL}
`.trim();

  /* ============================================================
   * COLORS (MATCHES PRIORITY AESTHETIC)
   * ============================================================ */
  const OUTER_BG = "#2b0019";
  const CARD_BG = "#1a000f";
  const GOLD = "#DAAB2D";
  const OFFWHITE = "#f4efe4";

  const badge = (label: string) => `
    <span style="
      display:inline-block;
      padding:6px 10px;
      border-radius:999px;
      border:1px solid rgba(218,171,45,0.35);
      background:rgba(0,0,0,0.20);
      color:rgba(218,171,45,0.95);
      font-family:Arial, sans-serif;
      font-size:11px;
      letter-spacing:0.8px;
      text-transform:uppercase;
      margin:0 6px 8px 0;
      white-space:nowrap;
    ">${esc(label)}</span>
  `;

  /* ============================================================
   * HTML VERSION (FULL, RICH, LIKE PRIORITY)
   * ============================================================ */
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<title>${esc(EVENT_NAME)} First Round Allotment</title>
</head>

<body style="margin:0;padding:0;background:${OUTER_BG};">
<center style="width:100%;padding:24px 0;background:${OUTER_BG};">

<table width="640" cellpadding="0" cellspacing="0" style="
  background:${CARD_BG};
  border-radius:20px;
  border:1px solid rgba(218,171,45,0.28);
  color:${OFFWHITE};
  box-shadow:0 18px 70px rgba(0,0,0,0.42);
">

<tr>
<td style="padding:28px;text-align:center;">

  ${
    LOGO_URL
      ? `<img src="${esc(LOGO_URL)}" width="220" style="display:block;margin:0 auto 14px auto;" />`
      : ""
  }

  <div style="color:${GOLD};font-family:Georgia,serif;font-size:18px;">
    ${EVENT_NAME} • ${EVENT_YEAR}
  </div>

  <div style="font-size:14px;opacity:0.9;margin-top:6px;">
    ${EVENT_TAGLINE}
  </div>

  <div style="margin-top:14px;">
    ${badge("FIRST ROUND")}
    ${badge(`DATES • ${EVENT_DATES}`)}
  </div>

  <hr style="border:none;height:1px;background:rgba(218,171,45,0.4);margin:20px 0;"/>

  <h2 style="font-family:Georgia,serif;color:${OFFWHITE};">
    Greetings ${name},
  </h2>

  <p style="line-height:22px;">
    You have successfully registered for the <b style="color:${GOLD};">First Round</b> of
    <b>${EVENT_NAME} ${EVENT_YEAR}</b>.
    Welcome to the next stage — things get serious (and fun) from here.
  </p>

  <div style="
    border:1px solid rgba(218,171,45,0.65);
    border-radius:18px;
    padding:20px;
    margin:24px 0;
  ">
    <div style="letter-spacing:1.6px;font-size:11px;color:${GOLD};">
      FIRST ROUND ALLOTMENT
    </div>

    <h1 style="margin:10px 0;color:${GOLD};">${committee}</h1>
    <div style="opacity:0.9;">as the delegate of</div>
    <h2 style="margin:6px 0;color:${GOLD};">${portfolio}</h2>
  </div>

  <h3 style="color:${GOLD};">Payment & Delegation Policy</h3>

  <p>
    Registration fee for <b>First Round</b> delegates is
    <b style="color:${GOLD};">${REG_FEE_GENERAL}</b>.
    Delegates from GLCE are required to pay
    <b style="color:${GOLD};">${REG_FEE_GLCE}</b>.
  </p>

  <p>
    Delegations with a minimum of <b>${MIN_DELEGATION_SIZE}</b> delegates
    are eligible for a refund of <b>${REFUND_AMOUNT}</b>.
  </p>

  <p style="
    border:1px dashed rgba(218,171,45,0.6);
    padding:14px;
    border-radius:14px;
    background:rgba(0,0,0,0.25);
  ">
    ⏰ <b>Payment Deadline:</b><br/>
    <b style="color:${GOLD};">${PAYMENT_DEADLINE}</b><br/>
    <br/>
    Failure to complete payment before the deadline will result in
    <b>cancellation of the allotted portfolio</b>.
  </p>

  <p>
    <a href="${PAYMENT_FORM_URL}" style="
      display:inline-block;
      background:${GOLD};
      color:#1a000f;
      padding:12px 18px;
      border-radius:12px;
      font-weight:800;
      text-decoration:none;
      margin-top:10px;
    ">
      PAY NOW
    </a>
  </p>

  <p style="margin-top:16px;font-size:13px;">
    Bank Account No: <b>${BANK_ACCOUNT_NO}</b><br/>
    IFSC Code: <b>${BANK_IFSC}</b>
  </p>

  <p style="margin-top:20px;">
    <a href="${esc(ACCOMMODATION_WHATSAPP_GROUP)}" style="color:${GOLD};">
      Join Accommodation WhatsApp Group
    </a>
  </p>

  <hr style="border:none;height:1px;background:rgba(218,171,45,0.4);margin:20px 0;"/>

  <p>
    For queries, contact:<br/>
    ${CONTACT_1_NAME} —
    <a href="${CONTACT_1_WA}" style="color:${GOLD};">${CONTACT_1_PHONE}</a><br/>
    ${CONTACT_2_NAME} —
    <a href="${CONTACT_2_WA}" style="color:${GOLD};">${CONTACT_2_PHONE}</a>
  </p>

  <p style="font-size:12px;opacity:0.8;">
    Official Email:
    <a href="mailto:${OFFICIAL_EMAIL}" style="color:${GOLD};">
      ${OFFICIAL_EMAIL}
    </a>
  </p>

</td>
</tr>
</table>

</center>
</body>
</html>`;

  return { subject, html, text };
}
