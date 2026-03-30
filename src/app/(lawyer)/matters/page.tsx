"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Scale,
  Search,
  Plus,
  FolderOpen,
  CheckCircle2,
  Archive,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService, type Matter } from "@/lib/api.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CreateMatterModal } from "@/components/lawyer/dashboard/create-matter-modal"

const stageMeta: Record<string, { label: string; icon: React.ElementType; rowClass: string; badgeClass: string }> = {
  ACTIVE: {
    label: "Active",
    icon: FolderOpen,
    rowClass: "hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCircle2,
    rowClass: "hover:bg-blue-50/30 dark:hover:bg-blue-950/10",
    badgeClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    rowClass: "hover:bg-muted/50",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
}

type SortKey = "title" | "stage" | "createdAt" | "practiceArea"
type SortDir = "asc" | "desc"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            {["Case Name", "Notes", "Start Date", "Status"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border/40">
              <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
              <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SortableHeader({
  label,
  sortKey,
  current,
  onSort,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <ArrowUpDown className={cn("h-3.5 w-3.5 transition-colors", active ? "text-foreground" : "text-muted-foreground/40")} />
      </span>
    </th>
  )
}

export default function AllMattersPage() {
  const router = useRouter()
  const [matters, setMatters] = React.useState<Matter[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [stageFilter, setStageFilter] = React.useState<string>("ALL")
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [createOpen, setCreateOpen] = React.useState(false)

  React.useEffect(() => {
    apiService.getMatters().then(setMatters).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filtered = React.useMemo(() => {
    let result = (Array.isArray(matters) ? matters : []).filter((m) => {
      const matchesSearch =
        !search ||
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        (m.caseNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.notes ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.practiceArea ?? "").toLowerCase().includes(search.toLowerCase())
      const matchesStage = stageFilter === "ALL" || m.status === stageFilter
      return matchesSearch && matchesStage
    })

    result.sort((a, b) => {
      let av: string, bv: string
      if (sortKey === "createdAt") {
        av = a.createdAt; bv = b.createdAt
      } else if (sortKey === "stage") {
        av = a.status ?? ""; bv = b.status ?? ""
      } else if (sortKey === "practiceArea") {
        av = a.practiceArea ?? ""; bv = b.practiceArea ?? ""
      } else {
        av = a.title; bv = b.title
      }
      return sortDir === "asc" ? (av || "").localeCompare(bv || "") : (bv || "").localeCompare(av || "")
    })

    return result
  }, [matters, search, stageFilter, sortKey, sortDir])

  const safeMatters = Array.isArray(matters) ? matters : []

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Page Actions */}
        <div className="flex items-center justify-end">
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-[#1A3A5C] hover:bg-[#244d7a] text-white shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Matter
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case name, number or notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {["ALL", "ACTIVE", "CLOSED", "ARCHIVED"].map((stage) => {
              const label = stage === "ALL" ? "All" : (stageMeta[stage]?.label ?? stage)
              const count = stage === "ALL" ? safeMatters.length : safeMatters.filter((m) => m.status === stage).length
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5",
                    stageFilter === stage
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {label}
                  <span className={cn(
                    "text-[10px] rounded-full px-1.5",
                    stageFilter === stage ? "bg-background/20" : "bg-muted-foreground/15"
                  )}>
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
              <Scale className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No matters found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search ? "Try a different search term or clear filters." : "Create your first matter to get started."}
            </p>
            {!search && (
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Matter
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <SortableHeader label="Case Name" sortKey="title" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notes
                  </th>
                  <SortableHeader label="Practice Area" sortKey="practiceArea" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Start Date" sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Status" sortKey="stage" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((matter) => {
                  const meta = stageMeta[matter.status || "ACTIVE"] ?? stageMeta.ACTIVE
                  const StageIcon = meta.icon
                  return (
                    <tr
                      key={matter.id}
                      onClick={() => router.push(`/assistant/matter/${matter.id}`)}    
                      className={cn(
                        "group cursor-pointer transition-colors bg-card",
                        meta.rowClass
                      )}
                    >
                      {/* Case name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[220px]">{matter.title}</p>
                            {matter.caseNumber && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">#{matter.caseNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[180px]">
                          {matter.notes || <span className="italic opacity-50">No notes</span>}
                        </p>
                      </td>

                      {/* Practice area */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground">
                          {matter.practiceArea ?? "—"}
                        </span>
                      </td>

                      {/* Start date */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatDate(matter.createdAt)}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-2 py-0.5 border font-medium gap-1", meta.badgeClass)}
                        >
                          <StageIcon className="h-2.5 w-2.5" />
                          {meta.label}
                        </Badge>
                      </td>

                      {/* Arrow */}
                      <td className="px-4 py-3.5">
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-muted/20 border-t border-border/40 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {matters.length} matters
              </p>
            </div>
          </div>
        )}

      </div>

      <CreateMatterModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

