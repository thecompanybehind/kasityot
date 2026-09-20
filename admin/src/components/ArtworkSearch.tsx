"use client";

import { useRouter, useSearchParams } from "next/navigation";

const field =
  "w-full min-w-0 border border-brass/35 bg-transparent px-4 py-2.5 font-mono text-label tracking-rail text-bone uppercase outline-none transition-colors focus:border-brass";

export function ArtworkSearch({
  artists,
  current,
}: {
  artists: { id: string; name: string }[];
  current: { q: string; status: string; artist: string };
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/artworks?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[2fr_1fr_1fr]">
      <input
        type="search"
        defaultValue={current.q}
        placeholder="Search by title"
        onBlur={(e) => update("q", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("q", e.currentTarget.value);
        }}
        aria-label="Search artworks by title"
        className={field}
      />
      <select
        value={current.status}
        onChange={(e) => update("status", e.target.value)}
        aria-label="Filter by status"
        className={field}
      >
        <option value="">All statuses</option>
        <option value="available">Available</option>
        <option value="sold">Sold</option>
        <option value="hidden">Hidden</option>
      </select>
      <select
        value={current.artist}
        onChange={(e) => update("artist", e.target.value)}
        aria-label="Filter by artist"
        className={field}
      >
        <option value="">All artists</option>
        {artists.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
