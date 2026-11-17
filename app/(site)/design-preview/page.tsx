import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRightIcon, DownloadIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DialogDemo } from "./_components/dialog-demo";

/*
 * Internal design reference for whoever builds the store next.
 * - Not in the spec's route list (logged in docs/DECISIONS.md).
 * - Hidden from search engines, and returns 404 on the Vercel production
 *   deployment. It stays visible locally and on preview deployments.
 */
export const metadata: Metadata = {
  title: "Design preview",
  robots: { index: false, follow: false },
};

const colours = [
  { name: "background", hex: "#f9fbfe", use: "Page background", className: "bg-background" },
  { name: "card", hex: "#ffffff", use: "Cards, dialogs, inputs", className: "bg-card" },
  { name: "muted", hex: "#f1f4f7", use: "Quiet surfaces, hovers", className: "bg-muted" },
  { name: "border", hex: "#dfe3e8", use: "Hairlines and dividers", className: "bg-border" },
  { name: "input", hex: "#878d94", use: "Form control borders (3.4:1)", className: "bg-input" },
  { name: "foreground", hex: "#11161f", use: "Body text (17.5:1)", className: "bg-foreground" },
  {
    name: "muted-foreground",
    hex: "#5e646c",
    use: "Secondary text (5.8:1)",
    className: "bg-muted-foreground",
  },
  { name: "primary", hex: "#2049a1", use: "Accent — temporary", className: "bg-primary" },
  { name: "primary-hover", hex: "#143888", use: "Accent hover", className: "bg-primary-hover" },
  { name: "primary-soft", hex: "#e7f1ff", use: "Accent tint", className: "bg-primary-soft" },
  { name: "success", hex: "#136239", use: "Positive status", className: "bg-success" },
  { name: "warning", hex: "#804d0c", use: "Needs attention", className: "bg-warning" },
  { name: "destructive", hex: "#b7191c", use: "Errors", className: "bg-destructive" },
];

const typeScale = [
  { token: "text-display", size: "44 → 88px", sample: "Make progress." },
  { token: "text-h1", size: "36 → 60px", sample: "Page title" },
  { token: "text-h2", size: "28 → 42px", sample: "Section heading" },
  { token: "text-h3", size: "22 → 28px", sample: "Card or sub-section heading" },
  {
    token: "text-lead",
    size: "18 → 21px",
    sample: "A lead paragraph introduces a page in a sentence or two.",
  },
  {
    token: "text-body",
    size: "16 → 17px",
    sample: "Body text is never smaller than 16px and stays at a comfortable reading width.",
  },
  {
    token: "text-sm",
    size: "15px",
    sample: "Labels and helper text — the smallest size we use.",
  },
];

