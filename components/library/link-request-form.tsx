"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* "Email me a sign-in link" — the reply is the same whether or not the email is known. */
export function LinkRequestForm() {
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
      const response = await fetch("/api/library/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
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

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-email`}>Email address</Label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          maxLength={254}
        />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" size="lg" loading={status === "sending"} className="self-start">
        Email me a sign-in link
      </Button>
      {message ? (
        <p ref={messageRef} tabIndex={-1} role="status" className="text-base">
          {message}
        </p>
      ) : null}
    </form>
  );
}
