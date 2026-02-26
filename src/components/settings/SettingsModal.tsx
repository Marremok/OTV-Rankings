"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient, signOut } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { User, Lock, AlertTriangle, LogOut, Loader2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// TABS
// ============================================

type Tab = "account" | "security" | "danger"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "account",  label: "Account",    icon: User },
  { id: "security", label: "Security",   icon: Lock },
  { id: "danger",   label: "Danger Zone", icon: AlertTriangle },
]

// ============================================
// MAIN MODAL
// ============================================

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("account")
  const { data: session } = useSession()
  const user = session?.user

  // Detect if user has email/password (not OAuth-only)
  // Better Auth exposes session.user.accounts — if all accounts are OAuth the password section is hidden
  const hasPasswordAuth = (user as { accounts?: { providerId?: string }[] } | undefined)
    ?.accounts?.some((a) => a.providerId === "credential") ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border-zinc-800 bg-zinc-950">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800/60">
          <DialogTitle className="text-lg font-bold text-white">Settings</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[380px]">
          {/* Sidebar tabs */}
          <nav className="w-36 shrink-0 border-r border-zinc-800/60 py-4 flex flex-col gap-1 px-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-left",
                  activeTab === id
                    ? "bg-primary/15 text-primary"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60",
                  id === "danger" && activeTab !== "danger" && "hover:text-red-400"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "account" && <AccountTab user={user} onClose={() => onOpenChange(false)} />}
            {activeTab === "security" && <SecurityTab hasPasswordAuth={hasPasswordAuth} />}
            {activeTab === "danger"   && <DangerTab onClose={() => onOpenChange(false)} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// ACCOUNT TAB
// ============================================

function AccountTab({ user, onClose }: { user: { name?: string | null; email?: string } | undefined; onClose: () => void }) {
  const [name, setName] = useState(user?.name ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === user?.name) return
    setSaving(true)
    try {
      await authClient.updateUser({ name: trimmed })
      toast.success("Username updated successfully")
      onClose()
    } catch {
      toast.error("Failed to update username")
    } finally {
      setSaving(false)
    }
  }

  const email = typeof user?.email === "string"
    ? user.email
    : (user?.email as unknown as { email: string }[] | undefined)?.[0]?.email ?? ""

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-zinc-200">Account Details</h3>
        <p className="text-xs text-zinc-500">Update your display name.</p>
      </div>

      <div className="space-y-4">
        {/* Email — read only */}
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Email</Label>
          <Input
            value={email}
            readOnly
            className="bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-default focus-visible:ring-0"
          />
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Display Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-zinc-900/60 border-zinc-700 text-zinc-100 focus-visible:ring-primary/40"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !name.trim() || name.trim() === user?.name}
          className="w-full"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}

// ============================================
// SECURITY TAB
// ============================================

function SecurityTab({ hasPasswordAuth }: { hasPasswordAuth: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword]         = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent]         = useState(false)
  const [showNew, setShowNew]                 = useState(false)
  const [saving, setSaving]                   = useState(false)

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setSaving(true)
    try {
      await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: false })
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Failed to change password. Check your current password.")
    } finally {
      setSaving(false)
    }
  }

  if (!hasPasswordAuth) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 text-center h-full min-h-[200px]">
        <Lock className="w-10 h-10 text-zinc-700" />
        <p className="text-sm text-zinc-400 font-medium">Password not available</p>
        <p className="text-xs text-zinc-600 max-w-[220px]">
          Your account uses Google sign-in. Password management is handled by Google.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-zinc-200">Change Password</h3>
        <p className="text-xs text-zinc-500">Choose a strong password of at least 8 characters.</p>
      </div>

      <div className="space-y-4">
        <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
        <PasswordField label="New Password"     value={newPassword}     onChange={setNewPassword}     show={showNew}     onToggle={() => setShowNew(v => !v)} />
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Confirm New Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-zinc-900/60 border-zinc-700 text-zinc-100 focus-visible:ring-primary/40"
          />
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="w-full"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Update Password
        </Button>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-zinc-400">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="bg-zinc-900/60 border-zinc-700 text-zinc-100 focus-visible:ring-primary/40 pr-10"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

// ============================================
// DANGER TAB
// ============================================

function DangerTab({ onClose }: { onClose: () => void }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmText, setConfirmText]           = useState("")
  const [deleting, setDeleting]                 = useState(false)

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return
    setDeleting(true)
    try {
      await authClient.deleteUser()
      toast.success("Account deleted")
      onClose()
    } catch {
      toast.error("Failed to delete account")
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Sign out */}
      <div className="rounded-xl border border-zinc-800/60 p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-200">Sign Out</p>
          <p className="text-xs text-zinc-500 mt-0.5">Sign out of your account on this device.</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      {/* Delete account */}
      <div className="rounded-xl border border-red-900/40 p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-red-400">Delete Account</p>
          <p className="text-xs text-zinc-500 mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
        </div>

        {!confirmingDelete ? (
          <Button variant="destructive" onClick={() => setConfirmingDelete(true)} className="gap-2 bg-red-900/40 hover:bg-red-800 border border-red-800 text-red-300 hover:text-white">
            <AlertTriangle className="w-4 h-4" />
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:</p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="bg-zinc-900/60 border-red-900/50 text-zinc-100 focus-visible:ring-red-500/40 font-mono"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setConfirmingDelete(false); setConfirmText("") }} className="flex-1 border-zinc-700 text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || deleting}
                className="flex-1 bg-red-800 hover:bg-red-700"
              >
                {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
