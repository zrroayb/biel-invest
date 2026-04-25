"use client";

import { Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import {
  trackFavoriteAdd,
  trackFavoriteRemove,
} from "@/lib/analytics/track-public-event";

export function FavoriteButton({
  id,
  propertyLabel,
  className,
  variant = "default",
}: {
  id: string;
  /** Shown in admin visitor log when favorited */
  propertyLabel?: string;
  className?: string;
  variant?: "default" | "overlay";
}) {
  const { has, toggle, ready } = useFavorites();
  const t = useTranslations("property");
  const pathname = usePathname();
  const locale = useLocale();
  const active = has(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasActive = active;
        toggle(id);
        if (!wasActive) {
          void trackFavoriteAdd(id, {
            propertyLabel,
            path: pathname,
            locale,
          });
        } else {
          void trackFavoriteRemove(id, { path: pathname, locale });
        }
      }}
      aria-label={active ? t("unfavorite") : t("favorite")}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xs transition-all",
        variant === "overlay"
          ? "bg-ivory/90 backdrop-blur-md text-ink hover:bg-ivory"
          : "border border-ivory-300 bg-ivory-50 text-ink-muted hover:text-ink hover:border-ink",
        !ready && "opacity-60",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          active && "fill-olive text-olive",
        )}
      />
    </button>
  );
}
