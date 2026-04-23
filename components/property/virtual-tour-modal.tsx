"use client";

import { useEffect, useState } from "react";
import { Box, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function VirtualTourModal({
  url,
  variant = "button",
}: {
  url: string;
  variant?: "button" | "link";
}) {
  const t = useTranslations("property");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-outline"
        >
          <Box className="h-4 w-4" />
          {t("virtualTour")}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="link-underline inline-flex items-center gap-1.5 text-sm"
        >
          <Box className="h-4 w-4" /> {t("virtualTour")}
        </button>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-md"
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xs text-ivory hover:bg-ivory/10"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-[92vh] w-[96vw] max-w-[1600px] overflow-hidden rounded-xs bg-ink">
            <iframe
              src={url}
              title={t("virtualTour")}
              className="h-full w-full"
              allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer; vr"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
