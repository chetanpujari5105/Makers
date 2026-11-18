"use client";

/*
 * Scroll progress pill — adapted from Rare UI (https://rareui.com).
 * Copyright (c) 2026 Swami Malode. MIT + Commons Clause + Attribution; see ./README.md.
 * Changes: direction A tokens, no blur, ease-out under 300 ms instead of springs,
 * focus moves into the list when it opens and back to the pill when it closes.
 */
import {
  AnimatePresence,
  LazyMotion,
  m,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ScrollProgressSection = { id: string; label: string };

// Layout animations are the heavy part of framer-motion; fetch them after the page shows.
const loadLayoutFeatures = () => import("./layout-features").then((mod) => mod.default);
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SIZE = { duration: 0.26, ease: EASE_OUT } as const;
const FADE = { duration: 0.2, ease: EASE_OUT } as const;
const INSTANT = { duration: 0 } as const;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Size = { width: number; height: number };

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
  const layoutId = useId();
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

  const collapsedRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reopenFocus = useRef(false);

  const [collapsedSize, setCollapsedSize] = useState<Size>();
  const [openSize, setOpenSize] = useState<Size>();
  const [labelWidth, setLabelWidth] = useState<number>();

  useIsoLayoutEffect(() => {
    const measure = () => {
      if (labelRef.current) setLabelWidth(labelRef.current.offsetWidth);
      if (collapsedRef.current)
        setCollapsedSize({
          width: collapsedRef.current.offsetWidth,
          height: collapsedRef.current.offsetHeight,
        });
      if (openRef.current)
        setOpenSize({ width: openRef.current.offsetWidth, height: openRef.current.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of [labelRef.current, collapsedRef.current, openRef.current])
      if (el) ro.observe(el);
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

  const size = open ? openSize : collapsedSize;
  const radius = open ? 20 : (collapsedSize?.height ?? 32) / 2;
  const row = "flex items-center gap-3 px-3 py-2.5 text-base leading-none";

  return (
    <LazyMotion features={loadLayoutFeatures} strict>
      <div
        ref={rootRef}
        data-slot="scroll-progress"
        className={cn("fixed bottom-6 left-1/2 z-30 -translate-x-1/2", className)}
        {...props}
      >
        {/* Invisible copies, measured so the surface can animate between the two sizes. */}
        <div className="pointer-events-none invisible absolute" aria-hidden="true">
          <div ref={collapsedRef} className="inline-flex items-center gap-2.5 py-2 pr-4 pl-2.5">
            <span className="size-5" />
            <span ref={labelRef} className="text-base leading-none font-medium whitespace-nowrap">
              {label}
            </span>
          </div>
          <div ref={openRef} className="w-max p-1.5">
            {sections.map((s) => (
              <div key={s.id} className={row}>
                <span className="size-1.5" />
                <span className="whitespace-nowrap">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {size && (
          <m.div
            data-slot="scroll-progress-surface"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden border border-border bg-card shadow-[0_12px_32px_-16px_rgb(var(--palette-shadow)/0.45)]"
            initial={false}
            animate={{ width: size.width, height: size.height, borderRadius: radius }}
            transition={reduceMotion ? INSTANT : SIZE}
          >
            <AnimatePresence
              initial={false}
              mode="popLayout"
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
                  className="absolute inset-0 flex flex-col p-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE}
                  onAnimationStart={() =>
                    listRef.current
                      ?.querySelector<HTMLButtonElement>('[aria-current="true"]')
                      ?.focus()
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
                            "relative w-full rounded-xl text-left transition-colors",
                            row,
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground pointer-fine:hover:text-foreground",
                          )}
                        >
                          {isActive && (
                            <m.span
                              layoutId={`${layoutId}-active`}
                              className="absolute inset-0 rounded-xl bg-muted"
                              transition={reduceMotion ? INSTANT : SIZE}
                            />
                          )}
                          <span
                            className={cn(
                              "relative size-1.5 shrink-0 rounded-full",
                              isActive ? "bg-primary" : "bg-foreground/30",
                            )}
                          />
                          <span className="relative whitespace-nowrap">{s.label}</span>
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
                  className="absolute inset-0 flex items-center gap-2.5 py-2 pr-4 pl-2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5 shrink-0 -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      strokeWidth="2.5"
                      className="stroke-foreground/15"
                    />
                    <m.circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="stroke-primary"
                      style={{ pathLength: progress }}
                    />
                  </svg>
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
          </m.div>
        )}
      </div>
    </LazyMotion>
  );
}
