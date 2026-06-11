import { cn } from "@/lib/utils";

type Variant = "accent" | "default";

export function GlassCard({
  children,
  className,
  variant = "default"
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}) {
  return (
    <div
      className={cn(
        "glass rounded-3xl p-5",
        variant === "accent" && "glass-rose",
        className
      )}
    >
      {children}
    </div>
  );
}
