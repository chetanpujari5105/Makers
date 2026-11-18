"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/*
 * Mobile-only purchase bar. It slides up once the whole hero (which holds the
 * main call-to-action) has scrolled away, so it never covers the hero. The
 * hero starts on screen, so even a jump past it (anchor link, fast fling)
 * registers as a change. It is `inert` while
 * hidden so keyboard users can't tab into an invisible control.
 * Reduced motion: fades instead of sliding.
 */
export function StickyBuyBar({
  watchId,
  children,
}: {
  watchId: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <div
      data-visible={visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 bg-card px-gutter pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--border),0_-12px_32px_-16px_rgb(var(--palette-shadow)/0.3)] lg:hidden",
        "translate-y-full opacity-0 transition-[translate,opacity] duration-250 ease-out motion-reduce:translate-y-0",
        "data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100",
      )}
    >
      {children}
    </div>
  );
}
