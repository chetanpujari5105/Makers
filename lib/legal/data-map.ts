/*
 * Every piece of personal data the store handles. The privacy page renders
 * this list, and docs/DATA_MAP.md must name every item (a test checks both),
 * so the two can't drift apart. Update this file whenever a form, table or
 * service changes.
 *
 * Retention: there is NO automatic deletion job yet. Say "kept until deleted"
 * unless something really expires on its own.
 */

export type Processor = {
  name: string;
  role: string;
  /** Where the data sits, as configured for this store. */
  region: string;
};

export const processors: readonly Processor[] = [
  {
    name: "Vercel",
    role: "Hosts the website and runs its server code. Sees each visit's IP address and browser details in short-lived request logs.",
    region: "Server code runs in Singapore (sin1)",
  },
  {
    name: "Neon",
    role: "The database that stores the records listed below.",
    region: "Singapore",
  },
  {
    name: "Razorpay",
    role: "Takes payments. Card, UPI and bank details are entered on Razorpay's own form and never reach this store.",
    region: "India",
  },
  {
    name: "Resend",
    role: "Sends the sign-in and purchase emails. Keeps a log of emails sent (address, subject, delivery status).",
    region: "Set in the Resend account (owner to confirm)",
  },
  {
    name: "Upstash",
    role: "Counts recent attempts to stop abuse. Receives only a scrambled (salted hash) form of the IP address or email; entries expire within an hour.",
    region: "Singapore",
  },
  {
    name: "Backblaze B2",
    role: "Stores the product files. Holds no customer records; downloads use short-lived signed links.",
    region: "Set in the Backblaze account (owner to confirm)",
  },
];

export type DataItem = {
  data: string;
  when: string;
  storedIn: string;
  processors: readonly string[];
  purpose: string;
  retention: string;
};

const untilDeleted = "Kept until deleted (no automatic deletion yet; owner to decide a period).";

export const dataItems: readonly DataItem[] = [
  {
    data: "Name and email address",
    when: "You fill in the form before a free download or a purchase.",
    storedIn: "Database tables: leads and customers",
    processors: ["Vercel", "Neon"],
    purpose: "To give you access, send your sign-in link and receipt, and answer questions.",
    retention: untilDeleted,
  },
  {
    data: "Marketing choice and the time you made it",
    when: "Only if you tick the optional box (it is never ticked for you).",
    storedIn: "Database table: leads",
    processors: ["Neon"],
    purpose: "To send occasional emails about new kits, only if you asked for them.",
    retention: untilDeleted,
  },
  {
    data: "IP address (scrambled, never stored in full)",
    when: "You submit a form or download a file.",
    storedIn:
      "Database tables: leads, download_logs (as a salted hash); Upstash (hashed counter key)",
    processors: ["Vercel", "Neon", "Upstash"],
    purpose: "To spot and stop abuse, such as automated form spam.",
    retention: "Hash in the database: until deleted. Upstash counters: expire within one hour.",
  },
  {
    data: "Orders: what you bought, price, status, Razorpay order and payment IDs",
    when: "You start or finish a purchase.",
    storedIn: "Database tables: orders, order_items",
    processors: ["Neon", "Razorpay"],
    purpose: "To confirm payment, give access, send receipts and keep sales records.",
    retention:
      "Kept until deleted; sales records may need to be kept for tax purposes (owner/CA to confirm the period).",
  },
  {
    data: "Payment details (card, UPI, bank, phone number if you enter it)",
    when: "You pay on Razorpay's checkout form.",
    storedIn: "Razorpay only; never this store's database",
    processors: ["Razorpay"],
    purpose: "To take the payment.",
    retention: "Set by Razorpay.",
  },
  {
    data: "Payment events from Razorpay (may include email, phone, payment method)",
    when: "Razorpay notifies the store about a payment (webhook; not switched on yet).",
    storedIn: "Database table: webhook_events",
    processors: ["Neon", "Razorpay"],
    purpose: "To confirm payments reliably and avoid handling the same event twice.",
    retention: untilDeleted,
  },
  {
    data: "Access and downloads: what you can download, how many times, when, browser type",
    when: "You get a kit and download its files.",
    storedIn: "Database tables: entitlements, download_logs",
    processors: ["Neon", "Backblaze B2"],
    purpose: "To give access, enforce download limits and help if a download fails.",
    retention: untilDeleted,
  },
  {
    data: "Sign-in links (your email and a scrambled copy of the link's code)",
    when: "You ask for a link to My Library.",
    storedIn: "Database table: magic_tokens",
    processors: ["Neon", "Resend"],
    purpose: "To let you sign in without a password.",
    retention: "Links stop working after 15 minutes or one use; the row is kept until deleted.",
  },
  {
    data: "Sign-in cookie (contains your email, signed so it can't be changed)",
    when: "You open a sign-in link.",
    storedIn: "Your browser (cookie)",
    processors: [],
    purpose: "To keep you signed in to My Library.",
    retention: "30 days, or until you sign out.",
  },
  {
    data: "Emails sent to you",
    when: "Sign-in links, purchase receipts and product update notices.",
    storedIn: "Resend's email log",
    processors: ["Resend"],
    purpose: "To deliver the emails and check they arrived.",
    retention: "Set by Resend's plan (owner to confirm).",
  },
  {
    data: "Reviews (rating, title, text, how you used the kit)",
    when: "You choose to write a review.",
    storedIn: "Database table: reviews",
    processors: ["Neon"],
    purpose: "To show approved reviews on product pages (without your name or email).",
    retention: untilDeleted,
  },
];
