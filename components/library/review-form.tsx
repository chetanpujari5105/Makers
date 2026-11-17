"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const control =
  "w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_5px_var(--primary-soft)] focus-visible:outline-none";

/* A buyer's review. The server decides whether it counts as a verified purchase. */
export function ReviewForm({ productSlug }: { productSlug: string }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          rating: form.get("rating"),
          title: form.get("title"),
          body: form.get("body"),
          useCase: form.get("useCase") || undefined,
          website: form.get("website") || undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setMessage(data.message ?? "Something went wrong. Please try again.");
      setStatus(response.ok ? "done" : "idle");
    } catch {
      setMessage("We couldn’t reach the store. Check your connection and try again.");
      setStatus("idle");
    }
    requestAnimationFrame(() => messageRef.current?.focus());
  }

  if (status === "done")
    return (
      <p ref={messageRef} tabIndex={-1} role="status" className="text-base">
        {message}
      </p>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-rating`}>Your rating</Label>
        <select
          id={`${id}-rating`}
          name="rating"
          defaultValue="5"
          className={`${control} h-12 py-0`}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} out of 5
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-title`}>Title</Label>
        <Input id={`${id}-title`} name="title" required minLength={3} maxLength={120} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-body`}>Your review</Label>
        <textarea
          id={`${id}-body`}
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className={control}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-use`}>What did you use it for? (optional)</Label>
        <Input id={`${id}-use`} name="useCase" maxLength={200} />
      </div>
      {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {message ? (
        <p ref={messageRef} tabIndex={-1} role="alert" className="text-base text-destructive">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={status === "sending"} className="self-start">
        {status === "sending" ? "Sending…" : "Send review"}
      </Button>
    </form>
  );
}