const spacing = [1, 2, 3, 4, 6, 8, 12, 16];
const radii = [
  { token: "rounded-lg", px: "12px", use: "Inputs" },
  { token: "rounded-xl", px: "16px", use: "Cards" },
  { token: "rounded-2xl", px: "20px", use: "Dialogs" },
  { token: "rounded-full", px: "pill", use: "Buttons, badges" },
];
const shadows = [
  { token: "shadow-card", use: "Resting card" },
  { token: "shadow-raised", use: "Hovered card" },
  { token: "shadow-dialog", use: "Dialogs, menus" },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex scroll-mt-24 flex-col gap-8 border-t border-border py-16"
    >
      <div className="flex max-w-prose flex-col gap-2">
        <h2 id={id} className="text-h2">
          {title}
        </h2>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function DesignPreviewPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <Container className="pt-14 pb-section">
      <div className="flex max-w-prose flex-col gap-4 pb-12">
        <h1 className="text-h1">Design preview</h1>
        <p className="text-lead text-muted-foreground">
          The building blocks of the store: colours, type, spacing and the five core components.
          This page is for building the site. It is hidden from search engines and from the live
          store.
        </p>
      </div>

      <Section
        id="colour"
        title="Colour"
        description="Neutral surfaces with one accent. The accent is temporary until the brand colour is decided. Every text colour meets WCAG AA contrast."
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {colours.map((colour) => (
            <li key={colour.name} className="flex flex-col gap-2">
              <span
                aria-hidden="true"
                className={`h-16 rounded-lg shadow-[inset_0_0_0_1px_oklch(0.2_0.02_262/0.08)] ${colour.className}`}
              />
              <span className="text-sm font-medium">{colour.name}</span>
              <span className="text-sm text-muted-foreground">
                <span className="tabular font-mono">{colour.hex}</span> · {colour.use}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="type"
        title="Typography"
        description="Fraunces for headlines, Geist for everything you read. Sizes grow smoothly from phone to desktop."
      >
        <ul className="flex flex-col">
          {typeScale.map((item) => (
            <li
              key={item.token}
              className="grid gap-2 border-t border-border py-5 first:border-t-0 md:grid-cols-[12rem_1fr] md:items-baseline"
            >
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{item.token}</span> · {item.size}
              </span>
              <span
                className={`${item.token} ${item.token.startsWith("text-h") || item.token === "text-display" ? "font-display" : ""}`}
              >
                {item.sample}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="space"
        title="Spacing, radius and shadow"
        description="A 4px spacing base. Cards use a soft shadow instead of a border. Buttons and badges are pill-shaped."
      >
        <div className="grid gap-12 lg:grid-cols-3">
          <ul className="flex flex-col gap-3" aria-label="Spacing scale">
            {spacing.map((step) => (
              <li key={step} className="flex items-center gap-4 text-sm">
                <span className="w-16 text-muted-foreground">
                  {step} · {step * 4}px
                </span>
                <span
                  aria-hidden="true"
                  className="h-3 rounded-sm bg-primary"
                  style={{ width: `${step * 4}px` }}
                />
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-2 gap-4" aria-label="Radius scale">
            {radii.map((radius) => (
              <li key={radius.token} className="flex flex-col gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className={`h-16 border border-input bg-card ${radius.token}`}
                />
                <span className="font-medium">{radius.token}</span>
                <span className="text-muted-foreground">
                  {radius.px} · {radius.use}
                </span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-5" aria-label="Shadows">
            {shadows.map((shadow) => (
              <li key={shadow.token} className={`rounded-xl bg-card p-5 text-sm ${shadow.token}`}>
                <span className="font-medium">{shadow.token}</span>
                <span className="text-muted-foreground"> · {shadow.use}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        id="buttons"
        title="Button"
        description="44px tall by default and 48px for the main product action. Press feedback is a gentle scale, removed when reduced motion is on."
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Remove</Button>
            <Button variant="link">Text link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small · 40px</Button>
            <Button>Default · 44px</Button>
            <Button size="lg">
              Large · 48px
              <ArrowRightIcon aria-hidden="true" />
            </Button>
            <Button size="icon" variant="outline" aria-label="Download example">
              <DownloadIcon aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button loading>Saving…</Button>
            <Button variant="outline" loading>
              Loading…
            </Button>
          </div>
        </div>
      </Section>

      <Section
        id="inputs"
        title="Input"
        description="48px tall with 16px text, so phones don’t zoom in. Errors are written in plain words and linked to the field for screen readers."
      >
        <div className="grid max-w-3xl gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="preview-name">Your name</Label>
            <Input id="preview-name" placeholder="e.g. Asha Patel" autoComplete="off" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="preview-email-error">Email address</Label>
            <Input
              id="preview-email-error"
              type="email"
              defaultValue="asha@"
              aria-invalid="true"
              aria-describedby="preview-email-error-text"
              autoComplete="off"
            />
            <p id="preview-email-error-text" className="text-sm text-destructive">
              Please enter an email address like name@example.com.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="preview-disabled">Disabled field</Label>
            <Input id="preview-disabled" disabled defaultValue="Can’t be changed" />
          </div>
          <div className="flex items-start gap-3 self-center">
            <Checkbox id="preview-optin" className="mt-0.5" />
            <Label htmlFor="preview-optin" className="leading-snug font-normal">
              Optional checkbox — always unchecked by default
            </Label>
          </div>
        </div>
      </Section>

      <Section
        id="badges"
        title="Badge"
        description="Short, readable labels at 14px. Status colours always come with words, never colour alone. Never used for fake discounts or scarcity."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Beginner</Badge>
          <Badge variant="accent">Notion template</Badge>
          <Badge variant="outline">10 min setup</Badge>
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">Draft</Badge>
          <Badge variant="destructive">Archived</Badge>
        </div>
      </Section>

      <Section
        id="cards"
        title="Card"
        description="White surface with a soft shadow. Cards that are links lift slightly on hover and show a focus ring when reached with the keyboard."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Static card</CardTitle>
              <CardDescription>For grouping related information.</CardDescription>
            </CardHeader>
            <CardContent>
              Sample text. Real product cards (cover, title, level, type and price) are built in
              Phase 1 on top of this component.
            </CardContent>
          </Card>
          <Card interactive>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge>Beginner</Badge>
                <Badge variant="accent">Workbook</Badge>
              </div>
              <CardTitle>
                <a
                  href="#cards"
                  className="text-foreground no-underline after:absolute after:inset-0 after:content-['']"
                >
                  Interactive card
                </a>
              </CardTitle>
              <CardDescription>The whole card is one link.</CardDescription>
            </CardHeader>
            <CardFooter>
              <span className="text-sm text-muted-foreground">Sample content</span>
            </CardFooter>
          </Card>
          <Card className="bg-primary-soft shadow-none">
            <CardHeader>
              <CardTitle>Tinted card</CardTitle>
              <CardDescription className="text-primary-soft-foreground">
                For a calm highlight, such as a free-resource note.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      <Section
        id="dialog"
        title="Dialog"
        description="Fits small screens, scrolls inside itself so the main button is always reachable, closes with Escape or the 44px close button, and returns focus to the button that opened it."
      >
        <div>
          <DialogDemo />
        </div>
      </Section>
    </Container>
  );
}
