export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      {eyebrow && <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--secondary-strong)]"><span className="h-2 w-2 rounded-full bg-[var(--secondary-strong)]" />{eyebrow}</div>}
      <h1 className="text-4xl font-black tracking-[-0.04em] text-[var(--primary-strong)] sm:text-5xl">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">{description}</p>}
    </div>
  );
}
