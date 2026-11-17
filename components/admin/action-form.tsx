"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/admin/guard";
import { cn } from "@/lib/utils";

/*
 * Runs an owner server action without resetting the form, so a refused save
 * keeps everything the owner typed. Shows progress, then the result in words.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  variant = "default",
  className,
  confirm,
}: {
  action: (form: FormData) => Promise<ActionResult & { problems?: string[] }>;
  children?: ReactNode;
  submitLabel: string;
  variant?: "default" | "outline";
  className?: string;
  /** Text of a tick-box the owner must tick first, for actions that email people or remove things. */
  confirm?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<(ActionResult & { problems?: string[] }) | null>(null);

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          const outcome = await action(form);
          setResult(outcome);
          if (outcome.ok && outcome.href) router.push(outcome.href);
          else if (outcome.ok) router.refresh();
        });
      }}
    >
      {children}
      {confirm ? (
        <label className="flex items-start gap-3 text-base">
          <input type="checkbox" required className="mt-1 size-5" />
          <span>{confirm}</span>
        </label>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant={variant} disabled={pending}>
          {pending ? "Working…" : submitLabel}
        </Button>
        {result ? (
          <p
            role={result.ok ? "status" : "alert"}
            className={cn("text-base", result.ok ? "text-foreground" : "text-destructive")}
          >
            {result.message}
          </p>
        ) : null}
      </div>
      {result?.problems?.length ? (
        <ul className="list-disc pl-6 text-base text-destructive">
          {result.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
