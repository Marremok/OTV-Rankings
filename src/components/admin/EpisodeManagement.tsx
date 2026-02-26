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
import { PlusIcon, ImageIcon, Loader2, Pencil, Trash2, Tv } from "lucide-react"
import { useState } from "react"
import { AddEpisodeDialog, EpisodeData } from "./AddEpisodeDialog"
import { EditEpisodeDialog } from "./EditEpisodeDialog"
import { useGetAllEpisodes, useDeleteEpisode } from "@/hooks/use-episodes"

function EpisodeManagement() {
  const { data: episodes, isLoading, error, refetch } = useGetAllEpisodes()
  const deleteEpisodeMutation = useDeleteEpisode()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [episodeToEdit, setEpisodeToEdit] = useState<EpisodeData | null>(null)
  const [episodeToDelete, setEpisodeToDelete] = useState<EpisodeData | null>(null)

  const openEditDialog = (episode: EpisodeData, e: React.MouseEvent) => {
    e.stopPropagation()
    setEpisodeToEdit(episode)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (episode: EpisodeData, e: React.MouseEvent) => {
    e.stopPropagation()
    setEpisodeToDelete(episode)
    setDeleteDialogOpen(true)
  }

  const handleDeleteEpisode = async () => {
    if (!episodeToDelete) return

    try {
      await deleteEpisodeMutation.mutateAsync(episodeToDelete.id)
      setDeleteDialogOpen(false)
      setEpisodeToDelete(null)
    } catch (error) {
      console.error("Failed to delete episode:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Episode Management
            </CardTitle>
            <CardDescription>
              Manage individual episodes across all seasons
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Episode
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
            <p className="text-sm text-destructive mb-2">Failed to load episodes</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && episodes && (
          <div className="space-y-2">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="group flex items-center gap-4 rounded-lg border bg-card p-3 hover:border-primary/50 transition-colors"
              >
                {/* Hero thumbnail */}
                <div className="relative aspect-video w-24 shrink-0 rounded overflow-hidden bg-muted">
                  {episode.heroImageUrl ? (
                    <img
                      src={episode.heroImageUrl}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{episode.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {episode.season?.series?.title} — S{episode.season?.seasonNumber}E{episode.episodeNumber}
                  </p>
                  {episode.slug && (
                    <p className="text-xs text-muted-foreground font-mono truncate">{episode.slug}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => openEditDialog(episode as EpisodeData, e)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => openDeleteDialog(episode as EpisodeData, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {episodes.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Tv className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No episodes yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setDialogOpen(true)}>
                  Add First Episode
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AddEpisodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddEpisode={() => {}}
      />

      <EditEpisodeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        episode={episodeToEdit}
        onSuccess={() => refetch()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Episode</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{episodeToDelete?.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteEpisode}
              disabled={deleteEpisodeMutation.isPending}
            >
              {deleteEpisodeMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default EpisodeManagement
