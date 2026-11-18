import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { PasswordInput } from "@/components/rare-ui/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Owner sign-in", robots: { index: false } };

const errors: Record<string, string> = {
  invalid: "That email and password don’t match.",
  busy: "Too many tries. Please wait 15 minutes.",
  unavailable: "Owner sign-in isn’t set up on this site yet.",
};

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <Container size="prose" className="flex flex-col gap-6 py-section">
      <h1 className="text-h1">Owner sign-in</h1>
      <Suspense fallback={null}>
        <ErrorNotice searchParams={searchParams} />
      </Suspense>
      <form action="/api/admin/login" method="post" className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="admin-password">Password</Label>
          <PasswordInput
            id="admin-password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" size="lg" className="self-start">
          Sign in
        </Button>
      </form>
    </Container>
  );
}

async function ErrorNotice({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? errors[error] : undefined;
  return message ? (
    <p role="alert" className="rounded-lg border border-border bg-card p-4 text-base">
      {message}
    </p>
  ) : null;
}
