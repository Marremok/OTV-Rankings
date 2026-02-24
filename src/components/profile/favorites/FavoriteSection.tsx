"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Heart, User, Pencil, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserFavorites, useRemoveUserFavorite, useReorderUserFavorites, useSetUserFavorite } from "@/hooks/use-favorites"
import type { FavoriteItem } from "@/lib/actions/favorites"
import { FavoriteCard } from "./FavoriteCard"
import { AddFavoriteDialog } from "./AddFavoriteDialog"

// ============================================
// SORTABLE WRAPPER — full-card drag (no handle)
// ============================================

interface SortableFavoriteCardProps {
  id: string
  item: FavoriteItem | null
  rank: number
  isOwner: boolean
  isEditMode: boolean
  mediaType: "SERIES" | "CHARACTER"
  ownerName?: string
  onRemove: (mediaId: string) => void
  onAddClick: () => void
}

function SortableFavoriteCard({
  id,
  item,
  rank,
  isOwner,
  isEditMode,
  mediaType,
  ownerName,
  onRemove,
  onAddClick,
}: SortableFavoriteCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !item || !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(item && isEditMode ? listeners : {})}
      className={cn(item && isEditMode && "touch-none")}
    >
      <FavoriteCard
        item={item}
        rank={rank}
        isOwner={isOwner}
        isEditMode={isEditMode}
        mediaType={mediaType}
        ownerName={ownerName}
        onRemove={onRemove}
        onAddClick={onAddClick}
      />
    </div>
  )
}

// ============================================
// MAIN SECTION
// ============================================

export interface FavoriteSectionProps {
  userId: string
  isOwner: boolean
  mediaType: "SERIES" | "CHARACTER"
  title: string
  ownerName?: string
}

export function FavoriteSection({ userId, isOwner, mediaType, title, ownerName }: FavoriteSectionProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [targetRank, setTargetRank] = useState(1)

  const { data: favorites, isLoading } = useUserFavorites(userId)
  const removeFavorite = useRemoveUserFavorite()
  const reorderFavorites = useReorderUserFavorites()
  const setFavorite = useSetUserFavorite()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const items: FavoriteItem[] =
    (mediaType === "SERIES" ? favorites?.series : favorites?.characters) ?? []

  // Build 4-slot display array
  const slots: (FavoriteItem | null)[] = [1, 2, 3, 4].map(
    (rank) => items.find((item) => item.rank === rank) ?? null
  )

  // dnd-kit needs stable string ids for each slot
  const sortableIds = slots.map((item, idx) => item?.id ?? `empty-${idx + 1}`)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortableIds.indexOf(active.id as string)
    const newIndex = sortableIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(slots, oldIndex, newIndex)
    const filledItems = reordered.filter(Boolean) as FavoriteItem[]
    const newOrder = filledItems.map((item, idx) => ({
      mediaId: item.mediaId,
      rank: idx + 1,
    }))

    reorderFavorites.mutate({ userId, mediaType, newOrder })
  }

  function handleRemove(mediaId: string) {
    removeFavorite.mutate({ userId, mediaType, mediaId })
  }

  function handleAddClick(rank: number) {
    setTargetRank(rank)
    setAddDialogOpen(true)
  }

  function handleAddConfirm(mediaId: string, rank: number) {
    setFavorite.mutate({ userId, mediaType, rank, mediaId })
  }

  const TitleIcon = mediaType === "CHARACTER" ? User : Heart
  const hasSpace = items.length < 4

  // Public profile with no favorites — show simple empty state
  if (!isLoading && !isOwner && items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TitleIcon className="w-5 h-5 text-primary" />
            {title}
          </h2>
        </div>
        <div className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-6">
          <p className="text-sm text-zinc-500 text-center">No favorites added yet.</p>
        </div>
      </div>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TitleIcon className="w-5 h-5 text-primary" />
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-2/3 rounded-xl bg-zinc-800/60 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <TitleIcon className="w-5 h-5 text-primary" />
          {title}
          {items.length > 0 && (
            <span className="text-sm font-normal text-zinc-500">({items.length}/4)</span>
          )}
        </h2>

        {isOwner && (
          <button
            onClick={() => setIsEditMode((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-700/60 hover:border-zinc-600 transition-all duration-200"
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Done
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </>
            )}
          </button>
        )}
      </div>

      {/* Cards grid */}
      {isEditMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {slots.map((item, idx) => (
                <SortableFavoriteCard
                  key={sortableIds[idx]}
                  id={sortableIds[idx]}
                  item={item}
                  rank={idx + 1}
                  isOwner={isOwner}
                  isEditMode={isEditMode}
                  mediaType={mediaType}
                  ownerName={ownerName}
                  onRemove={handleRemove}
                  onAddClick={() => handleAddClick(idx + 1)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {slots.map((item, idx) => (
            <FavoriteCard
              key={item?.id ?? `empty-${idx + 1}`}
              item={item}
              rank={idx + 1}
              isOwner={isOwner}
              isEditMode={false}
              mediaType={mediaType}
              ownerName={ownerName}
            />
          ))}
        </div>
      )}

      {/* Add button (shown in edit mode when fewer than 4) */}
      {isOwner && isEditMode && hasSpace && (
        <div className="text-center">
          <button
            onClick={() => {
              const nextEmptyRank = [1, 2, 3, 4].find(
                (r) => !items.find((item) => item.rank === r)
              ) ?? 1
              handleAddClick(nextEmptyRank)
            }}
            className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            + Add favorite
          </button>
        </div>
      )}

      {/* Add dialog */}
      <AddFavoriteDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        mediaType={mediaType}
        currentFavorites={items}
        targetRank={targetRank}
        onConfirm={handleAddConfirm}
      />
    </div>
  )
}
