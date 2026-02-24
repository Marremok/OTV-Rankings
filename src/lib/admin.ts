import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  const user = session?.user;
  
  // Kontrollera om användaren är inloggad
  if (!user) {
    redirect("/");
  }
  
  // Kontrollera om användaren har admin-roll
  if (user.role !== "admin") {
    redirect("/"); // Skicka tillbaka till startsidan
  }
  
  return user;
}