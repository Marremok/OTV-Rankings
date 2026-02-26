"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlusIcon, ImageIcon, Loader2, Pencil, Trash2, Layers } from "lucide-react"
import { useState } from "react"
import { AddSeasonDialog, SeasonData } from "./AddSeasonDialog"
import { EditSeasonDialog } from "./EditSeasonDialog"
import { useGetAllSeasons, useDeleteSeason } from "@/hooks/use-seasons"

function SeasonManagement() {
  const { data: seasons, isLoading, error, refetch } = useGetAllSeasons()
  const deleteSeasonMutation = useDeleteSeason()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [seasonToEdit, setSeasonToEdit] = useState<SeasonData | null>(null)
  const [seasonToDelete, setSeasonToDelete] = useState<SeasonData | null>(null)

  const openEditDialog = (season: SeasonData, e: React.MouseEvent) => {
    e.stopPropagation()
    setSeasonToEdit(season)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (season: SeasonData, e: React.MouseEvent) => {
    e.stopPropagation()
    setSeasonToDelete(season)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSeason = async () => {
    if (!seasonToDelete) return

    try {
      await deleteSeasonMutation.mutateAsync(seasonToDelete.id)
      setDeleteDialogOpen(false)
      setSeasonToDelete(null)
    } catch (error) {
      console.error("Failed to delete season:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Season Management
            </CardTitle>
            <CardDescription>
              Manage seasons across all TV series
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Season
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-sm text-destructive mb-2">Failed to load seasons</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && seasons && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="relative group rounded-lg border bg-card p-3 hover:border-primary/50 transition-colors"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full rounded overflow-hidden bg-muted mb-3">
                  {season.posterUrl ? (
                    <img
                      src={season.posterUrl}
                      alt={`Season ${season.seasonNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-0.5">
                  <p className="font-medium text-sm truncate">
                    Season {season.seasonNumber}{season.name ? `: ${season.name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {(season as any).series?.title || "Unknown Series"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {season.episodes?.length ?? 0} episodes
                  </p>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => openEditDialog(season as SeasonData, e)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => openDeleteDialog(season as SeasonData, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {seasons.length === 0 && (
              <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                <Layers className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No seasons yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setDialogOpen(true)}>
                  Add First Season
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AddSeasonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddSeason={() => {}}
      />

      <EditSeasonDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        season={seasonToEdit}
        onSuccess={() => refetch()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Season</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>Season {seasonToDelete?.seasonNumber}{seasonToDelete?.name ? `: ${seasonToDelete.name}` : ""}</strong>?
              This will also delete all episodes in this season. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteSeason}
              disabled={deleteSeasonMutation.isPending}
            >
              {deleteSeasonMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default SeasonManagement
