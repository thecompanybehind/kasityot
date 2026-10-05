import {
  isUploadedVideo,
  videoPlaybackUrl,
  videoPosterUrl,
} from "@kasityot/core/video";

/**
 * The frame an artist's video plays in, on their profile and beneath each of
 * their pieces.
 *
 * A video is either a file the artist uploaded from their studio or an embed
 * link the owner set by hand; this is the one place that tells them apart.
 * Nothing loads until the visitor presses play — a video below the fold must
 * not cost the page its first paint.
 */
export function ArtistVideo({
  url,
  name,
  wide = false,
  className = "",
}: {
  url: string;
  name: string;
  /** The profile's centrepiece size; otherwise the smaller frame beside a piece. */
  wide?: boolean;
  className?: string;
}) {
  const title = `${name} at work`;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-ink-raised ${wide ? "max-w-[1230px]" : "max-w-[820px]"} ${className}`}
    >
      {isUploadedVideo(url) ? (
        <video
          src={videoPlaybackUrl(url)}
          poster={videoPosterUrl(url)}
          controls
          playsInline
          preload="none"
          aria-label={title}
          className="absolute inset-0 size-full object-contain"
        />
      ) : (
        <iframe
          src={url}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      )}
    </div>
  );
}
