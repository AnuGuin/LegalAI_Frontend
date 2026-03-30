"use client"

import * as React from "react"
import {
  FileText,
  Search,
  Download,
  Trash2,
  Image as ImageIcon,
  File,
  BookOpen,
  FileEdit,
  Mail,
  ArrowUpDown,
  FolderSearch,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface FlatDocument {
  id: string
  title: string
  type: string
  originalName?: string
  fileUrl?: string
  vectorIndexed?: boolean
  aiSummary?: string
  createdAt: string
  matterId: string
  matterTitle: string
  size?: number
}

type DocType = "ALL" | "UPLOADED" | "GENERATED" | "ORDER" | "EVIDENCE" | "CORRESPONDENCE"
type SortKey = "title" | "type" | "createdAt" | "matterTitle"
type SortDir = "asc" | "desc"

const docTypeMeta: Record<string, { label: string; icon: React.ElementType; badgeClass: string }> = {
  UPLOADED: {
    label: "Uploaded",
    icon: FileText,
    badgeClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  GENERATED: {
    label: "Generated",
    icon: FileEdit,
    badgeClass: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  },
  ORDER: {
    label: "Order",
    icon: BookOpen,
    badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  EVIDENCE: {
    label: "Evidence",
    icon: ImageIcon,
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  CORRESPONDENCE: {
    label: "Correspondence",
    icon: Mail,
    badgeClass: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  },
}

function getDocIcon(type: string) {
  const meta = docTypeMeta[type]
  if (meta) return meta.icon
  return File
}

function formatBytes(bytes?: number) {
  if (!bytes) return null
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            {["Document", "Type", "Matter", "Indexed", "Uploaded"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border/40">
              <td className="px-4 py-3"><Skeleton className="h-4 w-52" /></td>
              <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SortableHeader({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <ArrowUpDown className={cn("h-3.5 w-3.5", active ? "text-foreground" : "text-muted-foreground/40")} />
      </span>
    </th>
  )
}

export default function DocumentsPage() {
  const [docs, setDocs] = React.useState<FlatDocument[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<DocType>("ALL")
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [deleting, setDeleting] = React.useState<string | null>(null)


  React.useEffect(() => {
    async function load() {
      try {
        const matters = await apiService.getMatters()
        const all: FlatDocument[] = []
        await Promise.all(
          matters.map(async (m) => {
            try {
              const matterDocs = await apiService.getMatterDocuments(m.id)
              matterDocs.forEach((d) => {
              all.push({
                id: d.id,
                title: d.title ?? "Untitled",
                type: d.type ?? "UPLOADED",
                  originalName: d.name,
                  fileUrl: d.url,
                  createdAt: d.uploadedAt ?? new Date().toISOString(),
                  matterId: m.id,
                  matterTitle: m.title,
                  size: d.size,
                })
              })
            } catch {
            }
          })
        )
        all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setDocs(all)
      } catch {
        toast.error("Failed to load documents")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  const handleDelete = async (doc: FlatDocument) => {
    setDeleting(doc.id)
    try {
      await apiService.deleteMatterDocument(doc.matterId, doc.id)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      toast.success("Document deleted")
    } catch {
      toast.error("Failed to delete document")
    } finally {
      setDeleting(null)
    }
  }

  const filtered = React.useMemo(() => {
    let result = docs.filter((d) => {
      const matchesSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        (d.matterTitle ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (d.aiSummary ?? "").toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "ALL" || d.type === typeFilter
      return matchesSearch && matchesType
    })

    result.sort((a, b) => {
      let av: string, bv: string
      if (sortKey === "createdAt") { av = a.createdAt; bv = b.createdAt }
      else if (sortKey === "type") { av = a.type; bv = b.type }
      else if (sortKey === "matterTitle") { av = a.matterTitle; bv = b.matterTitle }
      else { av = a.title; bv = b.title }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })

    return result
  }, [docs, search, typeFilter, sortKey, sortDir])

  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = { ALL: docs.length }
    docs.forEach((d) => {
      counts[d.type] = (counts[d.type] ?? 0) + 1
    })
    return counts
  }, [docs])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Search + type filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, matter names or summaries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {(["ALL", "UPLOADED", "GENERATED", "ORDER", "EVIDENCE", "CORRESPONDENCE"] as DocType[]).map((t) => {
              const label = t === "ALL" ? "All" : (docTypeMeta[t]?.label ?? t)
              const count = typeCounts[t] ?? 0
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1",
                    typeFilter === t
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {label}
                  <span className={cn("text-[10px] rounded-full px-1", typeFilter === t ? "bg-background/20" : "bg-muted-foreground/15")}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/60 bg-muted/10">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderSearch className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No documents found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search ? "Try a different search term." : "Upload documents inside any matter workspace to see them here."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <SortableHeader label="Document" sortKey="title" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Type" sortKey="type" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Matter" sortKey="matterTitle" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Indexed</th>
                  <SortableHeader label="Uploaded" sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((doc) => {
                  const meta = docTypeMeta[doc.type]
                  const DocIcon = meta?.icon ?? FileText
                  return (
                    <tr key={doc.id} className="group bg-card hover:bg-muted/20 transition-colors">
                      {/* Document */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <DocIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{doc.title}</p>
                            {doc.size && <p className="text-[11px] text-muted-foreground mt-0.5">{formatBytes(doc.size)}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        {meta ? (
                          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 border font-medium gap-1", meta.badgeClass)}>
                            {meta.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{doc.type}</span>
                        )}
                      </td>

                      {/* Matter */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground truncate max-w-[160px] block">{doc.matterTitle}</span>
                      </td>

                      {/* AI Indexed */}
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs font-medium", doc.vectorIndexed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                          {doc.vectorIndexed ? "✓ Yes" : "No"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground tabular-nums">{formatDate(doc.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.fileUrl && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" asChild>
                              <a href={doc.fileUrl} download={doc.originalName ?? doc.title} target="_blank" rel="noreferrer">
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => handleDelete(doc)}
                            disabled={deleting === doc.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-muted/20 border-t border-border/40">
              <p className="text-xs text-muted-foreground">Showing {filtered.length} of {docs.length} documents</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
