import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "secondary-dark";

const base =
  "inline-block px-[34px] py-[17px] font-mono text-label tracking-label uppercase transition-colors duration-200";

const variants: Record<Variant, string> = {
  /* Brass fill on dark ground — the hero's leading action. */
  primary: "bg-brass text-ink hover:bg-cream",
  /* Hairline outline on dark ground. */
  secondary:
    "border border-cream/45 text-cream hover:bg-cream/12 hover:border-cream",
  /* Hairline outline on the parchment ground of the maker section. */
  "secondary-dark":
    "border border-espresso/42 text-espresso hover:bg-espresso hover:text-parchment hover:border-espresso",
};

type Props = {
  href: string;
  variant?: Variant;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "children">;

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
