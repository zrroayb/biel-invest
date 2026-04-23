"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import type { InquiryStatus } from "@/types/inquiry";

export function InquiryActions({
  id,
  status,
}: {
  id: string;
  status: InquiryStatus;
}) {
  const t = useTranslations("admin.inquiries");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (next: InquiryStatus) => {
    startTransition(async () => {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      {status !== "read" && (
        <button
          type="button"
          onClick={() => update("read")}
          disabled={pending}
          className="btn btn-ghost btn-sm"
        >
          {t("markRead")}
        </button>
      )}
      {status !== "replied" && (
        <button
          type="button"
          onClick={() => update("replied")}
          disabled={pending}
          className="btn btn-outline btn-sm"
        >
          {t("markReplied")}
        </button>
      )}
    </div>
  );
}
