import nodemailer from "nodemailer";
import { google } from "googleapis";
import { mailerEnv } from "../config/env.js";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  fromName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transporter = nodemailer.createTransport({
  host:    mailerEnv.SMTP_HOST,
  port:    mailerEnv.SMTP_PORT,
  secure:  false,
  family:  4,
  auth: {
    user: mailerEnv.SMTP_USER ?? "",
    pass: mailerEnv.SMTP_PASS ?? "",
  },
  connectionTimeout: 15_000,
  greetingTimeout:   10_000,
  socketTimeout:     30_000,
} as Parameters<typeof nodemailer.createTransport>[0]);

const hasGmailApi =
  mailerEnv.GMAIL_CLIENT_ID &&
  mailerEnv.GMAIL_CLIENT_SECRET &&
  mailerEnv.GMAIL_REFRESH_TOKEN;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gmailClient: any = null;

if (hasGmailApi) {
  const oauth2Client = new google.auth.OAuth2(
    mailerEnv.GMAIL_CLIENT_ID,
    mailerEnv.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({ refresh_token: mailerEnv.GMAIL_REFRESH_TOKEN });
  gmailClient = google.gmail({ version: "v1", auth: oauth2Client });
  console.log("📨 Gmail API fallback configured (OAuth2 over HTTPS)");
} else {
  console.warn("⚠️  Gmail API credentials not set — no fallback if SMTP fails");
}

async function sendViaGmailApi({ to, subject, html, replyTo, fromName }: SendMailOptions) {
  const from = fromName
    ? `"${fromName}" <${mailerEnv.SMTP_USER}>`
    : mailerEnv.SMTP_USER;

  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
  ];

  if (replyTo) messageParts.splice(2, 0, `Reply-To: ${replyTo}`);

  const rawMessage =
    messageParts.join("\r\n") + "\r\n\r\n" + Buffer.from(html).toString("base64");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmailClient.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });

  return { messageId: res.data.id as string };
}

export async function verifyTransport(): Promise<void> {
  await transporter.verify();
}

export async function sendMail(opts: SendMailOptions): Promise<{ messageId: string; provider: string }> {
  const { to, subject, html, replyTo, fromName } = opts;

  try {
    const from = fromName
      ? `"${fromName}" <${mailerEnv.SMTP_USER}>`
      : mailerEnv.SMTP_USER;

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      replyTo,
      encoding: "utf-8",
      textEncoding: "base64",
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });

    console.log(`📧 Email sent via SMTP to ${to} — messageId: ${info.messageId}`);
    return { messageId: info.messageId, provider: "smtp" };
  } catch (smtpErr: unknown) {
    const smtpMsg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
    console.warn(`⚠️  SMTP failed for ${to}: ${smtpMsg} — attempting Gmail API fallback`);

    if (!gmailClient) {
      throw new Error(`Email delivery failed (SMTP, no fallback): ${smtpMsg}`);
    }

    try {
      const result = await sendViaGmailApi(opts);
      console.log(`📧 Email sent via Gmail API to ${to} — messageId: ${result.messageId}`);
      return { messageId: result.messageId, provider: "gmail-api" };
    } catch (apiErr: unknown) {
      const apiMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);
      throw new Error(`Email delivery failed. SMTP: ${smtpMsg} | Gmail API: ${apiMsg}`);
    }
  }
}
