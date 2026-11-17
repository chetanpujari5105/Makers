"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/*
 * Buyer-details dialog for FREE products: name, email, an optional
 * (unticked) marketing box and a privacy note. The server saves the lead,
 * grants access and emails a one-time link to My Library.
 */
export function ClaimDialog({
  slug,
  title,
  ctaLabel,
  describedBy,
}: {
  slug: string;
  title: string;
  ctaLabel: string;
  describedBy?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/free-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: slug,
          name: form.get("name"),
          email,
          marketingOptIn: form.get("marketing") === "on" ? true : undefined,
          website: form.get("website") || undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Something went wrong. Please try again.");
      setSentTo(email);
      setStatus("done");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong. Please try again.",
      );
      setStatus("idle");
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setStatus("idle");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" aria-describedby={describedBy}>
          {ctaLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{status === "done" ? "Check your email" : `Get ${title}`}</DialogTitle>
          <DialogDescription>
            {status === "done"
              ? `We’ve sent a link to ${sentTo}. It opens your library, where the files and setup steps are waiting.`
              : "It’s free. Tell us where to send your access link."}
          </DialogDescription>
        </DialogHeader>

        {status === "done" ? (
          <div role="status" className="flex flex-col gap-4">
            <p className="text-base">
              The link works once and expires in 15 minutes. No email? Check your spam folder, or
              request a new link from <Link href="/library">My Library</Link>.
            </p>
            <DialogFooter showCloseButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-name`}>Your name</Label>
              <Input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-email`}>Email address</Label>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                inputMode="email"
                spellCheck={false}
                autoComplete="email"
                required
                maxLength={254}
              />
            </div>
            {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${id}-website`}>Website</label>
              <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id={`${id}-optin`} name="marketing" className="mt-0.5" />
              <Label htmlFor={`${id}-optin`} className="leading-snug font-normal">
                Send me occasional emails about new resources (optional)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              We use your email to send your access link and receipts. See our{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>
            {error ? (
              <p ref={errorRef} tabIndex={-1} role="alert" className="text-base text-destructive">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="submit"
                size="lg"
                loading={status === "sending"}
                className="w-full sm:w-auto"
              >
                Send my access link
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
