import nodemailer from "nodemailer";

function req(name: string, v?: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function getTransport() {
  const host = req("SMTP_HOST", process.env.SMTP_HOST);
  const port = Number(req("SMTP_PORT", process.env.SMTP_PORT));
  const secure = (process.env.SMTP_SECURE ?? "true") === "true";
  const user = req("SMTP_USER", process.env.SMTP_USER);
  const pass = req("SMTP_PASS", process.env.SMTP_PASS);

  const allowInsecure = (process.env.SMTP_ALLOW_INSECURE ?? "false") === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },

    // ✅ Fix for "self-signed certificate in certificate chain" on some networks/AVs
    tls: allowInsecure
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

export function getFrom() {
  const name = req("MAIL_FROM_NAME", process.env.MAIL_FROM_NAME);
  const email = req("MAIL_FROM_EMAIL", process.env.MAIL_FROM_EMAIL);
  return `"${name}" <${email}>`;
}
