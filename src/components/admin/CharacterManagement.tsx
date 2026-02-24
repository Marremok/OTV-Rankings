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
import { PlusIcon, Users, ImageIcon, Loader2, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { AddCharacterDialog, Character } from "./AddCharacterDialog"
import { EditCharacterDialog, CharacterData } from "./EditCharacterDialog"
import { useGetAllCharacters, useDeleteCharacter } from "@/hooks/use-characters"

function CharacterManagement() {
  const { data: characters, isLoading, error, refetch } = useGetAllCharacters()
  const deleteCharacterMutation = useDeleteCharacter()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [characterToEdit, setCharacterToEdit] = useState<CharacterData | null>(null)
  const [characterToDelete, setCharacterToDelete] = useState<CharacterData | null>(null)

  // Open edit dialog
  const openEditDialog = (character: CharacterData, e: React.MouseEvent) => {
    e.stopPropagation()
    setCharacterToEdit(character)
    setEditDialogOpen(true)
  }

  // Open delete confirmation
  const openDeleteDialog = (character: CharacterData, e: React.MouseEvent) => {
    e.stopPropagation()
    setCharacterToDelete(character)
    setDeleteDialogOpen(true)
  }

  // Handle character deletion
  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return

    try {
      await deleteCharacterMutation.mutateAsync(characterToDelete.id)
      setDeleteDialogOpen(false)
      setCharacterToDelete(null)
    } catch (error) {
      console.error("Failed to delete character:", error)
    }
  }

  return (
    <>
      <Card className="mb-12">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-6 text-primary" />
              Character Management
            </CardTitle>
            <CardDescription className="mt-2">
              Manage characters across all TV series
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          >
            <PlusIcon className="mr-1 size-4" />
            Add Character
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="size-12 mx-auto mb-4 animate-spin opacity-50" />
              <p>Loading characters...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load characters. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : !characters || characters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="size-12 mx-auto mb-4 opacity-20" />
              <p>No characters added yet. Click "Add Character" to get started.</p>
            </div>
          ) : (
            <div className="max-h-150 overflow-y-auto pr-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    {/* Action buttons overlay */}
                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        onClick={(e) => openEditDialog(character as CharacterData, e)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={(e) => openDeleteDialog(character as CharacterData, e)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="aspect-2/3 bg-muted relative">
                      {character.posterUrl ? (
                        <img
                          src={character.posterUrl}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="size-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2 text-foreground">
                        {character.name}
                      </h3>
                      {character.series && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {character.series.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddCharacterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddCharacter={() => refetch()}
      />

      {/* Edit Character Dialog */}
      <EditCharacterDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        character={characterToEdit}
        onSuccess={() => refetch()}
      />

      {/* Delete Character Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{characterToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCharacter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCharacterMutation.isPending}
            >
              {deleteCharacterMutation.isPending ? (
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

export default CharacterManagement
