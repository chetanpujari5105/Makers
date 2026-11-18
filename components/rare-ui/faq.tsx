"use client";

/*
 * FAQ as a message thread — adapted from Rare UI (https://rareui.com).
 * Copyright (c) 2026 Swami Malode. MIT + Commons Clause + Attribution; see ./README.md.
 * Changes: direction A tokens, calm ease-out instead of springs, no avatar,
 * closed answers stay in the page (hidden) for search engines and no-JS visitors.
 */
import { AnimatePresence, LazyMotion, m, useReducedMotion, type Transition } from "framer-motion";
import {
  Fragment,
  useId,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

// Layout animations are the heavy part of framer-motion; fetch them after the page shows.
const loadLayoutFeatures = () => import("./layout-features").then((mod) => mod.default);
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SEND: Transition = { duration: 0.26, ease: EASE_OUT };
const SHIFT: Transition = { duration: 0.24, ease: EASE_OUT };
const LEAVE: Transition = { duration: 0.15, ease: [0.4, 0, 1, 1] };
const INSTANT: Transition = { duration: 0 };

const QUESTION = '[data-slot="faq-question"]';
const KEY_STEPS: Record<string, (index: number, last: number) => number> = {
  ArrowDown: (index) => index + 1,
  ArrowUp: (index) => index - 1,
  Home: () => 0,
  End: (_, last) => last,
};

export type FaqItem = { id: string; question: string; answer: ReactNode };

type BubbleProps = {
  item: FaqItem;
  ids: { question: string; answer: string };
  open: boolean;
  openId: string | null;
  reduced: boolean;
};

function Question({
  item,
  ids,
  open,
  openId,
  reduced,
  onToggle,
}: BubbleProps & { onToggle: () => void }) {
  return (
    <m.button
      id={ids.question}
      type="button"
      data-slot="faq-question"
      aria-expanded={open}
      aria-controls={ids.answer}
      onClick={onToggle}
      // every bubble re-measures when any answer opens, so the ones below slide
      layout="position"
      layoutDependency={openId}
      transition={reduced ? INSTANT : SHIFT}
      className={cn(
        "motion-press max-w-[85%] cursor-pointer self-start rounded-[18px] rounded-bl-md border px-4 py-2.5 text-left text-base leading-snug text-foreground transition-[background-color,border-color] duration-150 ease-out active:scale-[0.97]",
        open
          ? "border-foreground/20 bg-background"
          : "border-transparent bg-muted pointer-fine:hover:border-foreground/20",
      )}
    >
      {item.question}
    </m.button>
  );
}

function Answer({ item, ids, open, openId, reduced }: BubbleProps) {
  const bubble =
    "max-w-[85%] rounded-[18px] rounded-br-md bg-primary px-4 py-2.5 text-base leading-normal text-primary-foreground";
  return (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        {open && (
          <m.div
            key="answer"
            data-slot="faq-answer"
            layout="position"
            layoutDependency={openId}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: reduced ? INSTANT : LEAVE }}
            transition={reduced ? INSTANT : SEND}
            style={{ originX: 1, originY: 1 }}
            className="flex justify-end"
          >
            <div id={ids.answer} role="region" aria-labelledby={ids.question} className={bubble}>
              {item.answer}
            </div>
          </m.div>
        )}
      </AnimatePresence>
      {/* Closed: the text stays in the page, hidden, so it is still indexed and readable without JavaScript tricks. */}
      {!open && (
        <div id={ids.answer} hidden>
          {item.answer}
        </div>
      )}
    </>
  );
}

export type FaqProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  items: FaqItem[];
  defaultValue?: string | null;
};

export function Faq({ items, defaultValue = null, className, ...props }: FaqProps) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const [openId, setOpenId] = useState(defaultValue);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key];
    const target = event.target as HTMLElement;
    if (!step || !target.matches(QUESTION)) return;
    const questions = [...event.currentTarget.querySelectorAll<HTMLElement>(QUESTION)];
    const next = step(questions.indexOf(target), questions.length - 1);
    event.preventDefault();
    questions[(next + questions.length) % questions.length]?.focus();
  };

  return (
    <LazyMotion features={loadLayoutFeatures} strict>
      <div
        data-slot="faq"
        onKeyDown={onKeyDown}
        className={cn("relative flex w-full flex-col gap-3", className)}
        {...props}
      >
        {items.map((item) => {
          const bubble = {
            item,
            ids: { question: `${uid}-${item.id}-q`, answer: `${uid}-${item.id}-a` },
            open: openId === item.id,
            openId,
            reduced,
          };
          return (
            <Fragment key={item.id}>
              <Question
                {...bubble}
                onToggle={() => setOpenId((id) => (id === item.id ? null : item.id))}
              />
              <Answer {...bubble} />
            </Fragment>
          );
        })}
      </div>
    </LazyMotion>
  );
}
