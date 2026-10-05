import {
  isUploadedVideo,
  videoPlaybackUrl,
  videoPosterUrl,
} from "@kasityot/core/video";

/**
 * Plays an artist's video, whichever kind it is: a file they uploaded, or an
 * embed link the owner set by hand.
 */
export function VideoPlayer({ url, title }: { url: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink-raised">
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
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      )}
    </div>
  );
}
