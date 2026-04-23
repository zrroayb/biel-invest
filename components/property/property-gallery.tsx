"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const open = useCallback((i: number) => setActive(i), []);
  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((a) => (a === null ? null : (a + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () =>
      setActive((a) =>
        a === null ? null : (a - 1 + images.length) % images.length,
      ),
    [images.length],
  );

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

  if (images.length === 0) return null;

  const hero = images[0];
  const secondary = images.slice(1, 5);

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
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
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
              className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/60 font-display text-2xl text-ivory">
                +{images.length - 5}
              </div>
            )}
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-xl"
          onClick={close}
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-6 top-6 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xs text-ivory hover:bg-ivory/10"
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
            className="absolute left-6 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-xs text-ivory hover:bg-ivory/10"
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
            className="absolute right-6 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-xs text-ivory hover:bg-ivory/10"
            aria-label="next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className={cn(
              "relative h-[85vh] w-[90vw] max-w-[1400px]",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`${alt} ${active + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-ivory/70">
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
