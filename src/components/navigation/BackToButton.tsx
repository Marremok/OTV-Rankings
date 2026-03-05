"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"

interface BackToButtonProps {
  fallback: string
  fallbackLabel: string
  className?: string
}

function BackToButtonInner({ fallback, fallbackLabel, className }: BackToButtonProps) {
  const searchParams = useSearchParams()
  const backHref = searchParams.get("backHref")
  const backLabel = searchParams.get("backLabel")

  const href = backHref ?? fallback
  const label = backLabel ?? fallbackLabel

  return (
    <Link
      href={href}
      className={className ?? "group flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 transition-all duration-300 hover:bg-black/50 hover:border-white/20 hover:scale-105"}
    >
      <ArrowLeft className="h-4 w-4 text-white/70 group-hover:text-white transition-all duration-300 group-hover:-translate-x-0.5" />
      <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
        Back to {label}
      </span>
    </Link>
  )
}

function FallbackBackLink({ fallback, fallbackLabel, className }: BackToButtonProps) {
  return (
    <Link
      href={fallback}
      className={className ?? "group flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 transition-all duration-300 hover:bg-black/50 hover:border-white/20 hover:scale-105"}
    >
      <ArrowLeft className="h-4 w-4 text-white/70 group-hover:text-white transition-all duration-300 group-hover:-translate-x-0.5" />
      <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
        Back to {fallbackLabel}
      </span>
    </Link>
  )
}

export function BackToButton(props: BackToButtonProps) {
  return (
    <Suspense fallback={<FallbackBackLink {...props} />}>
      <BackToButtonInner {...props} />
    </Suspense>
  )
}
