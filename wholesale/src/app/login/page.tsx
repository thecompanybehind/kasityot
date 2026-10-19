import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { PageHeading, Rule } from "@/components/ui";
import { getWholesaler } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (await getWholesaler()) redirect("/catalogue");

  const { from } = await searchParams;
  // Only paths on this site: "//host" and "/\host" are read by browsers as
  // another site, so they would let the link bounce someone off it.
  const next =
    from &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    !from.includes("\\")
      ? from
      : "/catalogue";

  return (
    <div className="mx-auto max-w-[460px] px-[clamp(20px,4vw,44px)] py-[clamp(48px,8vw,120px)]">
      <div className="flex items-center gap-3.5 pb-10">
        <Image
          src="/logo-mark.png"
          alt=""
          width={176}
          height={207}
          className="h-9.5 w-auto"
        />
        <span className="flex flex-col gap-0.75">
          <span className="font-display text-[24px] leading-none font-normal tracking-[0.22em]">
            käsityöt
          </span>
          <span className="font-mono text-label-xs tracking-widest text-slate uppercase">
            Wholesale
          </span>
        </span>
      </div>

      <PageHeading eyebrow="Trade accounts" title="Sign in" />
      <Rule />

      <div className="pt-8">
        <LoginForm next={next} />
      </div>

      <p className="pt-8 text-body-sm leading-[1.7] text-slate">
        Buying for a business and not registered yet?{" "}
        <Link
          href="/register"
          className="text-brass underline underline-offset-4 hover:text-cream"
        >
          Open a trade account
        </Link>
        .
      </p>
    </div>
  );
}
