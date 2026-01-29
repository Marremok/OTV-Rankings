"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";

interface SignUpPageProps {
  isOpen: boolean;
  onClose: () => void;
}



export default function SignUpPage({ isOpen, onClose }: SignUpPageProps) {

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const res = await signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      router.push("/profile"),
      handleClose()
    }
  }

  const handleClose = () => {
    onClose();
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>Sign up to join our app!</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">

            {/* Namnraden: Förnamn och Efternamn bredvid varandra */}
            <div className="">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">
                  Full Name
                </label>
                <input
                  name="name"
                  type="name"
                  placeholder="Full Name"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm
                  shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none
                  focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Telefon */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium leading-none">
                Phone <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <input
                name="phone"
                type="phone"
                placeholder="070-123 45 67"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="namn@exempel.se"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Lösenord */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Footer med submit-knapp */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md
              text-sm font-medium transition-colors"
              
            >
              Register
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}