import Image from "next/image";
import { redirect } from "next/navigation";
import { createSession, getSession, verifyCredentials } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fieldClass, labelClass } from "@/components/ui";

/**
 * The only unauthenticated page in the app. There is no signup route and
 * no way to create a second account — the owner is provisioned via env.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const sp = await searchParams;
  if (await getSession()) redirect(sp.from || "/");

  async function signIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const from = String(formData.get("from") ?? "") || "/";

    if (!(await verifyCredentials(email, password))) {
      // Deliberately vague: never reveal which half was wrong.
      redirect(`/login?error=1${from !== "/" ? `&from=${from}` : ""}`);
    }
    await createSession(email);
    redirect(from);
  }

  return (
    <div className="relative grid min-h-dvh place-items-center px-6 py-16">
      <div className="absolute top-5 right-[clamp(20px,4vw,44px)]">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-3.5 pb-10">
          <Image
            src="/logo-mark.png"
            alt=""
            width={176}
            height={207}
            className="logo-mark h-[38px] w-auto"
          />
          <span className="flex flex-col gap-[3px]">
            <span className="font-sans text-[12px] tracking-logo uppercase">
              Kasityot
            </span>
            <span className="font-mono text-label-xs tracking-widest text-slate uppercase">
              Owner panel
            </span>
          </span>
        </div>

        <h1 className="m-0 pb-8 font-display text-section-sm leading-none font-light tracking-quote text-cream">
          Sign in
        </h1>

        {sp.error ? (
          <div
            role="alert"
            className="mb-6 border border-brass/45 px-4 py-3 font-mono text-label-sm tracking-rail text-brass uppercase"
          >
            Those details did not match.
          </div>
        ) : null}

        <form action={signIn} className="flex flex-col gap-5">
          <input type="hidden" name="from" value={sp.from ?? "/"} />
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={fieldClass}
            />
          </div>
          <button
            type="submit"
            className="mt-2 cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
