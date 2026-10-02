"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import type { ArtistView } from "@/lib/queries";

type Props = {
  artists: ArtistView[];
  craftTypes: string[];
  regions: string[];
  current: { craft: string; region: string };
};

const fieldClass =
  "w-full min-w-0 border border-brass/35 bg-transparent px-4 py-3 font-mono text-label tracking-rail text-bone uppercase outline-none transition-colors focus:border-brass";

export function ArtistDirectory({
  artists,
  craftTypes,
  regions,
  current,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/artists?${next.toString()}`, { scroll: false });
  }

  const filtered = Boolean(current.craft || current.region);

  return (
    <>
      <Reveal className="rv-wipe grid grid-cols-1 gap-5 pt-(--spacing-rule-mt) [--rv-offset:500ms] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <div>
          <label
            htmlFor="a-craft"
            className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase"
          >
            Craft
          </label>
          <select
            id="a-craft"
            value={current.craft}
            onChange={(e) => update("craft", e.target.value)}
            className={fieldClass}
          >
            <option value="">All crafts</option>
            {craftTypes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="a-region"
            className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase"
          >
            Region
          </label>
          <select
            id="a-region"
            value={current.region}
            onChange={(e) => update("region", e.target.value)}
            className={fieldClass}
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </Reveal>

      {artists.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
          {artists.map((artist, i) => (
            <Reveal key={artist.id} delay={(i % 3) * 110}>
              <Link
                href={`/artists/${artist.slug}`}
                className="group flex flex-col gap-5"
              >
                {/* Each portrait opens from its centre, like a lens. */}
                <div className="rv-iris relative aspect-4/5 overflow-hidden bg-ink-raised">
                  {artist.photo ? (
                    <div className="rv-zoom absolute inset-0">
                      <div className="absolute inset-0 transition-transform duration-(--duration-image-slow) ease-kasityot group-hover:scale-[1.04]">
                        <Media
                          src={artist.photo}
                          alt={artist.name}
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
                <div>
                  <div className="font-display text-card-title leading-[1.14] text-cream transition-colors duration-500 group-hover:text-brass-light">
                    <span className="mask-line">
                      <span className="rv-line [--rv-offset:500ms]">
                        {artist.name}
                      </span>
                    </span>
                  </div>
                  <div className="pt-2 font-mono text-label-sm tracking-rail text-brass uppercase">
                    <span className="rv-type inline-block [--rv-offset:700ms]">
                      {artist.craftType}
                    </span>
                  </div>
                  <div className="pt-1 font-mono text-label-sm tracking-rail text-slate uppercase">
                    <span className="rv-type inline-block [--rv-offset:900ms]">
                      {artist.region}
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState
          title={filtered ? "No artists match those filters" : "No artists yet"}
          body={
            filtered
              ? "Try a different craft or region, or clear the filters."
              : "Artist profiles are being written. Check back shortly."
          }
        />
      )}
    </>
  );
}
