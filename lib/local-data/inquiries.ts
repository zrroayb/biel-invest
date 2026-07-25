import "server-only";
/**
 * Firebase yapılandırılmadığında talepleri (müşteri/lead) repo'daki
 * data/inquiries.local.json'dan okuyan yerel veri kaynağı.
 * Bu veri yalnızca admin panelinde (yerel/geliştirme modunda) görünür.
 */
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import LOCAL from "@/data/inquiries.local.json";

const ALL = LOCAL as unknown as Inquiry[];

export function listLocalInquiries(
  status?: InquiryStatus | "all",
): Inquiry[] {
  let items = [...ALL];
  if (status && status !== "all") {
    items = items.filter((i) => i.status === status);
  }
  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 200);
}
