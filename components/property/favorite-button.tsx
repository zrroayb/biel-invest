"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({
  id,
  className,
  variant = "default",
}: {
  id: string;
  className?: string;
  variant?: "default" | "overlay";
}) {
  const { has, toggle, ready } = useFavorites();
  const t = useTranslations("property");
  const active = has(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
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
