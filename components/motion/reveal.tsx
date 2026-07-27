"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealTag = "div" | "section" | "article" | "li";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: RevealTag;
}

/**
 * Scroll-triggered fade/slide without framer-motion (smaller JS, less main-thread work).
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduce || !el) {
      setActive(true);
      return;
    }

    // Yükleme anında zaten görünür alandaysa hemen göster (gözlemci hızlı
    // scroll'da atlayabilir; içerik gizli kalmasın).
    if (el.getBoundingClientRect().top < window.innerHeight + 100) {
      setActive(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          io.disconnect();
          clearTimeout(safety);
        }
      },
      { rootMargin: "100px 0px -6% 0px", threshold: 0 },
    );
    io.observe(el);

    // Güvenlik ağı: gözlemci hiç tetiklenmezse içerik en geç 1.5sn sonra görünür.
    const safety = setTimeout(() => {
      setActive(true);
      io.disconnect();
    }, 1500);

    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return createElement(
    as,
    {
      ref,
      className: cn(className),
      style: {
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : `translateY(${y}px)`,
        transition: active
          ? `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
          : undefined,
      },
    },
    children,
  );
}
