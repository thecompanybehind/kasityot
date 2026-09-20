"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { EmptyState } from "@/components/ui/EmptyState";
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
      <div className="grid grid-cols-1 gap-5 pt-(--spacing-rule-mt) sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
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
      </div>

      {artists.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.slug}`}
              className="group flex flex-col gap-5"
            >
              <div className="relative aspect-4/5 overflow-hidden bg-ink-raised">
                {artist.photo ? (
                  <Media
                    src={artist.photo}
                    alt={artist.name}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                ) : null}
              </div>
              <div>
                <div className="font-display text-card-title leading-[1.14] text-cream">
                  {artist.name}
                </div>
                <div className="pt-2 font-mono text-label-sm tracking-rail text-brass uppercase">
                  {artist.craftType}
                </div>
                <div className="pt-1 font-mono text-label-sm tracking-rail text-slate uppercase">
                  {artist.region}
                </div>
              </div>
            </Link>
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
