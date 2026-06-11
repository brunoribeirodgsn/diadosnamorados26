"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

type RomanticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
};

export function RomanticButton({
  children,
  className,
  variant = "primary",
  type = "button",
  onClick,
  ...props
}: RomanticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const styles = {
    primary:
      "bg-gradient-to-r from-rose to-gold text-ink shadow-glow-sm hover:brightness-110 hover:shadow-glow",
    secondary:
      "border border-white/15 bg-white/10 text-white hover:bg-white/18 hover:border-white/25",
    ghost: "text-white/78 hover:bg-white/10 hover:text-white",
    danger: "border border-red-300/25 bg-red-500/15 text-red-100 hover:bg-red-500/25",
    success:
      "border border-emerald-400/30 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
  };

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // Ripple effect
    const button = ref.current;
    if (button && variant === "primary") {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 10px;
        height: 10px;
        margin-left: -5px;
        margin-top: -5px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        pointer-events: none;
        animation: ripple-out 0.55s ease-out forwards;
      `;
      button.style.position = "relative";
      button.style.overflow = "hidden";
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    onClick?.(event);
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
