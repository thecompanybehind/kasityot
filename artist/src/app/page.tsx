import { redirect } from "next/navigation";
import { getArtistSession } from "@/lib/auth";

/**
 * The root has nothing of its own: a signed-in artist wants their studio, and
 * anyone else wants to apply.
 */
export default async function RootPage() {
  if (await getArtistSession()) redirect("/studio");
  redirect("/join");
}
