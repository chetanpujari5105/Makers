import { render } from "@react-email/render";
import { Resend } from "resend";

import { MAGIC_LINK_MINUTES } from "@/lib/auth/magic-link";
import { brand } from "@/lib/brand";

import { LinkEmail, type LinkEmailProps } from "@/emails/link-email";

/*
 * Transactional email through Resend, rendered with React Email.
 * Without RESEND_API_KEY: in development the link is printed to the server
 * console so the flow can be tested; on a deployed site it fails loudly
 * instead of pretending an email was sent.
 */
type Mail = { to: string; subject: string } & Omit<LinkEmailProps, "minutes" | "supportEmail">;

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Sender shown as "Fieldkit <address>": the name comes from lib/brand.ts, the address from EMAIL_FROM. */
export function senderFrom(emailFrom: string) {
  const address = emailFrom.match(/<([^>]+)>/)?.[1] ?? emailFrom;
  return `${brand.name} <${address.trim()}>`;
}

export async function renderLinkEmail(mail: Mail) {
  const element = (
    <LinkEmail {...mail} minutes={MAGIC_LINK_MINUTES} supportEmail={process.env.SUPPORT_EMAIL} />
  );
  return { html: await render(element), text: await render(element, { plainText: true }) };
}

export async function sendLinkEmail(mail: Mail) {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") throw new Error("Email (Resend) is not configured.");
    console.warn(`[dev email — not sent] to=${mail.to} subject="${mail.subject}"\n  ${mail.link}`);
    return;
  }
  const { html, text } = await renderLinkEmail(mail);
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: senderFrom(process.env.EMAIL_FROM!),
    to: mail.to,
    subject: mail.subject,
    html,
    text,
  });
  if (error) throw new Error(`Resend: ${error.name}`);
}
