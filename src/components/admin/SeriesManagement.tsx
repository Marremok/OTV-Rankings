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
import { PlusIcon, Tv, ImageIcon, Loader2, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { AddSeriesDialog } from "./AddSeriesDialog"
import { EditSeriesDialog, SeriesData } from "./EditSeriesDialog"
import { useGetSeries } from "@/hooks/use-rankings"
import { useDeleteSeries } from "@/hooks/use-series"

function SeriesManagement() {
  const { data: series, isLoading, error, refetch } = useGetSeries()
  const deleteSeriesMutation = useDeleteSeries()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [seriesToEdit, setSeriesToEdit] = useState<SeriesData | null>(null)
  const [seriesToDelete, setSeriesToDelete] = useState<SeriesData | null>(null)

  // Open edit dialog
  const openEditDialog = (s: SeriesData, e: React.MouseEvent) => {
    e.stopPropagation()
    setSeriesToEdit(s)
    setEditDialogOpen(true)
  }

  // Open delete confirmation
  const openDeleteDialog = (s: SeriesData, e: React.MouseEvent) => {
    e.stopPropagation()
    setSeriesToDelete(s)
    setDeleteDialogOpen(true)
  }

  // Handle series deletion
  const handleDeleteSeries = async () => {
    if (!seriesToDelete) return

    try {
      await deleteSeriesMutation.mutateAsync(seriesToDelete.id)
      setDeleteDialogOpen(false)
      setSeriesToDelete(null)
    } catch (error) {
      console.error("Failed to delete series:", error)
    }
  }

  return (
    <>
      <Card className="mb-12">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tv className="size-6 text-primary" />
              Series Management
            </CardTitle>
            <CardDescription className="mt-2">
              Manage and oversee all series on your website
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          >
            <PlusIcon className="mr-1 size-4" />
            Add a TV-Series
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="size-12 mx-auto mb-4 animate-spin opacity-50" />
              <p>Loading series...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load series. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : !series || series.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tv className="size-12 mx-auto mb-4 opacity-20" />
              <p>No series added yet. Click "Add a TV-Series" to get started.</p>
            </div>
          ) : (
            <div className="max-h-150 overflow-y-auto pr-2">
              <div className="grid grid-cols-5 gap-4">
                {series.map((s) => (
                  <div
                    key={s.id}
                    className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    {/* Action buttons overlay */}
                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        onClick={(e) => openEditDialog(s as SeriesData, e)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={(e) => openDeleteDialog(s as SeriesData, e)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="aspect-2/3 bg-muted relative">
                      {s.imageUrl ? (
                        <img
                          src={s.imageUrl}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="size-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2 text-foreground">
                        {s.title}
                      </h3>
                      {s.releaseYear && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {s.releaseYear}
                        </p>
                      )}
                      {s.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.genre.slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                            >
                              {g}
                            </span>
                          ))}
                          {s.genre.length > 2 && (
                            <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                              +{s.genre.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddSeriesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddSeries={() => refetch()}
      />

      {/* Edit Series Dialog */}
      <EditSeriesDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        series={seriesToEdit}
        onSuccess={() => refetch()}
      />

      {/* Delete Series Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{seriesToDelete?.title}"?
              This will also delete all user ratings for this series.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSeries}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSeriesMutation.isPending}
            >
              {deleteSeriesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SeriesManagement
