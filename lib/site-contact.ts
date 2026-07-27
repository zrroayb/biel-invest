/**
 * Geçici iletişim bilgisi.
 * env (NEXT_PUBLIC_CONTACT_*) doluysa onu kullanır; boşsa müşteriye tek numaramızı
 * gösterir. Müşteri gerçek bilgilerini env'e girince otomatik override olur.
 * (Placeholder "info@example.com" / "+90 252 000 00 00" ARTIK gösterilmiyor.)
 */
const rawPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
const rawWa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
const rawEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

/** Ekranda gösterilecek telefon */
export const CONTACT_PHONE = rawPhone || "0554 889 9005";
/** tel: linki için */
export const CONTACT_PHONE_TEL = rawPhone
  ? rawPhone.replace(/[^\d+]/g, "")
  : "+905548899005";
/** WhatsApp için (uluslararası, + yok) */
export const CONTACT_WHATSAPP = rawWa || "905548899005";
/** E-posta — boşsa arayüzde gösterilmez */
export const CONTACT_EMAIL = rawEmail || "";
