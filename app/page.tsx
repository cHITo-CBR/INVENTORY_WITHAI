import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.user.role === "admin") {
      redirect("/admin/approvals");
    } else {
      redirect("/dashboard");
    }
  }

  // If no session, go to login
  redirect("/login");
}
