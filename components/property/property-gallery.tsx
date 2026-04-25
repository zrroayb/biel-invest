"use client";

import Image from "next/image";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { isLoadableImageUrl } from "@/lib/seo/urls";
import { cn } from "@/lib/utils";

const LIGHTBOX_Z = 200;
const ENTER_MS = 320;
const EXIT_MS = 280;

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function PropertyGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const t = useTranslations("property.lightbox");
  const isClient = useIsClient();
  const valid = images.filter(isLoadableImageUrl);
  const n = valid.length;

  const [active, setActive] = useState<number | null>(null);
  const [lightboxFrame, setLightboxFrame] = useState<"in" | "out">("out");
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback((i: number) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setActive((current) => {
      if (current === null) {
        setLightboxFrame("out");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setLightboxFrame("in"));
        });
      }
      return i;
    });
  }, []);

  const close = useCallback(() => {
    setLightboxFrame("out");
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setActive(null);
      closeTimeout.current = null;
    }, EXIT_MS);
  }, []);

  const next = useCallback(
    () =>
      setActive((a) => (a === null || n === 0 ? null : (a + 1) % n)),
    [n],
  );
  const prev = useCallback(
    () =>
      setActive((a) => (a === null || n === 0 ? null : (a - 1 + n) % n)),
    [n],
  );

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

  useEffect(
    () => () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    },
    [],
  );

  if (n === 0) return null;

  const hero = valid[0];
  const secondary = valid.slice(1, 5);

  const showLightbox = active !== null;
  const lightboxOpen = showLightbox && lightboxFrame === "in";
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const transitionMs = lightboxFrame === "in" ? ENTER_MS : EXIT_MS;

  const lightbox =
    isClient &&
    showLightbox &&
    createPortal(
      <div
        className="fixed inset-0 cursor-default"
        style={{ zIndex: LIGHTBOX_Z }}
        role="dialog"
        aria-modal
        aria-label={alt}
        data-lightbox
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/92 via-ink/90 to-ink/96 backdrop-blur-2xl"
          style={{
            opacity: lightboxOpen ? 1 : 0,
            transition: `opacity ${transitionMs}ms ${ease}`,
          }}
        />

        <div
          className="absolute inset-0 flex min-h-0 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable]"
          onClick={close}
        >
          <div
            className="mx-auto flex min-h-[min(100dvh,100%)] w-full min-w-0 max-w-6xl flex-1 flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: lightboxOpen
                ? "scale(1) translateY(0)"
                : "scale(0.97) translateY(10px)",
              opacity: lightboxOpen ? 1 : 0,
              transition: `transform ${transitionMs}ms ${ease}, opacity ${transitionMs}ms ease-out`,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-ivory/10 pb-3">
              <p className="font-display text-sm tracking-wide text-ivory/90 sm:text-base">
                <span className="text-ivory/50">
                  {active !== null ? active + 1 : 0}
                </span>
                <span className="mx-2 text-ivory/30">/</span>
                {n}
              </p>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/20 bg-ink/50 text-ivory shadow-soft backdrop-blur-md transition hover:border-ivory/40 hover:bg-ivory/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/80"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-4 sm:py-6">
              <div className="w-full max-w-5xl">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-sm bg-ivory-200/5 ring-1 ring-ivory/10",
                    "shadow-lift",
                  )}
                >
                  {n > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prev();
                        }}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ivory/20 bg-ink/50 p-2.5 text-ivory shadow-soft backdrop-blur-md transition hover:bg-ivory/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/80 min-[480px]:left-3 min-[480px]:p-3"
                        aria-label={t("previous")}
                      >
                        <ChevronLeft className="h-5 w-5 min-[480px]:h-6 min-[480px]:w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          next();
                        }}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ivory/20 bg-ink/50 p-2.5 text-ivory shadow-soft backdrop-blur-md transition hover:bg-ivory/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/80 min-[480px]:right-3 min-[480px]:p-3"
                        aria-label={t("next")}
                      >
                        <ChevronRight className="h-5 w-5 min-[480px]:h-6 min-[480px]:w-6" />
                      </button>
                    </>
                  )}

                  <div
                    className={cn(
                      "relative aspect-[4/3] w-full max-h-[min(78vh,860px)] sm:aspect-[16/10] sm:max-h-[min(82vh,900px)]",
                      "touch-pan-y",
                    )}
                    onPointerDown={onPanStart}
                    onPointerUp={onPanEnd}
                    onPointerCancel={() => {
                      panStart.current = null;
                    }}
                  >
                    {active !== null && (
                      <Image
                        key={active}
                        src={valid[active]!}
                        alt={`${alt} ${active + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 64rem"
                        className="object-contain select-none"
                        draggable={false}
                      />
                    )}
                  </div>
                </div>

                {n > 1 && (
                  <p className="mt-4 text-center text-[11px] uppercase tracking-[0.25em] text-ivory/40 sm:text-xs">
                    {t("swipeHint")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => open(0)}
          className="group relative col-span-1 aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xs bg-ivory-200 touch-manipulation md:col-span-2 md:row-span-2 md:aspect-auto"
        >
          <Image
            src={hero}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="pointer-events-none object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
          <span className="sr-only">{t("openZoom")}</span>
        </button>

        {secondary.map((src, i) => (
          <button
            type="button"
            key={src + i}
            onClick={() => open(i + 1)}
            className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xs bg-ivory-200 touch-manipulation"
          >
            <Image
              src={src}
              alt={`${alt} ${i + 2}`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="pointer-events-none object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            />
            {i === 3 && n > 5 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/60 font-display text-2xl text-ivory">
                +{n - 5}
              </div>
            )}
            <span className="sr-only">{t("openZoom")}</span>
          </button>
        ))}
      </div>

      {lightbox}
    </>
  );
}
