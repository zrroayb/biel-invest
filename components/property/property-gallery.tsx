"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { isLoadableImageUrl } from "@/lib/seo/urls";
import { cn } from "@/lib/utils";

export function PropertyGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const valid = images.filter(isLoadableImageUrl);
  const n = valid.length;

  const [active, setActive] = useState<number | null>(null);

  const open = useCallback((i: number) => setActive(i), []);
  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((a) => (a === null || n === 0 ? null : (a + 1) % n)),
    [n],
  );
  const prev = useCallback(
    () =>
      setActive((a) => (a === null || n === 0 ? null : (a - 1 + n) % n)),
    [n],
  );

  /** For swipe on the main image (touch / trackpad / pen). */
  const panStart = useRef<{ x: number; y: number } | null>(null);

  const onPanStart = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    panStart.current = { x: e.clientX, y: e.clientY };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPanEnd = (e: React.PointerEvent) => {
    const start = panStart.current;
    panStart.current = null;
    if (start == null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const threshold = 40;
    if (adx < threshold && ady < threshold) return;
    if (n <= 1) return;
    // Vertical = scroll intent on touch screens; do not change slide.
    if (ady > adx) return;
    if (dx < 0) next();
    else prev();
  };

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, next, prev]);

  if (n === 0) return null;

  const hero = valid[0];
  const secondary = valid.slice(1, 5);

  return (
    <>
      <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => open(0)}
          className="group relative col-span-1 aspect-[4/3] overflow-hidden rounded-xs bg-ivory-200 md:col-span-2 md:row-span-2 md:aspect-auto"
        >
          <Image
            src={hero}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
        </button>

        {secondary.map((src, i) => (
          <button
            type="button"
            key={src + i}
            onClick={() => open(i + 1)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xs bg-ivory-200"
          >
            <Image
              src={src}
              alt={`${alt} ${i + 2}`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            />
            {i === 3 && n > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/60 font-display text-2xl text-ivory">
                +{n - 5}
              </div>
            )}
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain bg-ink/95 backdrop-blur-xl [-webkit-overflow-scrolling:touch]"
          onClick={close}
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            onClick={close}
            className="fixed right-4 top-4 z-[60] inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xs text-ivory hover:bg-ivory/10 sm:right-6 sm:top-6"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="fixed left-3 top-1/2 z-[60] -translate-y-1/2 inline-flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-xs text-ivory hover:bg-ivory/10 sm:left-6"
            aria-label="previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="fixed right-3 top-1/2 z-[60] -translate-y-1/2 inline-flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-xs text-ivory hover:bg-ivory/10 sm:right-6"
            aria-label="next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="mx-auto flex min-h-[100dvh] w-full max-w-[1400px] flex-col items-center justify-center px-4 py-6 pb-20 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "relative h-[min(85vh,800px)] w-full max-w-full touch-pan-y sm:h-[85vh] sm:max-h-[85vh]",
              )}
              onPointerDown={onPanStart}
              onPointerUp={onPanEnd}
              onPointerCancel={() => {
                panStart.current = null;
              }}
            >
              <Image
                src={valid[active]!}
                alt={`${alt} ${active + 1}`}
                fill
                sizes="(max-width:1400px) 90vw, 1400px"
                className="object-contain select-none"
                draggable={false}
              />
            </div>
            <div className="mt-4 shrink-0 text-xs uppercase tracking-[0.2em] text-ivory/70">
              {active + 1} / {n}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
