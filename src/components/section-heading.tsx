export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--secondary-strong)]">{eyebrow}</p>}
      <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-strong)] sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">{description}</p>}
    </div>
  );
}
