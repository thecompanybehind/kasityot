"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  craftTypes: string[];
  artists: { slug: string; name: string }[];
  current: {
    craft: string;
    artist: string;
    min: string;
    max: string;
    sort: string;
  };
};

const fieldClass =
  "w-full min-w-0 border border-brass/35 bg-transparent px-4 py-3 font-mono text-label tracking-rail text-bone uppercase outline-none transition-colors focus:border-brass";

const labelClass =
  "block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase";

/**
 * Filters read from and write to the URL, so a filtered view is
 * shareable and survives a refresh. On mobile the whole block collapses
 * behind a single toggle rather than pushing the grid off the screen.
 */
export function ArtworkFilters({ craftTypes, artists, current }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/artworks?${next.toString()}`, { scroll: false });
  }

  const active =
    Boolean(current.craft) ||
    Boolean(current.artist) ||
    Boolean(current.min) ||
    Boolean(current.max);

  return (
    <div className="pt-(--spacing-rule-mt)">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="filter-panel"
          className="flex items-center gap-3 font-mono text-label tracking-nav text-brass uppercase md:hidden"
        >
          <span>{open ? "Hide filters" : "Filters"}</span>
          {active ? <span className="size-1.5 rounded-pill bg-brass" /> : null}
        </button>

        {active ? (
          <button
            type="button"
            onClick={() => router.push("/artworks", { scroll: false })}
            className="ml-auto font-mono text-label-sm tracking-rail text-slate uppercase transition-colors hover:text-brass"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div
        id="filter-panel"
        className={`${open ? "grid" : "hidden"} grid-cols-1 gap-5 pt-6 sm:grid-cols-2 md:grid md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]`}
      >
        <div>
          <label htmlFor="f-craft" className={labelClass}>
            Craft
          </label>
          <select
            id="f-craft"
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
          <label htmlFor="f-artist" className={labelClass}>
            Artist
          </label>
          <select
            id="f-artist"
            value={current.artist}
            onChange={(e) => update("artist", e.target.value)}
            className={fieldClass}
          >
            <option value="">All artists</option>
            {artists.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-min" className={labelClass}>
            Min price (₹)
          </label>
          <input
            id="f-min"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={current.min}
            onBlur={(e) => update("min", e.target.value)}
            placeholder="0"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="f-max" className={labelClass}>
            Max price (₹)
          </label>
          <input
            id="f-max"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={current.max}
            onBlur={(e) => update("max", e.target.value)}
            placeholder="Any"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="f-sort" className={labelClass}>
            Sort
          </label>
          <select
            id="f-sort"
            value={current.sort}
            onChange={(e) => update("sort", e.target.value)}
            className={fieldClass}
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="title">Title, A–Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
