import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">{label}</span>
      {children}
      {hint ? <span className="block text-xs leading-5 text-white/40">{hint}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-white/12 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/28 focus:border-rose/70 focus:bg-white/[0.10] focus:shadow-[0_0_0_3px_rgba(244,91,138,0.12)]";

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputBase, "min-h-32 resize-y leading-6", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        inputBase,
        "cursor-pointer appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='rgba(255,255,255,0.4)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")] bg-[length:20px] bg-[right_10px_center] bg-no-repeat pr-9",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all duration-200",
        checked
          ? "border-rose/30 bg-rose/8 text-white"
          : "border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.08]"
      )}
    >
      <div className="text-left">
        <span className="block font-semibold">{label}</span>
        {description ? <span className="block text-xs text-white/45 mt-0.5">{description}</span> : null}
      </div>
      <span
        className={cn(
          "relative ml-4 h-6 w-11 shrink-0 rounded-full transition-all duration-300",
          checked ? "bg-gradient-to-r from-rose to-gold shadow-glow-sm" : "bg-white/14"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
            checked ? "left-6" : "left-1"
          )}
        />
      </span>
    </button>
  );
}
