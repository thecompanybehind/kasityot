"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ABOUT_DEFAULTS, type AboutContent } from "@kasityot/core/about";
import { Field, fieldClass, labelClass } from "@/components/ui";
import { saveAbout } from "@/lib/actions";

const D = ABOUT_DEFAULTS;

/**
 * The About page, edited in the same order it reads on the site.
 *
 * Text fields show the page's normal wording as a placeholder, so a blank
 * box visibly means "keep what is there". Principles are the exception: they
 * start filled in, because changing one of three should not mean retyping the
 * other two.
 */
export function AboutForm({ content }: { content: AboutContent }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [heroImage, setHeroImage] = useState(content.heroImage);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [principles, setPrinciples] = useState(
    content.principles.length ? content.principles : D.principles,
  );

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
      setHeroImage(json.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function updatePrinciple(i: number, key: "title" | "body", value: string) {
    setPrinciples((list) =>
      list.map((p, n) => (n === i ? { ...p, [key]: value } : p)),
    );
  }

  function submit(formData: FormData) {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveAbout(formData);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="flex max-w-[860px] flex-col gap-7">
      {/* ── Top banner ───────────────────────────────────── */}
      <Section title="Top banner">
        <div className="min-w-0">
          <span className={labelClass}>Photograph</span>
          <input type="hidden" name="heroImage" value={heroImage} />
          {heroImage ? (
            <div className="relative mb-4 aspect-21/9 w-full overflow-hidden border border-bone/15 bg-ink-raised">
              <Image
                src={heroImage}
                alt=""
                fill
                sizes="860px"
                className="object-cover"
              />
            </div>
          ) : (
            <p className="m-0 pb-3 text-body-sm text-slate">
              Using the page&rsquo;s normal photograph.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer border border-bone/25 px-4 py-2.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass">
              {uploading
                ? "Uploading…"
                : heroImage
                  ? "Replace photograph"
                  : "Choose a photograph"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(e) => upload(e.target.files)}
              />
            </label>
            {heroImage ? (
              <button
                type="button"
                onClick={() => setHeroImage("")}
                className="cursor-pointer px-2 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
              >
                Use the normal one
              </button>
            ) : null}
          </div>
        </div>

        <Field
          label="Photograph description"
          htmlFor="heroAlt"
          hint="Describes the photo for screen readers and search engines."
        >
          <input
            id="heroAlt"
            name="heroAlt"
            defaultValue={content.heroAlt}
            placeholder={D.heroAlt}
            className={fieldClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <Field label="Headline" htmlFor="heading">
            <input
              id="heading"
              name="heading"
              defaultValue={content.heading}
              placeholder={D.heading}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Headline, second line"
            htmlFor="headingAccent"
            hint="Shown in gold italics."
          >
            <input
              id="headingAccent"
              name="headingAccent"
              defaultValue={content.headingAccent}
              placeholder={D.headingAccent}
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      {/* ── Section I ────────────────────────────────────── */}
      <Section title="Section I — why we exist">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <Field label="Small label" htmlFor="premiseEyebrow">
            <input
              id="premiseEyebrow"
              name="premiseEyebrow"
              defaultValue={content.premiseEyebrow}
              placeholder={D.premiseEyebrow}
              className={fieldClass}
            />
          </Field>
          <Field label="Title" htmlFor="premiseTitle">
            <input
              id="premiseTitle"
              name="premiseTitle"
              defaultValue={content.premiseTitle}
              placeholder={D.premiseTitle}
              className={fieldClass}
            />
          </Field>
        </div>
        <Field
          label="Text"
          htmlFor="premiseBody"
          hint="Leave an empty line between paragraphs."
        >
          <textarea
            id="premiseBody"
            name="premiseBody"
            rows={10}
            defaultValue={content.premiseBody}
            placeholder={D.premiseBody}
            className={`${fieldClass} resize-y leading-[1.7]`}
          />
        </Field>
      </Section>

      {/* ── Section II ───────────────────────────────────── */}
      <Section title="Section II — how we work">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <Field label="Small label" htmlFor="principlesEyebrow">
            <input
              id="principlesEyebrow"
              name="principlesEyebrow"
              defaultValue={content.principlesEyebrow}
              placeholder={D.principlesEyebrow}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Title"
            htmlFor="principlesTitle"
            hint="If you change how many principles there are, change this too."
          >
            <input
              id="principlesTitle"
              name="principlesTitle"
              defaultValue={content.principlesTitle}
              placeholder={D.principlesTitle}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-5">
          {principles.map((p, i) => (
            <div key={i} className="border border-bone/15 px-5 py-5">
              <div className="flex items-center justify-between gap-3 pb-4">
                <span className="font-mono text-label tracking-numeral text-brass">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {principles.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPrinciples((list) => list.filter((_, n) => n !== i))
                    }
                    className="cursor-pointer font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col gap-4">
                <input
                  name="principleTitle"
                  aria-label={`Principle ${i + 1} title`}
                  value={p.title}
                  onChange={(e) => updatePrinciple(i, "title", e.target.value)}
                  placeholder="Title"
                  className={fieldClass}
                />
                <textarea
                  name="principleBody"
                  aria-label={`Principle ${i + 1} text`}
                  rows={2}
                  value={p.body}
                  onChange={(e) => updatePrinciple(i, "body", e.target.value)}
                  placeholder="One or two sentences"
                  className={`${fieldClass} resize-y`}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setPrinciples((list) => [...list, { title: "", body: "" }])
              }
              className="cursor-pointer border border-bone/25 px-4 py-2.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
            >
              Add a principle
            </button>
            <button
              type="button"
              onClick={() => setPrinciples(D.principles)}
              className="cursor-pointer px-2 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
            >
              Reset to the normal three
            </button>
          </div>
        </div>
      </Section>

      {error ? (
        <div
          role="alert"
          className="border border-brass/45 px-4 py-3 text-body-sm text-brass"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save the About page"}
        </button>
        {saved ? (
          <span className="font-mono text-label-sm tracking-rail text-brass uppercase">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-7 border-t border-bone/12 pt-7 first:border-t-0 first:pt-0">
      <h2 className="m-0 font-display text-card-title text-cream">{title}</h2>
      {children}
    </section>
  );
}
