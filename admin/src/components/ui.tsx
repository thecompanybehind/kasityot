import Link from "next/link";
import type { ReactNode } from "react";

/* Shared building blocks for the panel. They extend the public site's
   design system rather than introducing a dashboard look. */

export function PageHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 pb-8">
      <div className="min-w-0">
        <div className="pb-3 font-mono text-label tracking-wide text-slate uppercase">
          {eyebrow}
        </div>
        <h1 className="m-0 font-display text-section-sm leading-none font-light tracking-quote text-cream">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

export function Rule() {
  return <div className="h-px bg-brass/30" />;
}

const buttonBase =
  "inline-block cursor-pointer px-[26px] py-[14px] font-mono text-label tracking-label uppercase transition-colors duration-200 border";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const cls =
    variant === "primary"
      ? "bg-brass text-ink border-brass hover:bg-cream hover:border-cream"
      : "bg-transparent text-cream border-cream/40 hover:border-cream hover:bg-cream/10";
  return (
    <Link href={href} className={`${buttonBase} ${cls}`}>
      {children}
    </Link>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    available: "border-brass/50 text-brass",
    sold: "border-bone/30 text-bone-muted",
    hidden: "border-bone/20 text-slate",
    visible: "border-brass/50 text-brass",
    new: "border-brass text-brass",
    contacted: "border-bone/30 text-bone-soft",
    closed: "border-bone/20 text-slate",
    // Review states. Pending is the only one calling for the owner to act,
    // so it is the only one that fills rather than outlines.
    pending: "border-brass bg-brass/15 text-brass",
    approved: "border-brass/50 text-brass",
    rejected: "border-bone/25 text-slate",
    draft: "border-bone/20 text-slate-dim",
  };
  return (
    <span
      className={`inline-block rounded-pill border px-3 py-1 font-mono text-label-sm tracking-rail uppercase ${tone[status] ?? "border-bone/20 text-slate"}`}
    >
      {status}
    </span>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 border border-brass/25 px-6 py-[clamp(40px,6vw,80px)] text-center">
      <div className="font-display text-card-title text-cream">{title}</div>
      <p className="m-0 max-w-[44ch] text-body-sm leading-[1.7] text-bone-muted">
        {body}
      </p>
    </div>
  );
}

/* --- form fields --- */

export const fieldClass =
  "w-full min-w-0 border border-brass/35 bg-transparent px-4 py-3 text-body text-bone outline-none transition-colors focus:border-brass";

export const labelClass =
  "block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className="m-0 pt-2 text-body-sm leading-[1.5] text-slate">{hint}</p>
      ) : null}
    </div>
  );
}
