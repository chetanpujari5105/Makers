import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { z } from "zod";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getOrderSummary } from "@/lib/payments/orders";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false },
};

/*
 * Shown after the server has checked the payment. It only reports the
 * order's status from the database; it grants nothing and shows no email
 * or payment details, so sharing or guessing the address reveals nothing.
 */
export default function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <Container size="prose" className="flex flex-col items-start gap-6 py-section">
      <Suspense
        fallback={<p className="text-lead text-muted-foreground">Checking your payment…</p>}
      >
        <OrderStatus searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function OrderStatus({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  await connection();
  const id = z.uuid().safeParse((await searchParams).order);
  const order = id.success ? await getOrderSummary(id.data) : null;

  if (order?.status === "paid") {
    return (
      <>
        <h1 className="text-h1">Payment confirmed</h1>
        <p className="text-lead">
          Thank you — <strong>{order.title}</strong> is yours. We’ve emailed your receipt with a
          one-time link to My Library, where your files and setup steps are waiting.
        </p>
        <p className="text-base text-muted-foreground">
          No email after a few minutes? Check your spam folder, or ask for a new link on the My
          Library page.
        </p>
        <Button asChild size="lg">
          <Link href="/library">Go to My Library</Link>
        </Button>
      </>
    );
  }
  if (order?.status === "created") {
    return (
      <>
        <h1 className="text-h1">Confirming your payment</h1>
        <p className="text-lead">
          Razorpay hasn’t confirmed this payment yet. This usually takes a minute. You’ll get an
          email as soon as it’s confirmed — you don’t need to pay again.
        </p>
        <Button asChild size="lg" variant="outline">
          <Link href={`/checkout/success?order=${id.data}`}>Check again</Link>
        </Button>
      </>
    );
  }
  return (
    <>
      <h1 className="text-h1">We couldn’t find a confirmed payment</h1>
      <p className="text-lead">
        Nothing here has been confirmed. If money left your account, you’ll receive an email once
        Razorpay confirms it, or you can contact us.
      </p>
      <Button asChild size="lg" variant="outline">
        <Link href="/library">Go to My Library</Link>
      </Button>
    </>
  );
}
