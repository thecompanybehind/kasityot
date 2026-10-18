import { redirect } from "next/navigation";
import { getWholesaler } from "@/lib/auth";

/**
 * The root has nothing of its own: a signed-in wholesaler wants the
 * catalogue, and anyone else wants to sign in or register.
 */
export default async function RootPage() {
  if (await getWholesaler()) redirect("/catalogue");
  redirect("/login");
}
