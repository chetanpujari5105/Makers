"use client";

import { LazyMotion, MotionConfig, domAnimation, m } from "framer-motion";

/*
 * Scroll entrance (docs/DESIGN.md → Motion): fades in and rises 8px the first
 * time it scrolls into view, 260ms, strong ease-out. Never use it above the
 * fold or on headlines (the server HTML starts hidden until JS runs).
 * Reduced motion: MotionConfig drops the movement and keeps the fade.
 * Without JavaScript, the <noscript> rule in app/layout.tsx shows it at once.
 */
export function Reveal({
  children,
  className,
  index = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** "li" when the item sits directly in a list. */
  as?: "div" | "li";
  /** Position in a list: each item waits 40ms more (capped), for a short stagger. */
  index?: number;
}) {
  const Tag = as === "li" ? m.li : m.div;
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <Tag
          data-reveal=""
          className={className}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{
            duration: 0.25,
            ease: [0.23, 1, 0.32, 1],
            delay: Math.min(index, 5) * 0.04,
          }}
        >
          {children}
        </Tag>
      </MotionConfig>
    </LazyMotion>
  );
}
