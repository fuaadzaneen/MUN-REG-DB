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
  const EVENT_NAME = process.env.EVENT_NAME || "GLCE MUN";
  const EVENT_YEAR = process.env.EVENT_YEAR || "2026";
  const EVENT_DATES = process.env.EVENT_DATES || "23rd to 25th January";
  const TAGLINE = process.env.EVENT_TAGLINE || "Fiat justitia Ruat caelum";

  const LOGO_URL = process.env.GLCE_LOGO_URL || ""; // MUST be direct image URL

  const PAYMENT_URL = process.env.PAYMENT_FORM_URL || "";
  const WHATSAPP_GROUP_URL = process.env.WHATSAPP_GROUP_URL || "";

  const CONTACT_1_NAME = process.env.CONTACT_1_NAME || "Aksa";
  const CONTACT_1_WA = process.env.CONTACT_1_WA || "https://wa.link/zyqq7g";
  const CONTACT_1_PHONE = process.env.CONTACT_1_PHONE || "+91 88484 62375";

  const CONTACT_2_NAME = process.env.CONTACT_2_NAME || "Tinil";
  const CONTACT_2_WA = process.env.CONTACT_2_WA || "https://wa.link/mwj3bg";
  const CONTACT_2_PHONE = process.env.CONTACT_2_PHONE || "+91 89436 22795";

  const FOOTER_EMAIL =
    process.env.FOOTER_EMAIL || process.env.REPLY_TO_EMAIL || "glcemun@gmail.com";

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
    `${round} Round Allotment:`,
    `Committee: ${p.committee}`,
    `Portfolio: ${p.portfolio}`,
    ``,
    PAYMENT_URL ? `Payment Form: ${PAYMENT_URL}` : "",
    WHATSAPP_GROUP_URL ? `WhatsApp Group: ${WHATSAPP_GROUP_URL}` : "",
    ``,
    `For queries, contact:`,
    `${CONTACT_1_NAME}: ${CONTACT_1_PHONE}`,
    `${CONTACT_2_NAME}: ${CONTACT_2_PHONE}`,
    ``,
    `Email: ${FOOTER_EMAIL}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Palette (designer-faithful): deep wine + gold
  const OUTER_BG = "#2b0019"; // dark violet-maroon (NOT pink)
  const CARD_BG = "#1a000f"; // near-black wine
  const GOLD = "#DAAB2D";

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

                  <div style="height:6px;"></div>

                  <div style="
                    color:${GOLD};
                    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
                    font-size:18px;
                    letter-spacing:0.6px;
                    margin-top:2px;
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

                  <div style="height:16px;"></div>

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
                    color:#f4efe4;
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
                    <br/>
                    <span style="opacity:0.92;">Dates: ${esc(EVENT_DATES)}</span>
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
                                font-family:Georgia,'Times New Roman',serif;
                                font-size:12px;
                                letter-spacing:1.6px;
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

                  ${
                    PAYMENT_URL
                      ? `
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td align="center">
                          <a href="${esc(PAYMENT_URL)}"
                            style="
                              display:inline-block;
                              background:${GOLD};
                              color:#1a000f;
                              text-decoration:none;
                              font-family:Arial, sans-serif;
                              font-weight:700;
                              font-size:13px;
                              letter-spacing:0.6px;
                              padding:12px 18px;
                              border-radius:12px;
                              box-shadow: 0 14px 30px rgba(0,0,0,0.35);
                            ">
                            PAYMENT FORM
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="height:10px;"></div>
                  `
                      : ""
                  }

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
