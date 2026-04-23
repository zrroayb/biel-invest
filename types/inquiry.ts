import type { LocaleKey } from "./property";

export type InquiryStatus = "new" | "read" | "replied";
export type InquirySource = "form" | "whatsapp";

export interface Inquiry {
  id: string;
  propertyId?: string | null;
  propertySlug?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  locale: LocaleKey;
  source: InquirySource;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryInput {
  propertyId?: string | null;
  propertySlug?: string | null;
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale: LocaleKey;
}
