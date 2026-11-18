"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CircleAlertIcon } from "lucide-react";

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
import { brand } from "@/lib/brand";
import { formatInr } from "@/lib/money";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

/** Razorpay's Checkout script, loaded only when someone starts a payment. */
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error("We couldn’t load the payment window. Check your connection and try again."),
      );
    document.body.appendChild(script);
  });
}

/*
 * Buyer-details dialog: name, email, an optional (unticked) marketing box and
 * a privacy note. The server always saves the lead first.
 * - Free (no priceInr): the server grants access and emails a one-time link.
 * - Paid: the server creates the order from the database price, then Razorpay
 *   Checkout opens. After paying, the server confirms the payment before the
 *   success page; the library link arrives by email.
 */
export function ClaimDialog({
  slug,
  title,
  ctaLabel,
  describedBy,
  priceInr = null,
  cover,
}: {
  slug: string;
  title: string;
  ctaLabel: string;
  describedBy?: string;
  priceInr?: number | null;
  /** Small cover shown at the top, so the buyer sees what they're getting. */
  cover?: React.ReactNode;
}) {
  const id = useId();
  const router = useRouter();
  const paid = priceInr !== null;
  // One key per attempt, so a double click or a retry reuses the same order.
  const orderKey = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "confirming" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");
  // Kept so a cancelled payment reopens the form already filled in.
  const [buyer, setBuyer] = useState({ name: "", email: "", coupon: "" });
  const errorRef = useRef<HTMLParagraphElement>(null);
  // The dialog shows the price in the sans font. Fetch its tiny ₹ file (under 1 KB) now,
  // so opening the dialog doesn't swap the glyph and re-lay-out the form.
  useEffect(() => {
    void document.fonts?.load('1em "Schibsted Grotesk rupee"', "₹").catch(() => {});
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    setBuyer({
      name: String(form.get("name") ?? ""),
      email,
      coupon: String(form.get("coupon") ?? ""),
    });
    setStatus("sending");
    setError(null);
    try {
      if (paid) return await startPayment(form, email);
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

  function showError(message: string) {
    setOpen(true);
    setStatus("idle");
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  async function startPayment(form: FormData, email: string) {
    orderKey.current ??= crypto.randomUUID();
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: slug,
        name: form.get("name"),
        email,
        marketingOptIn: form.get("marketing") === "on" ? true : undefined,
        website: form.get("website") || undefined,
        idempotencyKey: orderKey.current,
        couponCode: String(form.get("coupon") ?? "").trim() || undefined,
      }),
    });
    const order = (await response.json().catch(() => ({}))) as {
      message?: string;
      orderId?: string;
      keyId?: string;
      razorpayOrderId?: string;
    };
    if (!response.ok) throw new Error(order.message ?? "Something went wrong. Please try again.");
    await loadCheckout();
    // Close this dialog first: its focus trap would block Razorpay's window.
    setOpen(false);
    new window.Razorpay!({
      key: order.keyId,
      order_id: order.razorpayOrderId,
      name: brand.name,
      description: title,
      prefill: { name: String(form.get("name") ?? ""), email },
      handler: (result: RazorpayResponse) => void confirmPayment(result, order.orderId!),
      modal: {
        ondismiss: () => showError("Payment cancelled — nothing was charged. You can try again."),
      },
    }).open();
  }

  async function confirmPayment(result: RazorpayResponse, orderId: string) {
    setOpen(true);
    setStatus("confirming");
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    }).catch(() => null);
    if (response?.ok) {
      router.push(`/checkout/success?order=${orderId}`);
      return;
    }
    showError(
      "We couldn’t confirm the payment yet. If money left your account, you’ll get an email as soon as it’s confirmed. You don’t need to pay again.",
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setStatus("idle");
          setError(null);
          orderKey.current = null;
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
          {cover ? (
            <div
              aria-hidden="true"
              className={
                status === "done"
                  ? "w-20 animate-in duration-250 ease-out fade-in-0 zoom-in-90"
                  : "w-20"
              }
            >
              {cover}
            </div>
          ) : null}
          <DialogTitle>{status === "done" ? "Check your email" : `Get ${title}`}</DialogTitle>
          <DialogDescription>
            {status === "done"
              ? `We’ve sent a link to ${sentTo}. It opens your library, where the files and setup steps are waiting.`
              : paid
                ? `${formatInr(priceInr)}. Pay securely with Razorpay; your library link arrives by email. Test mode — no real money is taken.`
                : "It’s free. Tell us where to send your access link."}
          </DialogDescription>
        </DialogHeader>

        {status === "confirming" ? (
          <p role="status" className="text-base">
            Confirming your payment with Razorpay…
          </p>
        ) : status === "done" ? (
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
              <Input
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                defaultValue={buyer.name}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-email`}>Email address</Label>
              <Input
                id={`${id}-email`}
                name="email"
                defaultValue={buyer.email}
                type="email"
                inputMode="email"
                spellCheck={false}
                autoComplete="email"
                required
                maxLength={254}
              />
            </div>
            {paid ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-coupon`}>Coupon code (optional)</Label>
                <Input
                  id={`${id}-coupon`}
                  name="coupon"
                  defaultValue={buyer.coupon}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={40}
                  aria-describedby={`${id}-coupon-hint`}
                  // A different coupon is a different order, so the next submit starts a new one.
                  onChange={() => (orderKey.current = null)}
                />
                <p id={`${id}-coupon-hint`} className="text-sm text-muted-foreground">
                  The discounted price is shown in the payment window.
                </p>
              </div>
            ) : null}
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
              <p
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="flex items-start gap-2 text-base text-destructive"
              >
                <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
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
                {paid ? `Continue to payment · ${formatInr(priceInr)}` : "Send my access link"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
