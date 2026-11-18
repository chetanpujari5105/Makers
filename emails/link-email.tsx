import { brand } from "@/lib/brand";

/* React Email template for one-time access links (free claim + sign-in). */
export type LinkEmailProps = {
  heading: string;
  intro: string;
  linkLabel: string;
  link: string;
  minutes: number;
  supportEmail?: string;
};

export function LinkEmail({
  heading,
  intro,
  linkLabel,
  link,
  minutes,
  supportEmail,
}: LinkEmailProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f7f3ec",
          fontFamily: "-apple-system,Segoe UI,Helvetica,Arial,sans-serif",
          color: "#1d1b17",
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 24px" }}>
          <p style={{ fontWeight: 700, letterSpacing: "0.08em" }}>{brand.name}</p>
          <h1 style={{ fontSize: 22, lineHeight: 1.3 }}>{heading}</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>{intro}</p>
          <p style={{ margin: "28px 0" }}>
            <a
              href={link}
              style={{
                background: "#b5381f",
                color: "#fff",
                padding: "14px 22px",
                borderRadius: 999,
                textDecoration: "none",
                fontSize: 16,
                display: "inline-block",
              }}
            >
              {linkLabel}
            </a>
          </p>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
            This link works once and expires in {minutes} minutes. If you didn’t ask for it, you can
            ignore this email.
          </p>
          {supportEmail ? (
            <p style={{ fontSize: 14, color: "#555" }}>Need help? Write to {supportEmail}.</p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
