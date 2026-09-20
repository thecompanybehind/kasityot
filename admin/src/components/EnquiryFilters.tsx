"use client";

import { useRouter, useSearchParams } from "next/navigation";

const field =
  "w-full min-w-0 border border-brass/35 bg-transparent px-4 py-2.5 font-mono text-label tracking-rail text-bone uppercase outline-none transition-colors focus:border-brass";

export function EnquiryFilters({
  artworks,
  current,
}: {
  artworks: { id: string; title: string }[];
  current: { status: string; artwork: string };
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/enquiries?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[1fr_2fr_auto]">
      <select
        value={current.status}
        onChange={(e) => update("status", e.target.value)}
        aria-label="Filter by status"
        className={field}
      >
        <option value="">All statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="closed">Closed</option>
      </select>
      <select
        value={current.artwork}
        onChange={(e) => update("artwork", e.target.value)}
        aria-label="Filter by artwork"
        className={field}
      >
        <option value="">All artworks</option>
        {artworks.map((a) => (
          <option key={a.id} value={a.id}>
            {a.title}
          </option>
        ))}
      </select>
      {current.status || current.artwork ? (
        <button
          type="button"
          onClick={() => router.push("/enquiries", { scroll: false })}
          className="cursor-pointer border border-bone/25 px-4 py-2.5 font-mono text-label tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
