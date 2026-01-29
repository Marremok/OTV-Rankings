"use client"

import Hero from "@/components/home/hero";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background">
      <Hero />
    </div>
  );
}
