import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { PageHeading, Rule } from "@/components/ui";
import { getWholesaler } from "@/lib/auth";

export default async function RegisterPage() {
  if (await getWholesaler()) redirect("/catalogue");

  return (
    <div className="mx-auto max-w-[900px] px-[clamp(20px,4vw,44px)] py-[clamp(40px,6vw,88px)]">
      <PageHeading
        eyebrow="Kasityot wholesale"
        title="Open a trade account"
        action={
          <Link
            href="/login"
            className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-brass"
          >
            Already registered? Sign in →
          </Link>
        }
      />
      <Rule />

      <p className="max-w-[60ch] pt-8 pb-10 text-body leading-[1.8] text-bone-muted">
        Our trade catalogue is for shops, galleries, interior studios and other
        businesses buying handmade pieces in quantity. Register below and we
        will check your details by hand. Once your account is open you can see
        the catalogue and ask us for prices.
      </p>

      <RegisterForm />
    </div>
  );
}
