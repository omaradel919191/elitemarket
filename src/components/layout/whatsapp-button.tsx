import { MessageCircle } from "lucide-react";

/**
 * Floating WhatsApp contact button. Rendered only when a number is configured
 * (WHATSAPP_NUMBER env, read server-side and passed in). Sits bottom-start so it
 * doesn't collide with the assistant widget (bottom-end).
 */
export function WhatsAppButton({
  number,
  message,
  label,
}: {
  number: string;
  message?: string;
  label: string;
}) {
  const clean = number.replace(/[^\d]/g, "");
  if (!clean) return null;
  const href = `https://wa.me/${clean}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.6)] transition-transform duration-300 hover:scale-110 ltr:left-6 rtl:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
