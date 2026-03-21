import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * Root page (/) redirect logic.
 * 
 * Why this is here:
 * This is a Server Component that runs when the root route is accessed.
 * In Next.js App Router, handling the initial entry point here ensures
 * a fast server-side redirect before any client-side code is shipped.
 */
export default async function HomePage() {
  const session = await getSession();

  // 1. If no session, automatically redirect to /login
  if (!session) {
    redirect("/login");
  }

  // 2. If authenticated, redirect based on user role
  const role = session.user.role;

  switch (role) {
    case "admin":
      redirect("/admin/dashboard");
      break;
    case "supervisor":
      redirect("/supervisor/dashboard");
      break;
    case "salesman":
      redirect("/salesman/dashboard");
      break;
    default:
      // Fallback for other roles (e.g., buyer/customer)
      redirect("/dashboard");
      break;
  }
}
