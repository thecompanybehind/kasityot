"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Field, fieldClass } from "@/components/ui";
import { saveHeroSlide } from "@/lib/actions";
import type { HeroSlideView } from "@/lib/queries";

export function HeroSlideForm({ slide }: { slide: HeroSlideView | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState(slide?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setImage(json.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await saveHeroSlide(slide?.id ?? null, formData);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        router.push("/hero");
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="flex max-w-[860px] flex-col gap-7">
      {error ? (
        <div
          role="alert"
          className="border border-brass/45 px-4 py-3 text-body-sm text-brass"
        >
          {error}
        </div>
      ) : null}

      <div className="min-w-0">
        <span className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase">
          Banner image
        </span>
        <input type="hidden" name="image" value={image} />
        {image ? (
          <div className="relative mb-4 aspect-21/9 w-full overflow-hidden border border-bone/15 bg-ink-raised">
            <Image src={image} alt="" fill sizes="860px" className="object-cover" />
          </div>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => upload(e.target.files)}
          className="block w-full text-body-sm text-bone-muted file:mr-4 file:cursor-pointer file:border file:border-brass/45 file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-label-sm file:tracking-rail file:text-brass file:uppercase hover:file:border-brass"
        />
        <p className="m-0 pt-2 text-body-sm text-slate">
          Landscape works best — the banner is very wide and short on a
          laptop. Aim for at least 2000px across.
        </p>
      </div>

      <Field
        label="Image description"
        htmlFor="alt"
        hint="Describes the photo for screen readers and search engines."
      >
        <input
          id="alt"
          name="alt"
          defaultValue={slide?.alt}
          placeholder="e.g. Sita Devi painting a kohbar panel"
          className={fieldClass}
        />
      </Field>

      <div className="border-t border-bone/12 pt-7">
        <h2 className="m-0 pb-2 font-display text-card-title text-cream">
          Wording
        </h2>
        <p className="m-0 pb-6 text-body-sm leading-[1.6] text-bone-muted">
          Every field below is optional. Leave one blank and this banner uses
          the site&rsquo;s normal wording for it.
        </p>

        <div className="flex flex-col gap-7">
          <Field
            label="Small label"
            htmlFor="eyebrow"
            hint="The little line above the big text. Default: “Handmade in India”."
          >
            <input
              id="eyebrow"
              name="eyebrow"
              defaultValue={slide?.eyebrow}
              placeholder="Handmade in India"
              className={fieldClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
            <Field
              label="Headline"
              htmlFor="heading"
              hint="Default: “The hand,”"
            >
              <input
                id="heading"
                name="heading"
                defaultValue={slide?.heading}
                placeholder="The hand,"
                className={fieldClass}
              />
            </Field>
            <Field
              label="Headline, second line"
              htmlFor="headingAccent"
              hint="Shown in gold italics. Default: “unhurried.”"
            >
              <input
                id="headingAccent"
                name="headingAccent"
                defaultValue={slide?.headingAccent}
                placeholder="unhurried."
                className={fieldClass}
              />
            </Field>
          </div>

          <Field
            label="Sentence below"
            htmlFor="subtext"
            hint="One or two sentences. Keep it short — it sits over the photo."
          >
            <textarea
              id="subtext"
              name="subtext"
              rows={3}
              defaultValue={slide?.subtext}
              placeholder="Objects made slowly, by people we know by name…"
              className={`${fieldClass} resize-y`}
            />
          </Field>
        </div>
      </div>

      <Field
        label="Status"
        htmlFor="status"
        hint="Hidden banners stay here but never appear on the site."
      >
        <select
          id="status"
          name="status"
          defaultValue={slide?.status ?? "visible"}
          className={fieldClass}
        >
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </Field>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending || !image}
          className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : slide ? "Save changes" : "Add banner"}
        </button>
        <Link
          href="/hero"
          className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-bone"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
