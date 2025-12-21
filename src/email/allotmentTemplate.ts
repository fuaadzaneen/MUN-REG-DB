type AllotmentParams = {
  name: string;
  email: string;
  round: string; // e.g. "Priority"
  committee: string; // e.g. "UNHRC"
  portfolio: string; // e.g. "China"
};

function esc(s: any) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderAllotmentEmail(p: AllotmentParams) {
  // Keep these env-driven (safe + useful)
  const EVENT_NAME = process.env.EVENT_NAME || "GLCE MUN";
  const EVENT_YEAR = process.env.EVENT_YEAR || "2026";
  const EVENT_DATES = process.env.EVENT_DATES || "23rd to 25th January";
  const TAGLINE = process.env.EVENT_TAGLINE || "Fiat justitia Ruat caelum";
  const LOGO_URL = process.env.GLCE_LOGO_URL || ""; // MUST be direct image URL
  const WHATSAPP_GROUP_URL = process.env.WHATSAPP_GROUP_URL || "";

  // HARD-FIXED: no env overrides (your request)
  const PAYMENT_URL = "https://forms.gle/UjZ9n5DSzELCwnek6";
  const BANK_REFERENCE_URL = PAYMENT_URL;

  const CONTACT_1_NAME = "Pramith";
  const CONTACT_1_WA = "https://wa.link/iwoac1";
  const CONTACT_1_PHONE = "+91 85473 00815";

  const CONTACT_2_NAME = "Anna";
  const CONTACT_2_WA = "https://wa.link/uitm7a";
  const CONTACT_2_PHONE = "+91 80866 35149";

  const FOOTER_EMAIL =
    process.env.FOOTER_EMAIL ||
    process.env.REPLY_TO_EMAIL ||
    "glcemun2026@gmail.com";

  // Payment + disclaimer content
  const PAYMENT_DEADLINE = "12:00 PM on 24th December, 2025";
  const FEE_NORMAL = "₹1299";
  const FEE_GLCE = "₹999";
  const REFUND_AMOUNT = "₹100";
  const MIN_DELEGATES = "12";

  const BANK_ACCOUNT_NO = "24770100006816";
  const BANK_IFSC = "FDRL0002477";

  const subject = `${EVENT_NAME} ${EVENT_YEAR} – ${p.round} Allotment: ${p.committee} (${p.portfolio})`;

  const name = esc(p.name);
  const round = esc(p.round);
  const committee = esc(p.committee);
  const portfolio = esc(p.portfolio);

  // Plain text fallback
  const text = [
    `Greetings ${p.name},`,
    ``,
    `Your registration for ${EVENT_NAME} ${EVENT_YEAR} is confirmed.`,
    `Dates: ${EVENT_DATES}`,
    ``,
    `${p.round} Round Allotment:`,
    `Committee: ${p.committee}`,
    `Portfolio: ${p.portfolio}`,
    ``,
    `Payment & Delegation Policy:`,
    `All delegates (individual or institutional) must pay a registration fee of ${FEE_NORMAL}. Delegates from GLCE must pay ${FEE_GLCE}.`,
    `Institutional delegations will be duly recognized by the Secretariat, and a refund of ${REFUND_AMOUNT} will be issued upon fulfillment of the delegation criteria.`,
    `Delegation Criteria: Minimum of ${MIN_DELEGATES} delegates from an institution.`,
    `All delegates must complete payment on or before ${PAYMENT_DEADLINE}. Failure to pay within the stipulated time will result in cancellation of the allotted portfolio, which will be opened for allotment in the next round of registrations.`,
    `(If your institution does not meet the delegation criteria, you will be considered an individual delegate.)`,
    ``,
    `Payment Form: ${PAYMENT_URL}`,
    `Bank Transfer Done? Submit Reference: ${BANK_REFERENCE_URL}`,
    ``,
    `Bank Transfer Details:`,
    `Account No: ${BANK_ACCOUNT_NO}`,
    `IFSC: ${BANK_IFSC}`,
    ``,
    WHATSAPP_GROUP_URL
      ? `WhatsApp Group: ${WHATSAPP_GROUP_URL}`
      : "WhatsApp Group: https://chat.whatsapp.com/CJmuBfKYOngA74KHrjFCtc",
    ``,
    `For queries, contact:`,
    `${CONTACT_1_NAME}: ${CONTACT_1_PHONE}`,
    `${CONTACT_2_NAME}: ${CONTACT_2_PHONE}`,
    ``,
    `Email: ${FOOTER_EMAIL}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Palette
  const OUTER_BG = "#2b0019";
  const CARD_BG = "#1a000f";
  const GOLD = "#DAAB2D";
  const OFFWHITE = "#f4efe4";

  // Reusable mini badge
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

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${esc(EVENT_NAME)} Allotment</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap');

      @media (max-width: 620px) {
        .container { width: 100% !important; }
        .pad { padding: 18px !important; }
        .heroTitle { font-size: 22px !important; }
        .committee { font-size: 34px !important; }
        .portfolio { font-size: 26px !important; }
        .logo { width: 170px !important; }
        .boxPad { padding: 14px !important; }
        .btn { display:block !important; width:100% !important; box-sizing:border-box !important; }
      }
    </style>
  </head>

  <body style="margin:0;padding:0;background:${OUTER_BG};">
    <center style="width:100%;background:${OUTER_BG};padding:24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100" style="border-collapse:collapse;width:100%;">
        <tr>
          <td align="center" style="padding:0 14px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" class="container"
              style="
                width:640px; max-width:640px;
                border-collapse:separate;
                border-spacing:0;
                background:${CARD_BG};
                border:1px solid rgba(218,171,45,0.28);
                border-radius:20px;
                overflow:hidden;
                box-shadow:0 18px 70px rgba(0,0,0,0.42);
              ">

              <!-- Header -->
              <tr>
                <td class="pad" style="
                  background:
                    radial-gradient(900px 420px at 50% -30%, rgba(218,171,45,0.20), rgba(0,0,0,0) 60%),
                    radial-gradient(540px 380px at 15% 30%, rgba(218,171,45,0.10), rgba(0,0,0,0) 62%),
                    linear-gradient(180deg, #2a0018, #140009);
                  padding:28px 22px 18px 22px;
                  text-align:center;
                ">

                  ${
                    LOGO_URL
                      ? `<img src="${esc(LOGO_URL)}"
                          class="logo"
                          width="220"
                          alt="${esc(EVENT_NAME)} Logo"
                          style="
                            display:block;
                            margin:0 auto 10px auto;
                            border:0; outline:none; text-decoration:none;
                            height:auto;
                            width:220px; max-width:220px;
                            filter: drop-shadow(0 10px 22px rgba(0,0,0,0.55));
                          " />`
                      : ""
                  }

                  <div style="
                    color:${GOLD};
                    font-family:'Playfair Display', Georgia, 'Times New Roman', serif;
                    font-size:18px;
                    letter-spacing:0.6px;
                    margin-top:4px;
                  ">
                    ${esc(EVENT_NAME)} • ${esc(EVENT_YEAR)}
                  </div>

                  <div style="
                    color:rgba(218,171,45,0.90);
                    font-family:'Playfair Display', Georgia, 'Times New Roman', serif;
                    font-size:14px;
                    margin-top:6px;
                    letter-spacing:0.4px;
                  ">
                    ${esc(TAGLINE)}
                  </div>

                  <div style="height:14px;"></div>

                  <div style="text-align:center;">
                    ${badge(`DATES • ${EVENT_DATES}`)}
                    ${badge(`${p.round} ROUND`)}
                  </div>

                  <div style="height:10px;"></div>

                  <div style="
                    width:100%;
                    height:1px;
                    background: linear-gradient(90deg, rgba(218,171,45,0), rgba(218,171,45,0.55), rgba(218,171,45,0));
                    margin:0 auto;
                  "></div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td class="pad" style="padding:22px 28px 10px 28px;text-align:center;">
                  <div class="heroTitle" style="
                    font-family:'Playfair Display', Georgia, 'Times New Roman', serif;
                    font-size:24px;
                    font-weight:700;
                    color:${OFFWHITE};
                    margin:0 0 10px 0;
                  ">
                    Greetings ${name},
                  </div>

                  <div style="
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size:15px;
                    line-height:24px;
                    color:rgba(244,239,228,0.92);
                    margin:0 auto 18px auto;
                    max-width:520px;
                  ">
                    We are pleased to confirm your registration for
                    <b style="color:${GOLD};">${esc(EVENT_NAME)}</b>.
                  </div>

                  <!-- Allotment card -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                          style="
                            border-collapse:separate;border-spacing:0;
                            max-width:560px;
                            background:
                              radial-gradient(800px 260px at 50% 0%, rgba(218,171,45,0.10), rgba(0,0,0,0) 65%),
                              linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.45));
                            border: 1px solid rgba(218,171,45,0.65);
                            border-radius:18px;
                            overflow:hidden;
                            box-shadow: 0 14px 40px rgba(0,0,0,0.40);
                          ">
                          <tr>
                            <td style="padding:20px 18px 24px 18px;text-align:center;">
                              <div style="
                                color:rgba(218,171,45,0.95);
                                font-family:Arial, sans-serif;
                                font-size:11px;
                                letter-spacing:1.8px;
                                text-transform:uppercase;
                                margin-bottom:10px;
                              ">
                                ${esc(round)} ROUND ALLOTMENT
                              </div>

                              <div class="committee" style="
                                color:${GOLD};
                                font-family: Georgia, 'Times New Roman', serif;
                                font-size:46px;
                                font-weight:700;
                                letter-spacing:0.6px;
                                margin:2px 0 10px 0;
                                text-shadow: 0 10px 24px rgba(0,0,0,0.55);
                              ">
                                ${committee}
                              </div>

                              <div style="
                                color:rgba(244,239,228,0.90);
                                font-family: Georgia, 'Times New Roman', serif;
                                font-size:14px;
                                margin:0 0 10px 0;
                              ">
                                As the delegate of
                              </div>

                              <div class="portfolio" style="
                                color:${GOLD};
                                font-family:'Playfair Display', Georgia, 'Times New Roman', serif;
                                font-size:32px;
                                font-weight:700;
                                letter-spacing:0.4px;
                                margin:0;
                                text-shadow: 0 10px 24px rgba(0,0,0,0.55);
                              ">
                                ${portfolio}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <div style="height:18px;"></div>

                  <!-- Payment Policy / Disclaimer box -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                          style="
                            border-collapse:separate;border-spacing:0;
                            max-width:560px;
                            background: linear-gradient(180deg, rgba(218,171,45,0.09), rgba(0,0,0,0.42));
                            border: 1px solid rgba(218,171,45,0.35);
                            border-radius:16px;
                            overflow:hidden;
                          ">
                          <tr>
                            <td class="boxPad" style="padding:16px 16px 14px 16px;text-align:left;">
                              <div style="
                                text-align:center;
                                margin-bottom:6px;
                                padding:10px 10px 2px 10px;
                                border-radius:14px;
                                background: radial-gradient(520px 140px at 50% 0%, rgba(218,171,45,0.12), rgba(0,0,0,0) 70%);
                              ">
                                ${badge("PAYMENT POLICY")}
                                ${badge("DELEGATION")}
                                ${badge(`DEADLINE • ${PAYMENT_DEADLINE}`)}
                              </div>

                              <div style="
                                font-family: Georgia, 'Times New Roman', serif;
                                color:rgba(244,239,228,0.92);
                                font-size:13px;
                                line-height:20px;
                              ">
                                <div style="margin-bottom:8px;">
                                  All delegates, whether registering individually or as part of an institutional delegation,
                                  are required to pay a registration fee of <b style="color:${GOLD};">${esc(FEE_NORMAL)}</b>.
                                  Delegates from GLCE are required to pay <b style="color:${GOLD};">${esc(FEE_GLCE)}</b>.
                                </div>

                                <div style="margin-bottom:8px;">
                                  Institutional delegations will be duly recognized by the Secretariat, and a refund of
                                  <b style="color:${GOLD};">${esc(REFUND_AMOUNT)}</b> will be issued upon fulfillment of the delegation criteria.
                                </div>

                                <div style="margin-bottom:10px;">
                                  <b style="color:${GOLD};">Delegation Criteria:</b>
                                  A minimum of <b style="color:${GOLD};">${esc(MIN_DELEGATES)}</b> delegates from an institution.
                                </div>

                                <div style="
                                  margin-bottom:12px;
                                  padding:10px 12px;
                                  border-radius:12px;
                                  border:1px dashed rgba(218,171,45,0.55);
                                  background: rgba(0,0,0,0.25);
                                ">
                                  Please complete payment on or before
                                  <b style="color:${GOLD};">${esc(PAYMENT_DEADLINE)}</b>.
                                  Failure to pay within the stipulated time will result in cancellation of the allotted portfolio,
                                  and it will be opened for allotment in the next round.
                                  <div style="margin-top:8px; opacity:0.92;">
                                    (If your institution does not meet the delegation criteria, you will be considered an individual delegate.)
                                  </div>
                                </div>

                                <!-- Bank details -->
                                <div style="
                                  border-radius:14px;
                                  border:1px solid rgba(218,171,45,0.30);
                                  background: rgba(0,0,0,0.22);
                                  padding:12px 12px 10px 12px;
                                ">
                                  <div style="text-align:center; margin-bottom:8px;">
                                    ${badge("BANK TRANSFER")}
                                    ${badge("COPY DETAILS")}
                                  </div>

                                  <div style="
                                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                                    font-size:12px;
                                    line-height:18px;
                                    color:rgba(244,239,228,0.92);
                                    background: rgba(0,0,0,0.28);
                                    border:1px solid rgba(218,171,45,0.22);
                                    border-radius:12px;
                                    padding:10px 10px;
                                    letter-spacing:0.2px;
                                  ">
                                    <div style="opacity:0.85;">Bank Account No.</div>
                                    <div style="color:${GOLD}; font-weight:700; font-size:13px;">${esc(BANK_ACCOUNT_NO)}</div>
                                    <div style="height:8px;"></div>
                                    <div style="opacity:0.85;">IFSC Code</div>
                                    <div style="color:${GOLD}; font-weight:700; font-size:13px;">${esc(BANK_IFSC)}</div>
                                  </div>

                                  <div style="
                                    margin-top:8px;
                                    font-family:Arial, sans-serif;
                                    font-size:11px;
                                    color:rgba(244,239,228,0.70);
                                    text-align:center;
                                  ">
                                    Tip: After transferring, submit the reference details using the button below.
                                  </div>
                                </div>
                              </div>

                              <div style="height:14px;"></div>

                              <!-- Buttons -->
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                  <td align="center" style="padding:0;">
                                    <a href="${esc(PAYMENT_URL)}"
                                      class="btn"
                                      style="
                                        display:inline-block;
                                        background:${GOLD};
                                        color:#1a000f;
                                        text-decoration:none;
                                        font-family:Arial, sans-serif;
                                        font-weight:800;
                                        font-size:12px;
                                        letter-spacing:0.9px;
                                        padding:12px 16px;
                                        border-radius:12px;
                                        box-shadow: 0 14px 30px rgba(0,0,0,0.35);
                                        margin:0 6px 10px 0;
                                      ">
                                      PAY NOW • PAYMENT FORM
                                    </a>

                                    <a href="${esc(BANK_REFERENCE_URL)}"
                                      class="btn"
                                      style="
                                        display:inline-block;
                                        background: rgba(0,0,0,0.18);
                                        color:${GOLD};
                                        text-decoration:none;
                                        font-family:Arial, sans-serif;
                                        font-weight:800;
                                        font-size:12px;
                                        letter-spacing:0.8px;
                                        padding:12px 16px;
                                        border-radius:12px;
                                        border: 1px solid rgba(218,171,45,0.60);
                                        box-shadow: 0 14px 30px rgba(0,0,0,0.22);
                                        margin:0 0 10px 0;
                                      ">
                                      BANK TRANSFER DONE? • SUBMIT REFERENCE
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <div style="
                                font-family:Arial, sans-serif;
                                font-size:11px;
                                color:rgba(244,239,228,0.65);
                                text-align:center;
                              ">
                                If you paid via bank transfer, please still submit the form with reference details.
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <div style="height:12px;"></div>

                  ${
                    WHATSAPP_GROUP_URL
                      ? `
                    <div style="margin-top:6px;">
                      <a href="${esc(WHATSAPP_GROUP_URL)}"
                        style="
                          color:${GOLD};
                          text-decoration:underline;
                          font-family:Arial, sans-serif;
                          font-size:13px;
                        ">
                        Join Accommodation WhatsApp Group
                      </a>
                    </div>
                  `
                      : ""
                  }

                  <div style="height:20px;"></div>

                  <div style="
                    width:100%;
                    height:1px;
                    background: linear-gradient(90deg, rgba(218,171,45,0), rgba(218,171,45,0.45), rgba(218,171,45,0));
                    margin:0 auto 14px auto;
                  "></div>

                  <!-- Footer -->
                  <div style="
                    font-family:Georgia,'Times New Roman',serif;
                    color:rgba(244,239,228,0.88);
                    font-size:13px;
                    line-height:20px;
                    text-align:center;
                  ">
                    <div style="
                      color:${GOLD};
                      font-family:'Playfair Display', Georgia, 'Times New Roman', serif;
                      font-size:16px;
                      font-weight:700;
                      margin-bottom:6px;
                    ">
                      For queries, contact
                    </div>

                    <div style="margin-bottom:6px;">
                      ${esc(CONTACT_1_NAME)}:
                      <a href="${esc(CONTACT_1_WA)}" style="color:${GOLD};text-decoration:underline;">${esc(CONTACT_1_PHONE)}</a>
                      &nbsp;|&nbsp;
                      ${esc(CONTACT_2_NAME)}:
                      <a href="${esc(CONTACT_2_WA)}" style="color:${GOLD};text-decoration:underline;">${esc(CONTACT_2_PHONE)}</a>
                    </div>

                    <div style="margin-top:10px; color:rgba(244,239,228,0.85);">
                      Email:
                      <a href="mailto:${esc(FOOTER_EMAIL)}" style="color:${GOLD};text-decoration:underline;">
                        ${esc(FOOTER_EMAIL)}
                      </a>
                    </div>

                    <div style="height:16px;"></div>

                    <div style="opacity:0.65;font-size:11px;">
                      This email was sent to ${esc(p.email)}. Please do not forward confidential allotment details.
                    </div>
                  </div>

                  <div style="height:8px;"></div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`;

  return { subject, html, text };
}
