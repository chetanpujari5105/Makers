"use client";

/*
 * Password field with an animated show/hide eye — adapted from Rare UI (https://rareui.com).
 * Copyright (c) 2026 Swami Malode. MIT + Commons Clause + Attribution; see ./README.md.
 * Changes: direction A tokens and focus ring, strength meter removed (sign-in
 * only), the field keeps normal form behaviour (name, required) for a plain POST.
 */
import { LazyMotion, domAnimation, m, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useId, useRef, useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

const LID_OPEN = { top: 5.5, bottom: 18.5 };
const LID_CLOSED = { top: 17, bottom: 17 };
const LASHES = ["M4.4 14.6 3 16.4", "M9 16.6 8.5 19", "M15 16.6l.5 2.4", "M19.6 14.6l1.4 1.8"];

const INSTANT: Transition = { duration: 0 };
const LID: Transition = { duration: 0.15, ease: [0.23, 1, 0.32, 1] };
const SWAP: Transition = { duration: 0.15, ease: [0.23, 1, 0.32, 1] };
const BLINK: Transition = {
  duration: 1.1,
  times: [0, 0.5, 0.5, 1],
  repeat: Infinity,
  ease: "linear",
};

const corner = (y: number) => 12 + (y - 12) * 0.64;
const eyePath = ({ top, bottom }: { top: number; bottom: number }) =>
  `M2 12C4 ${corner(top)} 7.5 ${top} 12 ${top}C16.5 ${top} 20 ${corner(top)} 22 12C20 ${corner(bottom)} 16.5 ${bottom} 12 ${bottom}C7.5 ${bottom} 4 ${corner(bottom)} 2 12Z`;

function Glyph({ char, visible, reduced }: { char: string; visible: boolean; reduced: boolean }) {
  const transition = reduced ? INSTANT : SWAP;
  return (
    <span className="relative grid h-full w-[1ch] shrink-0 place-items-center">
      <m.span
        initial={false}
        animate={{ opacity: visible ? 0 : 1 }}
        transition={transition}
        className="absolute size-[0.36em] rounded-full bg-current"
      />
      <m.span
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={transition}
        className="whitespace-pre"
      >
        {char}
      </m.span>
    </span>
  );
}

function Eye({ open, reduced }: { open: boolean; reduced: boolean }) {
  const clipId = useId();
  const lid = { d: eyePath(open ? LID_OPEN : LID_CLOSED) };
  const transition = reduced ? INSTANT : LID;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 overflow-visible"
    >
      <clipPath id={clipId}>
        <m.path initial={false} animate={lid} transition={transition} />
      </clipPath>
      <circle cx={12} cy={12} r={3} clipPath={`url(#${clipId})`} />
      <m.path initial={false} animate={lid} transition={transition} />
      {LASHES.map((d) => (
        <m.path
          key={d}
          d={d}
          initial={false}
          animate={{ pathLength: open ? 0 : 1, opacity: open ? 0 : 1 }}
          transition={
            reduced ? INSTANT : { duration: 0.15, delay: open ? 0 : 0.08, ease: [0.23, 1, 0.32, 1] }
          }
        />
      ))}
    </svg>
  );
}

export type PasswordInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "onChange" | "size"
>;

export function PasswordInput({
  className,
  placeholder,
  disabled,
  autoComplete = "current-password",
  onFocus,
  onBlur,
  ...props
}: PasswordInputProps) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0, scroll: 0 });
  const input = useRef<HTMLInputElement>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion() ?? false;
  const chars = Array.from(password);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const read = () => {
    const el = input.current;
    if (!el) return;
    // selection offsets count UTF-16 units, the glyphs count code points
    const start = Array.from(el.value.slice(0, el.selectionStart ?? 0)).length;
    const end = Array.from(el.value.slice(0, el.selectionEnd ?? 0)).length;
    const scroll = el.scrollLeft;
    setSelection((c) =>
      c.start === start && c.end === end && c.scroll === scroll ? c : { start, end, scroll },
    );
  };

  // read now so the caret moves with the keystroke, then again once scrollLeft settles
  const sync = () => {
    read();
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(read);
  };

  const toggle = () => {
    const el = input.current;
    const start = el?.selectionStart ?? null;
    const end = el?.selectionEnd ?? null;
    setVisible(!visible);
    // switching the input type drops the selection in some browsers
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (el && start !== null && end !== null && document.activeElement === el)
        el.setSelectionRange(start, end);
      read();
    });
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        data-slot="password-input"
        className={cn(
          "relative flex h-12 w-full items-center rounded-lg border border-input bg-card text-foreground transition-[border-color] duration-150 ease-out",
          "focus-within:border-ring focus-within:shadow-[0_0_0_1px_var(--ring),0_0_0_5px_var(--primary-soft)] pointer-fine:hover:not-focus-within:border-foreground/50",
          disabled && "pointer-events-none opacity-55",
          className,
        )}
      >
        <div className="relative h-full min-w-0 flex-1">
          <input
            ref={input}
            {...props}
            type={visible ? "text" : "password"}
            value={password}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) => {
              setPassword(event.target.value);
              sync();
            }}
            onSelect={sync}
            onScroll={sync}
            onFocus={(event) => {
              setFocused(true);
              sync();
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            // The real input stays for typing, autofill and the form; the visible text is drawn below.
            className="absolute inset-0 size-full bg-transparent pr-2 pl-4 font-mono text-base text-transparent caret-transparent outline-none [-webkit-text-fill-color:transparent] selection:bg-transparent placeholder:text-transparent autofill:shadow-[inset_0_0_0_100px_var(--card)] focus-visible:outline-none [&::-ms-reveal]:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-2 left-4 overflow-hidden font-mono text-base"
          >
            {!password && placeholder && (
              <span className="absolute inset-y-0 left-0 flex items-center font-sans text-muted-foreground">
                {placeholder}
              </span>
            )}
            <div
              className="relative flex h-full items-center"
              style={{ transform: `translateX(${-selection.scroll}px)` }}
            >
              {focused && selection.end > selection.start && (
                <span
                  className="absolute top-1/2 h-6 -translate-y-1/2 rounded bg-primary/25"
                  style={{
                    left: `${selection.start}ch`,
                    width: `${selection.end - selection.start}ch`,
                  }}
                />
              )}
              {chars.map((char, index) => (
                <Glyph key={index} char={char} visible={visible} reduced={reduced} />
              ))}
              {focused && selection.start === selection.end && (
                <m.span
                  // remounting restarts the blink, so the caret stays solid while typing
                  key={`${selection.end}:${chars.length}`}
                  animate={reduced ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
                  transition={reduced ? INSTANT : BLINK}
                  style={{ left: `${selection.end}ch` }}
                  className="absolute top-1/2 -ml-px h-5 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
                />
              )}
            </div>
          </div>
        </div>
        <EyeToggle visible={visible} reduced={reduced} disabled={disabled} onToggle={toggle} />
      </div>
    </LazyMotion>
  );
}

function EyeToggle({
  visible,
  reduced,
  disabled,
  onToggle,
}: {
  visible: boolean;
  reduced: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Show password"
      aria-pressed={visible}
      disabled={disabled}
      onPointerDown={(event) => event.preventDefault()}
      onClick={onToggle}
      className="mr-1 grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors pointer-fine:hover:text-foreground"
    >
      <Eye open={visible} reduced={reduced} />
    </button>
  );
}
