"use client"


import LoadingUI from "@/components/admin/loadingUI";
import SeriesManagement from "@/components/admin/SeriesManagement";
import PillarManagement from "@/components/admin/PillarManagement";
import CharacterManagement from "@/components/admin/CharacterManagement";
import Navbar from "@/components/Navbar"

import { useSession } from "@/lib/auth-client";
import { SettingsIcon } from "lucide-react"
import { useEffect, useState } from "react";

function AdminDashboardClient() {
  const { data: session, isPending } = useSession();
  const user = session?.user as any;
  
  // calc stats from the real data
   const stats = {

  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pt-8 md:pt-10">
        {/* ADMIN WELCOME SECTION */}
        <div className="mb-12 flex items-center justify-between bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-5 md:p-8 border border-primary/20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">Admin Dashboard</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name || "Admin"}!
              </h1>
              <p className="text-muted-foreground">
                Manage Series, characters and episodes. Or maybe add some more?
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <SettingsIcon className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>
        <SeriesManagement />
        <CharacterManagement />
        <PillarManagement />
      </div>
    </div>
  );
}

export default AdminDashboardClient
