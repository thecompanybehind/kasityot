import {
  Schema,
  Types,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * An approved artist's login credentials.
 *
 * Deliberately a separate collection rather than fields on Artist. Artist
 * documents are serialised into ArtistView and handed to client components
 * throughout the public site and the owner panel; a password hash living on
 * that document would be one careless spread away from reaching a browser.
 * Keeping it here means no existing code path can leak it.
 *
 * Nothing in this collection is ever serialised for a client component.
 */
const ArtistUserSchema = new Schema(
  {
    artistId: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    /** Null until the artist redeems their invite and chooses a password. */
    passwordHash: { type: String, default: null },

    /**
     * Single-use invite, stored as a SHA-256 hash. The raw token exists only
     * in the link the owner hands over, so a database read — a backup, a
     * support query, a leak — never yields a working way in.
     */
    inviteTokenHash: { type: String, default: null },
    inviteExpiresAt: { type: Date, default: null },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type ArtistUserDoc = InferSchemaType<typeof ArtistUserSchema> & {
  _id: string;
  artistId: Types.ObjectId;
};

export const ArtistUser: Model<ArtistUserDoc> =
  (models.ArtistUser as Model<ArtistUserDoc>) ??
  model<ArtistUserDoc>("ArtistUser", ArtistUserSchema);
