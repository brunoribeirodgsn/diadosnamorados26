export function SectionTitle({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">{eyebrow}</p> : null}
      <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      {subtitle ? <p className="text-sm leading-6 text-white/64">{subtitle}</p> : null}
    </div>
  );
}
