import type { Metadata } from "next";
import Link from "next/link";

import { BusinessDetails, GrievanceOfficer, LegalPage } from "@/components/legal/legal-page";
import { brand } from "@/lib/brand";
import { dataItems, processors } from "@/lib/legal/data-map";

export const metadata: Metadata = { title: "Privacy" };

/* The lists below come from lib/legal/data-map.ts, the same source as docs/DATA_MAP.md. */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      intro={`What personal data ${brand.name} collects, why, where it is kept and how to ask for it to be deleted.`}
    >
      <section>
        <h2>Who is responsible</h2>
        <BusinessDetails />
      </section>
      <section>
        <h2>What we collect and why</h2>
        <p>
          We collect only what we need to give you your kits. There are no advertising or tracking
          cookies and no analytics that follow you around the web.
        </p>
        <div className="flex flex-col gap-4">
          {dataItems.map((item) => (
            <div key={item.data} className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium">{item.data}</h3>
              <dl className="mt-2 grid gap-x-4 gap-y-1 text-base sm:grid-cols-[9rem_1fr]">
                <dt className="text-muted-foreground">When</dt>
                <dd>{item.when}</dd>
                <dt className="text-muted-foreground">Why</dt>
                <dd>{item.purpose}</dd>
                <dt className="text-muted-foreground">Kept</dt>
                <dd>{item.retention}</dd>
                <dt className="text-muted-foreground">Handled by</dt>
                <dd>
                  {item.processors.length > 0 ? item.processors.join(", ") : "Only your browser"}
                </dd>
              </dl>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Services that handle data for us</h2>
        <ul>
          {processors.map((processor) => (
            <li key={processor.name}>
              <strong>{processor.name}</strong> — {processor.role} ({processor.region})
            </li>
          ))}
        </ul>
        <p>We don’t sell your personal data or share it for advertising.</p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>
          One cookie keeps you signed in to My Library for 30 days. It is needed for the library to
          work, so there is nothing to opt in to. Signing out removes it.
        </p>
      </section>
      <section>
        <h2>Emails</h2>
        <p>
          We email you only about your kits (sign-in links, receipts and product updates). Marketing
          emails are sent only if you ticked the optional box, and you can ask us to stop at any
          time.
        </p>
      </section>
      <section>
        <h2>Your choices: see, correct or delete your data</h2>
        <p>
          Email us from <Link href="/contact">Contact</Link> (or the Grievance Officer below) from
          the address you used. We’ll confirm the request came from you, then:
        </p>
        <ul>
          <li>send you a copy of the data we hold about you,</li>
          <li>correct anything that’s wrong, or</li>
          <li>
            delete it. We may have to keep basic sales records (what was bought, when and for how
            much) for tax and accounting; everything else is removed, and deleting your data also
            removes access to your library.
          </li>
        </ul>
        <p>You can also withdraw marketing consent at any time.</p>
      </section>
      <section>
        <h2>Security and age</h2>
        <p>
          Data travels over encrypted connections, sign-in links are stored only in scrambled form,
          and IP addresses are never stored in full. The store is not meant for children under 18.
        </p>
      </section>
      <GrievanceOfficer />
    </LegalPage>
  );
}
