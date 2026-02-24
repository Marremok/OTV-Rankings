"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLoginButton } from "./SocialLoginButton";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "sign-in" | "sign-up";
  onModeSwitch: () => void;
}

export function AuthDialog({ isOpen, onClose, mode, onModeSwitch }: AuthDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignUp = mode === "sign-up";

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeSwitch = () => {
    resetForm();
    onModeSwitch();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp.email({
          name,
          email,
          password,
        });

        if (res.error) {
          setError(res.error.message || "Something went wrong.");
          setIsLoading(false);
          return;
        }
      } else {
        const res = await signIn.email({
          email,
          password,
        });

        if (res.error) {
          setError(res.error.message || "Invalid email or password.");
          setIsLoading(false);
          return;
        }
      }

      router.push("/profile");
      handleClose();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {isSignUp ? "Create an account" : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isSignUp
                ? "Sign up to start rating and discovering great TV series"
                : "Sign in to continue to OTV-Rankings"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 space-y-6">
          {/* Google Sign In */}
          <SocialLoginButton
            onError={(error) => setError(error)}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>{isSignUp ? "Create account" : "Sign in"}</>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={handleModeSwitch}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={handleModeSwitch}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
