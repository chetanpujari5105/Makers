"use client";

/*
 * Scroll progress pill — adapted from Rare UI (https://rareui.com).
 * Copyright (c) 2026 Swami Malode. MIT + Commons Clause + Attribution; see ./README.md.
 * Changes: direction A tokens, no blur, ease-out under 300 ms instead of springs,
 * focus moves into the list when it opens and back to the pill when it closes.
 * Motion is transform and opacity only: the ring is two rotating half-rings, and the
 * pill and the list fade and scale instead of animating width and height.
 */
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ScrollProgressSection = { id: string; label: string };

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const PANEL = { duration: 0.25, ease: EASE_OUT } as const;
const FADE = { duration: 0.15, ease: EASE_OUT } as const;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Reading progress as a ring, drawn by rotating two half-rings (transform only, no repaint). */
function ProgressRing({ progress }: { progress: MotionValue<number> }) {
  const firstHalf = useTransform(progress, [0, 0.5], [0, 180], { clamp: true });
  const secondHalf = useTransform(progress, [0.5, 1], [0, 180], { clamp: true });
  const half = "absolute inset-0 rounded-full border-[2.5px] border-primary will-change-transform";
  return (
    <span
      aria-hidden="true"
      className="relative size-5 shrink-0 rounded-full border-[2.5px] border-foreground/15"
    >
      <span className="absolute -inset-[2.5px] [clip-path:inset(0_0_0_50%)]">
        <m.span
          className={cn(half, "[clip-path:inset(0_50%_0_0)]")}
          style={{ rotate: firstHalf }}
        />
      </span>
      <span className="absolute -inset-[2.5px] [clip-path:inset(0_50%_0_0)]">
        <m.span
          className={cn(half, "[clip-path:inset(0_0_0_50%)]")}
          style={{ rotate: secondHalf }}
        />
      </span>
    </span>
  );
}

export type ScrollProgressProps = ComponentProps<"div"> & {
  sections: ScrollProgressSection[];
  /** How far below the top of the screen a heading counts as "current". */
  offset?: number;
};

export function ScrollProgress({
  className,
  sections,
  offset = 120,
  ...props
}: ScrollProgressProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const [activeId, setActiveId] = useState(sections[0]?.id);
  const [open, setOpen] = useState(false);
  const scrollLock = useRef(false);
  const scrollLockTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const update = () => {
      if (scrollLock.current) return;
      const active = sections.findLast(({ id }) => {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        return top !== undefined && top <= offset;
      });
      setActiveId(active?.id ?? sections[0]?.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections, offset]);

  const label = sections.find((s) => s.id === activeId)?.label;

  const labelRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reopenFocus = useRef(false);
  // The widest label, so the pill keeps one width while labels crossfade.
  const [labelWidth, setLabelWidth] = useState<number>();

  useIsoLayoutEffect(() => {
    const measure = () => {
      if (labelRef.current) setLabelWidth(labelRef.current.offsetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (labelRef.current) ro.observe(labelRef.current);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      reopenFocus.current = true;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(scrollLockTimer.current), []);

  const selectSection = (id: string) => {
    scrollLock.current = true;
    clearTimeout(scrollLockTimer.current);
    scrollLockTimer.current = setTimeout(
      () => (scrollLock.current = false),
      reduceMotion ? 0 : 700,
    );
    setActiveId(id);
    setOpen(false);
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    // Move keyboard and screen-reader focus to the section, like a normal in-page link.
    target?.focus({ preventScroll: true });
  };

  const row = "flex items-center gap-3 px-3 py-2.5 text-base leading-none";
  const surface =
    "absolute bottom-0 left-1/2 -translate-x-1/2 border border-border bg-card shadow-[0_12px_32px_-16px_rgb(var(--palette-shadow)/0.45)]";
  const pop = {
    initial: { opacity: 0, scale: reduceMotion ? 1 : 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: reduceMotion ? 1 : 0.96 },
    style: { originY: 1 },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        ref={rootRef}
        data-slot="scroll-progress"
        className={cn("fixed bottom-6 left-1/2 z-30 -translate-x-1/2", className)}
        {...props}
      >
        {/* Invisible stack of every label, measured once for the pill's width. */}
        <span
          ref={labelRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute grid"
        >
          {sections.map((s) => (
            <span
              key={s.id}
              className="col-start-1 row-start-1 text-base leading-none font-medium whitespace-nowrap"
            >
              {s.label}
            </span>
          ))}
        </span>

        <AnimatePresence
          initial={false}
          onExitComplete={() => {
            if (!reopenFocus.current) return;
            reopenFocus.current = false;
            pillRef.current?.focus();
          }}
        >
          {open ? (
            <m.ul
              key="list"
              ref={listRef}
              aria-label="Sections on this page"
              className={cn(surface, "flex w-max flex-col rounded-[20px] p-1.5")}
              {...pop}
              transition={PANEL}
              onAnimationStart={() =>
                listRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus()
              }
            >
              {sections.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => selectSection(s.id)}
                      className={cn(
                        "w-full rounded-xl text-left transition-colors",
                        row,
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground pointer-fine:hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          isActive ? "bg-primary" : "bg-foreground/30",
                        )}
                      />
                      <span className="whitespace-nowrap">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </m.ul>
          ) : (
            <m.button
              key="pill"
              ref={pillRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={false}
              aria-label={label ? `Reading: ${label}. Show sections` : "Show sections"}
              className={cn(surface, "flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2.5")}
              {...pop}
              transition={FADE}
            >
              <ProgressRing progress={progress} />
              <span className="relative h-5 shrink-0" style={{ width: labelWidth }}>
                <AnimatePresence initial={false}>
                  {label && (
                    <m.span
                      key={label}
                      className="absolute inset-y-0 left-0 flex items-center text-base leading-none font-medium whitespace-nowrap text-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={FADE}
                    >
                      {label}
                    </m.span>
                  )}
                </AnimatePresence>
              </span>
            </m.button>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
