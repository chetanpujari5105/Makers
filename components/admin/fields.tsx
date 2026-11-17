import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* Plain labelled form fields for the owner admin (server-rendered, no state). */

const control =
  "w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_5px_var(--primary-soft)] focus-visible:outline-none";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-medium">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}

type Common = {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  required?: boolean;
};

export function TextField({
  name,
  label,
  hint,
  defaultValue,
  required,
  type = "text",
  ...rest
}: Common & {
  type?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  placeholder?: string;
}) {
  const id = `f-${name}`;
  return (
    <Field id={id} label={label} hint={hint}>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(control, "h-12 py-0")}
        {...rest}
      />
    </Field>
  );
}

export function TextArea({
  name,
  label,
  hint,
  defaultValue,
  required,
  rows = 4,
  mono,
}: Common & {
  rows?: number;
  mono?: boolean;
}) {
  const id = `f-${name}`;
  return (
    <Field id={id} label={label} hint={hint}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(control, mono && "font-mono text-sm")}
      />
    </Field>
  );
}

export function SelectField({
  name,
  label,
  hint,
  defaultValue,
  options,
}: Common & {
  options: readonly { value: string; label: string }[];
}) {
  const id = `f-${name}`;
  return (
    <Field id={id} label={label} hint={hint}>
      <select id={id} name={name} defaultValue={defaultValue} className={cn(control, "h-12 py-0")}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-base">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5" />
      {label}
    </label>
  );
}
