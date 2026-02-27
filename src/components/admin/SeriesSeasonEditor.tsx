"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2,
} from "lucide-react"
import {
  useGetSeasonsBySeries,
  useCreateSeason,
  useEditSeason,
  useDeleteSeason,
} from "@/hooks/use-seasons"
import {
  useCreateEpisode,
  useEditEpisode,
  useDeleteEpisode,
} from "@/hooks/use-episodes"
import type { SeasonWithEpisodes } from "@/lib/actions/seasons"
import type { Episode } from "@/generated/prisma/client"
import { AdminImageUpload } from "@/components/admin/AdminImageUpload"

interface SeriesSeasonEditorProps {
  seriesId: string
}

export function SeriesSeasonEditor({ seriesId }: SeriesSeasonEditorProps) {
  const { data: rawSeasons = [], isLoading } = useGetSeasonsBySeries(seriesId)
  const seasons = rawSeasons as SeasonWithEpisodes[]

  const createSeason = useCreateSeason()
  const editSeason = useEditSeason()
  const deleteSeason = useDeleteSeason()
  const createEpisode = useCreateEpisode()
  const editEpisode = useEditEpisode()
  const deleteEpisode = useDeleteEpisode()

  // Expanded / editing season state
  const [expandedSeasonId, setExpandedSeasonId] = useState<string | null>(null)
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null)
  const [addingSeasonForm, setAddingSeasonForm] = useState(false)

  // Expanded / editing episode state
  const [addEpisodeForSeasonId, setAddEpisodeForSeasonId] = useState<string | null>(null)
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null)

  // Season inline-form fields
  const [sNum, setSNum] = useState("")
  const [sName, setSName] = useState("")
  const [sDescription, setSDescription] = useState("")
  const [sPosterUrl, setSPosterUrl] = useState("")
  const [sHeroImageUrl, setSHeroImageUrl] = useState("")

  // Episode inline-form fields
  const [eNum, setENum] = useState("")
  const [eTitle, setETitle] = useState("")
  const [eDescription, setEDescription] = useState("")
  const [eHeroImageUrl, setEHeroImageUrl] = useState("")

  // ----------------------------------------
  // Season handlers
  // ----------------------------------------

  function openAddSeason() {
    setEditingSeasonId(null)
    setSNum(String(seasons.length + 1))
    setSName("")
    setSDescription("")
    setSPosterUrl("")
    setSHeroImageUrl("")
    setAddingSeasonForm(true)
  }

  function cancelAddSeason() {
    setAddingSeasonForm(false)
    setSNum("")
    setSName("")
    setSDescription("")
    setSPosterUrl("")
    setSHeroImageUrl("")
  }

  async function handleAddSeason() {
    const n = parseInt(sNum)
    if (isNaN(n) || n < 1) return
    await createSeason.mutateAsync({
      seriesId,
      seasonNumber: n,
      name: sName.trim() || null,
      description: sDescription.trim() || null,
      posterUrl: sPosterUrl || null,
      heroImageUrl: sHeroImageUrl || null,
    })
    cancelAddSeason()
  }

  function openEditSeason(season: SeasonWithEpisodes) {
    setAddingSeasonForm(false)
    setEditingSeasonId(season.id)
    setSNum(String(season.seasonNumber))
    setSName(season.name ?? "")
    setSDescription(season.description ?? "")
    setSPosterUrl(season.posterUrl ?? "")
    setSHeroImageUrl(season.heroImageUrl ?? "")
  }

  function cancelEditSeason() {
    setEditingSeasonId(null)
    setSNum("")
    setSName("")
    setSDescription("")
    setSPosterUrl("")
    setSHeroImageUrl("")
  }

  async function handleSaveSeason(season: SeasonWithEpisodes) {
    const n = parseInt(sNum)
    if (isNaN(n) || n < 1) return
    await editSeason.mutateAsync({
      id: season.id,
      seriesId,
      seasonNumber: n,
      name: sName.trim() || null,
      description: sDescription.trim() || null,
      posterUrl: sPosterUrl || null,
      heroImageUrl: sHeroImageUrl || null,
    })
    cancelEditSeason()
  }

  async function handleDeleteSeason(id: string) {
    await deleteSeason.mutateAsync(id)
    if (expandedSeasonId === id) setExpandedSeasonId(null)
  }

  // ----------------------------------------
  // Episode handlers
  // ----------------------------------------

  function openAddEpisode(seasonId: string, episodeCount: number) {
    setEditingEpisodeId(null)
    setAddEpisodeForSeasonId(seasonId)
    setENum(String(episodeCount + 1))
    setETitle("")
    setEDescription("")
    setEHeroImageUrl("")
  }

  function cancelAddEpisode() {
    setAddEpisodeForSeasonId(null)
    setENum("")
    setETitle("")
    setEDescription("")
    setEHeroImageUrl("")
  }

  async function handleAddEpisode(seasonId: string) {
    const n = parseInt(eNum)
    if (isNaN(n) || n < 1 || !eTitle.trim()) return
    await createEpisode.mutateAsync({
      seasonId,
      seriesId,
      episodeNumber: n,
      title: eTitle.trim(),
      description: eDescription.trim() || null,
      heroImageUrl: eHeroImageUrl || null,
    })
    cancelAddEpisode()
  }

  function openEditEpisode(episode: Episode) {
    setAddEpisodeForSeasonId(null)
    setEditingEpisodeId(episode.id)
    setENum(String(episode.episodeNumber))
    setETitle(episode.title)
    setEDescription((episode as any).description ?? "")
    setEHeroImageUrl((episode as any).heroImageUrl ?? "")
  }

  function cancelEditEpisode() {
    setEditingEpisodeId(null)
    setENum("")
    setETitle("")
    setEDescription("")
    setEHeroImageUrl("")
  }

  async function handleSaveEpisode(episode: Episode) {
    const n = parseInt(eNum)
    if (isNaN(n) || n < 1 || !eTitle.trim()) return
    await editEpisode.mutateAsync({
      id: episode.id,
      seasonId: episode.seasonId,
      seriesId,
      episodeNumber: n,
      title: eTitle.trim(),
      description: eDescription.trim() || null,
      heroImageUrl: eHeroImageUrl || null,
    })
    cancelEditEpisode()
  }

  async function handleDeleteEpisode(id: string) {
    await deleteEpisode.mutateAsync(id)
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="size-3 animate-spin" />
        Loading seasons…
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Season list */}
      {seasons.map((season) => {
        const episodes = (season as any).episodes as Episode[]
        const isExpanded = expandedSeasonId === season.id
        const isEditing = editingSeasonId === season.id

        return (
          <div key={season.id} className="rounded-lg border border-zinc-800 overflow-hidden">
            {/* Season row */}
            {isEditing ? (
              // Expanded edit form for season
              <div className="p-3 bg-zinc-900/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-7 w-16 text-sm"
                    value={sNum}
                    onChange={(e) => setSNum(e.target.value)}
                    type="number"
                    min={1}
                    placeholder="#"
                  />
                  <Input
                    className="h-7 flex-1 text-sm"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    placeholder="Season name (optional)"
                    autoFocus
                  />
                </div>
                <Textarea
                  className="text-sm resize-none"
                  value={sDescription}
                  onChange={(e) => setSDescription(e.target.value)}
                  placeholder="Season description (optional)"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-4">
                  <AdminImageUpload
                    label="Poster"
                    endpoint="contentPoster"
                    value={sPosterUrl || null}
                    onChange={(url) => setSPosterUrl(url ?? "")}
                    aspectRatio="portrait"
                  />
                  <AdminImageUpload
                    label="Hero Image"
                    endpoint="contentHero"
                    value={sHeroImageUrl || null}
                    onChange={(url) => setSHeroImageUrl(url ?? "")}
                    aspectRatio="wide"
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-zinc-400 hover:text-zinc-200 text-xs"
                    onClick={cancelEditSeason}
                  >
                    <X className="size-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-emerald-400 hover:text-emerald-300 text-xs"
                    onClick={() => handleSaveSeason(season)}
                    disabled={editSeason.isPending}
                  >
                    {editSeason.isPending ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Check className="size-3 mr-1" />}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              // Normal season row
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
                <button
                  type="button"
                  className="flex-1 flex items-center gap-2 text-left text-sm font-medium text-foreground"
                  onClick={() => setExpandedSeasonId(isExpanded ? null : season.id)}
                >
                  {isExpanded
                    ? <ChevronDown className="size-3.5 text-zinc-500 shrink-0" />
                    : <ChevronRight className="size-3.5 text-zinc-500 shrink-0" />
                  }
                  <span>
                    Season {season.seasonNumber}
                    {season.name ? <span className="text-zinc-400 font-normal"> — {season.name}</span> : null}
                  </span>
                  <span className="text-xs text-zinc-600">({episodes?.length ?? 0} ep)</span>
                </button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-zinc-500 hover:text-zinc-200"
                  onClick={() => openEditSeason(season)}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-zinc-500 hover:text-destructive"
                  onClick={() => handleDeleteSeason(season.id)}
                  disabled={deleteSeason.isPending}
                >
                  {deleteSeason.isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                </Button>
              </div>
            )}

            {/* Episode list (when expanded) */}
            {isExpanded && !isEditing && (
              <div className="border-t border-zinc-800 bg-zinc-950/40">
                {episodes?.map((episode) => {
                  const isEditingEp = editingEpisodeId === episode.id

                  return (
                    <div key={episode.id} className="border-b border-zinc-800/50 last:border-0">
                      {isEditingEp ? (
                        // Expanded edit form for episode
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              className="h-6 w-14 text-xs"
                              value={eNum}
                              onChange={(e) => setENum(e.target.value)}
                              type="number"
                              min={1}
                              placeholder="E#"
                            />
                            <Input
                              className="h-6 flex-1 text-xs"
                              value={eTitle}
                              onChange={(e) => setETitle(e.target.value)}
                              placeholder="Episode title"
                              autoFocus
                            />
                          </div>
                          <AdminImageUpload
                            label="Hero Image"
                            endpoint="contentHero"
                            value={eHeroImageUrl || null}
                            onChange={(url) => setEHeroImageUrl(url ?? "")}
                            aspectRatio="wide"
                          />
                          <Textarea
                            className="text-xs resize-none"
                            value={eDescription}
                            onChange={(e) => setEDescription(e.target.value)}
                            placeholder="Episode description (optional)"
                            rows={2}
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 text-zinc-400 hover:text-zinc-200 text-xs"
                              onClick={cancelEditEpisode}
                            >
                              <X className="size-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 text-emerald-400 hover:text-emerald-300 text-xs"
                              onClick={() => handleSaveEpisode(episode)}
                              disabled={editEpisode.isPending}
                            >
                              {editEpisode.isPending ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Check className="size-3 mr-1" />}
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Normal episode row
                        <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-zinc-900/30 transition-colors group">
                          <span className="text-xs text-zinc-500 w-8 shrink-0">
                            E{String(episode.episodeNumber).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-xs text-zinc-300">{episode.title}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-zinc-600 hover:text-zinc-200 opacity-0 group-hover:opacity-100"
                            onClick={() => openEditEpisode(episode)}
                          >
                            <Pencil className="size-2.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-zinc-600 hover:text-destructive opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteEpisode(episode.id)}
                            disabled={deleteEpisode.isPending}
                          >
                            {deleteEpisode.isPending ? <Loader2 className="size-2.5 animate-spin" /> : <Trash2 className="size-2.5" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Add episode form */}
                {addEpisodeForSeasonId === season.id ? (
                  <div className="p-3 border-t border-zinc-800/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-6 w-14 text-xs"
                        value={eNum}
                        onChange={(e) => setENum(e.target.value)}
                        type="number"
                        min={1}
                        placeholder="E#"
                      />
                      <Input
                        className="h-6 flex-1 text-xs"
                        value={eTitle}
                        onChange={(e) => setETitle(e.target.value)}
                        placeholder="Episode title"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") cancelAddEpisode()
                        }}
                        autoFocus
                      />
                    </div>
                    <AdminImageUpload
                      label="Hero Image"
                      endpoint="contentHero"
                      value={eHeroImageUrl || null}
                      onChange={(url) => setEHeroImageUrl(url ?? "")}
                      aspectRatio="wide"
                    />
                    <Textarea
                      className="text-xs resize-none"
                      value={eDescription}
                      onChange={(e) => setEDescription(e.target.value)}
                      placeholder="Episode description (optional)"
                      rows={2}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 text-zinc-400 hover:text-zinc-200 text-xs"
                        onClick={cancelAddEpisode}
                      >
                        <X className="size-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 text-emerald-400 hover:text-emerald-300 text-xs"
                        onClick={() => handleAddEpisode(season.id)}
                        disabled={createEpisode.isPending}
                      >
                        {createEpisode.isPending ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Check className="size-3 mr-1" />}
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full"
                    onClick={() => openAddEpisode(season.id, episodes?.length ?? 0)}
                  >
                    <Plus className="size-3" />
                    Add episode
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Add season form */}
      {addingSeasonForm ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              className="h-7 w-16 text-sm"
              value={sNum}
              onChange={(e) => setSNum(e.target.value)}
              type="number"
              min={1}
              placeholder="#"
            />
            <Input
              className="h-7 flex-1 text-sm"
              value={sName}
              onChange={(e) => setSName(e.target.value)}
              placeholder="Season name (optional)"
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelAddSeason()
              }}
              autoFocus
            />
          </div>
          <Textarea
            className="text-sm resize-none"
            value={sDescription}
            onChange={(e) => setSDescription(e.target.value)}
            placeholder="Season description (optional)"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminImageUpload
              label="Poster"
              endpoint="contentPoster"
              value={sPosterUrl || null}
              onChange={(url) => setSPosterUrl(url ?? "")}
              aspectRatio="portrait"
            />
            <AdminImageUpload
              label="Hero Image"
              endpoint="contentHero"
              value={sHeroImageUrl || null}
              onChange={(url) => setSHeroImageUrl(url ?? "")}
              aspectRatio="wide"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-zinc-400 hover:text-zinc-200 text-xs"
              onClick={cancelAddSeason}
            >
              <X className="size-3 mr-1" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-emerald-400 hover:text-emerald-300 text-xs"
              onClick={handleAddSeason}
              disabled={createSeason.isPending}
            >
              {createSeason.isPending ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Check className="size-3 mr-1" />}
              Add Season
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-1"
          onClick={openAddSeason}
        >
          <Plus className="size-3.5" />
          Add season
        </button>
      )}
    </div>
  )
}
