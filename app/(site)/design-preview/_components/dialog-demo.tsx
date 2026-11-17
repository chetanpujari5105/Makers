"use client";

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
 * Design-preview only. Shows how a form looks inside the Dialog component.
 * It saves nothing and calls no API — the real buyer-details dialog is built
 * in Phase 2 with server-side Zod validation.
 */
export function DialogDemo() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter an email address like name@example.com.");
      emailRef.current?.focus();
      return;
    }
    setEmailError(null);
    setDone(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setDone(false);
          setEmailError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Open example dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Example dialog</DialogTitle>
          <DialogDescription>
            Preview only — nothing you type here is saved or sent anywhere.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div role="status" className="flex flex-col gap-4">
            <p className="text-base">
              This is how a success message looks. In the real store, this is where access would be
              confirmed — but this preview saved nothing.
            </p>
            <DialogFooter showCloseButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-name`}>Your name</Label>
              <Input id={`${id}-name`} name="name" autoComplete="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-email`}>Email address</Label>
              <Input
                id={`${id}-email`}
                name="email"
                ref={emailRef}
                type="email"
                inputMode="email"
                spellCheck={false}
                autoComplete="email"
                required
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? `${id}-email-error` : undefined}
              />
              {emailError ? (
                <p id={`${id}-email-error`} role="alert" className="text-sm text-destructive">
                  {emailError}
                </p>
              ) : null}
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id={`${id}-optin`} name="marketing" className="mt-0.5" />
              <Label htmlFor={`${id}-optin`} className="leading-snug font-normal">
                Send me occasional emails about new resources (optional)
              </Label>
            </div>
            <DialogFooter>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Continue
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
