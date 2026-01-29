import { requireAdmin } from "@/lib/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const user = await requireAdmin();
  
  return <AdminDashboardClient />
}