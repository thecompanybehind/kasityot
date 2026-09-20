import Link from "next/link";
import { PageHeading, Rule } from "@/components/ui";

export default function ThanksPage() {
  return (
    <div className="mx-auto max-w-[900px] px-[clamp(20px,4vw,44px)] py-[clamp(40px,6vw,88px)]">
      <PageHeading eyebrow="Sent" title="Thank you" />
      <Rule />

      <div className="max-w-[58ch] space-y-5 pt-8 text-body leading-[1.8] text-bone-muted">
        <p className="m-0">
          Your application is with us. We read them in the order they arrive,
          and we write back either way — so there is nothing else you need to
          do, and no need to send it twice.
        </p>
        <p className="m-0">
          If we go ahead, you will get a link to set up your studio, where you
          can send us photographs of your work.
        </p>
      </div>

      <div className="pt-10">
        <Link
          href="/join"
          className="font-mono text-label tracking-nav text-brass uppercase transition-colors hover:text-cream"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}
