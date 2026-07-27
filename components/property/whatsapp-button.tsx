"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { CONTACT_WHATSAPP } from "@/lib/site-contact";

export function WhatsAppButton({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  const t = useTranslations("property");
  const number = CONTACT_WHATSAPP;
  const text = message ? encodeURIComponent(message) : "";
  const href = `https://wa.me/${number}${text ? `?text=${text}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`btn btn-outline ${className ?? ""}`}
    >
      <MessageCircle className="h-4 w-4" />
      {t("whatsapp")}
    </a>
  );
}
