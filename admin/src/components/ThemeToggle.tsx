"use client";

import { THEME_COOKIE } from "@/lib/theme";

/**
 * Flips the panel between its dark and light palettes.
 *
 * The theme lives on <html data-theme> and in a cookie, so layout.tsx can
 * render the right one on the server. The button holds no state of its own:
 * both icons are in the markup and the `light:` variant picks one.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light mode"
      title="Switch between dark and light mode"
      className="grid size-[38px] shrink-0 cursor-pointer place-items-center rounded-pill border border-brass/55 text-brass transition-colors hover:bg-brass hover:text-ink"
    >
      {/* Sun — shown in dark mode, since pressing it brings the light. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4 fill-none stroke-current stroke-[1.5] light:hidden"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          strokeLinecap="round"
          d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
        />
      </svg>
      {/* Moon — shown in light mode. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="hidden size-4 fill-none stroke-current stroke-[1.5] light:block"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        />
      </svg>
    </button>
  );
}
