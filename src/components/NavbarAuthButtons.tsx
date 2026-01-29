"use client"


import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { UserButton } from "./UserButton"

export function NavbarAuthButtons({
  setIsLogInDialogOpen,
  setIsSignUpDialogOpen,
}: {
  setIsLogInDialogOpen: (v: boolean) => void
  setIsSignUpDialogOpen: (v: boolean) => void
}) {
  const { data: session, isPending } = useSession()
  const user = session?.user as any;

  // While session is loading, render nothing to prevent flash
  if (isPending) {
    return <div className="flex items-center gap-3 w-30" />
  }

  // OM inloggad → visa inga knappar
  if (session) {
    return (
      <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">
                {user?.name} {user?.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email?.[0]?.email}
              </span>
            </div>

            <UserButton />
          </div>
        </div>
    )
  }

  // OM INTE inloggad → visa knappar
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={() => setIsLogInDialogOpen(true)}
        variant="ghost"
      >
        Log In
      </Button>

      <Button
        onClick={() => setIsSignUpDialogOpen(true)}
        variant="default"
        className="bg-primary"
      >
        Sign Up
      </Button>
    </div>
  )
}
