import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * Home page — server component.
 * Redirects to /feed if authenticated, otherwise to /login.
 */
export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/feed");
  } else {
    redirect("/login");
  }
}
