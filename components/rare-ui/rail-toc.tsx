"use client";

/*
 * "On this page" rail with a paper plane — adapted from Rare UI (https://rareui.com).
 * Copyright (c) 2026 Swami Malode. MIT + Commons Clause + Attribution; see ./README.md.
 * Changes: real #links (work without JavaScript), direction A tokens, a straight rail
 * so the plane and the filled line move with transforms only (no per-frame repaint),
 * framer-motion LazyMotion instead of `motion`.
 */
import {
  LazyMotion,
  domAnimation,
  m,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
} from "react";

import { cn } from "@/lib/utils";

export type RailTocItem = { id: string; label: string };

// Scroll-linked smoothing; both springs are over-damped, so nothing overshoots.
const TRAVEL_SPRING = { stiffness: 140, damping: 26, mass: 0.6 };
const TURN_SPRING = { stiffness: 260, damping: 30 };
// distance (px) the plane must back up before it turns around, so scroll jitter can't flip it
const TURN_SLACK = 2;
const PLANE = "M12 2 20.5 21 12 17.5 3.5 21z";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type RailTocProps = ComponentProps<"nav"> & {
  items: RailTocItem[];
  offset?: number;
  title?: string;
};

export function RailToc({
  className,
  items,
  offset = 96,
  title = "On this page",
  ...props
}: RailTocProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Vertical centre of each row: the dots, and the stops the plane flies between.
  const [nodes, setNodes] = useState<number[]>([]);
  const [reached, setReached] = useState(1);
  const placed = useRef(false);
  const pinned = useRef<number | null>(null);
  const userScrolled = useRef(false);
  const facing = useRef<1 | -1>(1);
  const turnFrom = useRef(0);

  const target = useMotionValue(0);
  const travel = useSpring(target, TRAVEL_SPRING);
  const y = reduceMotion ? target : travel;
  const heading = useMotionValue(180);
  const turn = useSpring(heading, TURN_SPRING);
  const first = nodes[0] ?? 0;
  const span = (nodes.at(-1) ?? 0) - first;
  const filled = useTransform(y, (v) =>
    span > 0 ? Math.min(1, Math.max(0, (v - first) / span)) : 0,
  );

  useMotionValueEvent(y, "change", (v) => setReached(nodes.filter((n) => n <= v + 0.5).length));

  const aim = useCallback(
    (next: number) => {
      const from = turnFrom.current;
      if ((next - from) * facing.current > 0) turnFrom.current = next;
      else if (Math.abs(next - from) > TURN_SLACK) {
        facing.current = facing.current > 0 ? -1 : 1;
        turnFrom.current = next;
        heading.set(facing.current > 0 ? 180 : 0);
      }
      target.set(next);
    },
    [target, heading],
  );

  const sync = useCallback(() => {
    if (!nodes.length) return;
    // a clicked heading holds the plane until the reader scrolls, since headings near the end can't scroll up to the anchor
    if (pinned.current !== null) {
      aim(nodes[pinned.current] ?? first);
      return;
    }
    const scrollTop = window.scrollY;
    const viewHeight = window.innerHeight;
    const remaining = Math.max(0, document.documentElement.scrollHeight - viewHeight - scrollTop);
    // the anchor starts at the top edge and sweeps to the bottom near the end, so the first and last headings are both reachable
    const line = Math.min(offset, scrollTop);
    const anchor = line + Math.max(0, viewHeight - line - remaining);
    const tops = items.map(
      (item) => document.getElementById(item.id)?.getBoundingClientRect().top ?? Infinity,
    );
    const index = tops.findLastIndex((top) => top <= anchor);
    let next: number;
    if (index === -1) next = first;
    else if (index === nodes.length - 1) next = nodes[index]!;
    else {
      const gap = tops[index + 1]! - tops[index]!;
      const progress = gap > 0 ? (anchor - tops[index]!) / gap : 0;
      next =
        nodes[index]! + Math.min(1, Math.max(0, progress)) * (nodes[index + 1]! - nodes[index]!);
    }
    aim(next);
    if (!placed.current) {
      placed.current = true;
      travel.jump(next);
      turn.jump(heading.get());
    }
  }, [nodes, first, items, offset, aim, travel, turn, heading]);

  useIsoLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !items.length) return;
    const measure = () =>
      setNodes(
        items.map((_, i) => {
          const row = rowRefs.current[i];
          return row ? row.offsetTop + row.offsetHeight / 2 : 0;
        }),
      );
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [items]);

  useEffect(() => {
    sync();
    const onIntent = () => {
      userScrolled.current = true;
    };
    const onScroll = () => {
      if (pinned.current !== null && userScrolled.current) pinned.current = null;
      sync();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("touchstart", onIntent, { passive: true });
    window.addEventListener("pointerdown", onIntent);
    window.addEventListener("keydown", onIntent);
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchstart", onIntent);
      window.removeEventListener("pointerdown", onIntent);
      window.removeEventListener("keydown", onIntent);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const select = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const id = items[index]!.id;
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    pinned.current = index;
    userScrolled.current = false;
    sync();
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    history.replaceState(null, "", `#${id}`);
  };

  const active = Math.max(0, reached - 1);
  // The rail runs down the left edge, 5px in; labels start 19px in.
  const rail = "absolute left-[4.5px] w-px";

  return (
    <LazyMotion features={domAnimation} strict>
      <nav
        data-slot="rail-toc"
        aria-label={title}
        className={cn("w-max max-w-full text-base", className)}
        {...props}
      >
        <p className="mb-3 font-medium text-muted-foreground">{title}</p>
        <ul ref={listRef} className="relative">
          {nodes.length > 1 && (
            <span aria-hidden="true">
              <span
                className={cn(rail, "border-l border-dashed border-foreground/25")}
                style={{ top: first, height: span }}
              />
              <m.span
                className={cn(rail, "origin-top bg-primary will-change-transform")}
                style={{ top: first, height: span, scaleY: filled }}
              />
              {nodes.map((node, i) => (
                <span
                  key={items[i]?.id ?? i}
                  className={cn(
                    "absolute left-[1.5px] size-[7px] -translate-y-1/2 rounded-full border",
                    i < reached
                      ? "border-primary bg-primary"
                      : "border-foreground/30 bg-background",
                  )}
                  style={{ top: node }}
                />
              ))}
              {/* the plane sits on a paper-coloured disc that hides the rail under it */}
              <m.span
                className="absolute top-0 left-0 -mt-2 -ml-[3px] grid size-4 place-items-center rounded-full bg-background text-primary will-change-transform"
                style={{ y, rotate: reduceMotion ? heading : turn }}
              >
                <svg viewBox="0 0 24 24" className="size-3.5 overflow-visible">
                  <path
                    d={PLANE}
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </m.span>
            </span>
          )}
          {items.map((item, i) => (
            <li key={item.id} ref={(el) => void (rowRefs.current[i] = el)}>
              <a
                href={`#${item.id}`}
                onClick={(event) => select(event, i)}
                aria-current={i === active ? "location" : undefined}
                className={cn(
                  "block rounded-md py-1.5 pr-2 pl-[19px] leading-5 no-underline transition-colors",
                  i === active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground pointer-fine:hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </LazyMotion>
  );
}
