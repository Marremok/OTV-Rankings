"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlusIcon, Tv, ImageIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { AddSeriesDialog } from "./AddSeriesDialog"
import { useGetSeries } from "@/hooks/use-rankings"

function SeriesManagement() {
  const { data: series, isLoading, error, refetch } = useGetSeries()
  const [dialogOpen, setDialogOpen] = useState(false)

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
    </>
  )
}

export default SeriesManagement
