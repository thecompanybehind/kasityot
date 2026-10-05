/**
 * Artist videos, as stored and as played.
 *
 * A video is either a file the artist uploaded to Cloudinary or a YouTube
 * embed link the owner pasted. The two need different markup, and an uploaded
 * file is never played as it arrived: phones record in formats and sizes a
 * browser may not play, so playback always goes through one fixed transform.
 *
 * This module is pure — no Mongoose — so client components may import it
 * through "@kasityot/core/video" without dragging the models into a bundle.
 */

/** Where studio uploads land; the submit action only accepts URLs under it. */
export const VIDEO_FOLDER = "kasityot/videos";

/** Phones record in these; anything else is refused at upload. */
export const VIDEO_FORMATS = "mp4,mov,webm,m4v";

/** Cloudinary's ceiling for a single video on the plan in use. */
export const VIDEO_MAX_BYTES = 100 * 1024 * 1024;

/**
 * The one transform every uploaded video is played through.
 *
 * It is also requested at upload time (see VIDEO_EAGER), because Cloudinary
 * refuses to transcode a large file on first request. Change it here and both
 * stay in step.
 */
const DELIVERY = "c_limit,w_1280,q_auto";

/** The `eager` upload parameter that pre-builds the playback rendition. */
export const VIDEO_EAGER = `${DELIVERY}/mp4`;

const UPLOADED = /^https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//;

/** True for a file on Cloudinary; false for an embed link such as YouTube. */
export function isUploadedVideo(url: string): boolean {
  return UPLOADED.test(url);
}

function deliver(url: string, extension: string): string {
  return url
    .replace("/video/upload/", `/video/upload/${DELIVERY}/`)
    .replace(/\.[a-z0-9]+$/i, `.${extension}`);
}

/** An MP4 any browser can play, whatever the artist's phone recorded. */
export function videoPlaybackUrl(url: string): string {
  return deliver(url, "mp4");
}

/** A still frame, shown before the visitor presses play. */
export function videoPosterUrl(url: string): string {
  return deliver(url, "jpg");
}
