"use client"

import * as React from "react"
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Gavel,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import { useStream } from "@/hooks/use-stream"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type ReviewMode = "professional" | "client"

interface RiskFlag {
  clause: string
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  concern: string
  recommendation?: string
}

interface AnalysisResult {
  rawText: string
  overview?: {
    type: string
    parties: string
    term: string
    governingLaw: string
  }
  riskFlags: RiskFlag[]
  complianceIssues?: string[]
  recommendedActions?: string[]
  summary?: string
  mode: ReviewMode
}

const riskMeta: Record<string, { color: string; badgeClass: string; dotClass: string; label: string }> = {
  CRITICAL: {
    color: "#ef4444",
    badgeClass: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    dotClass: "bg-red-500",
    label: "Critical",
  },
  HIGH: {
    color: "#f97316",
    badgeClass: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    dotClass: "bg-orange-500",
    label: "High",
  },
  MEDIUM: {
    color: "#eab308",
    badgeClass: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    dotClass: "bg-yellow-500",
    label: "Medium",
  },
  LOW: {
    color: "#22c55e",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
    label: "Low",
  },
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  const radius = 56
  const cx = 70
  const cy = 70
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const segments = data.map((d) => {
    const fraction = d.value / total
    const dash = fraction * circumference
    const seg = { ...d, dash, offset, fraction }
    offset += dash
    return seg
  })

  return (
    <div className="flex items-center gap-6">
      <svg width={140} height={140} viewBox="0 0 140 140" className="shrink-0 -rotate-90">
        {/* track */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth={18} className="text-border/30" />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={18}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        ))}
        {/* center text */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="rotate-90" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <tspan x={cx} dy="-6" style={{ fontSize: 22, fontWeight: 700, fill: "currentColor" }}>{total}</tspan>
          <tspan x={cx} dy="18" style={{ fontSize: 10, fill: "gray" }}>clauses</tspan>
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-foreground font-medium">{seg.value}</span>
            <span className="text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


function RiskBar({ flags }: { flags: RiskFlag[] }) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  flags.forEach((f) => { counts[f.level] = (counts[f.level] ?? 0) + 1 })
  const max = Math.max(...Object.values(counts), 1)
  const levels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const

  return (
    <div className="space-y-2.5">
      {levels.map((level) => {
        const meta = riskMeta[level]
        const count = counts[level]
        const pct = (count / max) * 100
        return (
          <div key={level} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-14 shrink-0 text-right font-medium">{meta.label}</span>
            <div className="flex-1 h-6 bg-muted/40 rounded-md overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: meta.color, minWidth: count > 0 ? "1.5rem" : 0 }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums w-5 text-right text-foreground">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function RiskFlagCard({ flag }: { flag: RiskFlag }) {
  const [open, setOpen] = React.useState(false)
  const meta = riskMeta[flag.level] ?? riskMeta.LOW

  return (
    <div className={cn("rounded-xl border overflow-hidden transition-all", meta.badgeClass.includes("red") ? "border-red-200 dark:border-red-800/60" : meta.badgeClass.includes("orange") ? "border-orange-200 dark:border-orange-800/60" : meta.badgeClass.includes("yellow") ? "border-yellow-200 dark:border-yellow-800/60" : "border-emerald-200 dark:border-emerald-800/60")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className={cn("h-2 w-2 rounded-full shrink-0", meta.dotClass)} />
        <Badge variant="outline" className={cn("text-[10px] px-2 py-0 border font-semibold shrink-0", meta.badgeClass)}>
          {meta.label}
        </Badge>
        <span className="text-sm font-medium text-foreground flex-1 truncate">{flag.clause}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-current/10">
          <p className="text-sm text-muted-foreground pt-3">{flag.concern}</p>
          {flag.recommendation && (
            <div className="rounded-lg bg-background/60 border border-border/60 px-3 py-2">
              <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Recommendation
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{flag.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function parseAnalysis(text: string, mode: ReviewMode): AnalysisResult {
  const riskFlags: RiskFlag[] = []

  if (mode === "professional") {
    // Look for risk level patterns
    const riskPattern = /(?:Risk level|Risk):\s*(LOW|MEDIUM|HIGH|CRITICAL)/gi
    const clausePattern = /[-*•]\s*(?:Clause name|Clause)[^:]*?:\s*(.+?)(?=\n|$)/gi
    const concernPattern = /(?:Legal concern|Concern)[^:]*?:\s*(.+?)(?=\n|$)/gi
    const redlinePattern = /(?:Recommended redline|Recommendation)[^:]*?:\s*([\s\S]+?)(?=\n(?:##|-|\*)|$)/gi

    const sections = text.split(/\n(?=[-*•]|\d+\.|\s*##)/g)
    sections.forEach((block) => {
      const levelMatch = block.match(/Risk level:\s*(LOW|MEDIUM|HIGH|CRITICAL)/i)
      const clauseMatch = block.match(/Clause[^:]*?:\s*([^\n]+)/i)
      const concernMatch = block.match(/(?:Legal concern|Concern)[^:]*?:\s*([^\n]+)/i)
      const recMatch = block.match(/(?:Recommended|Recommendation)[^:]*?:\s*([^\n]+)/i)

      if (levelMatch && clauseMatch) {
        riskFlags.push({
          clause: clauseMatch[1]?.trim() ?? "Unknown clause",
          level: levelMatch[1]?.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          concern: concernMatch?.[1]?.trim() ?? block.trim().slice(0, 200),
          recommendation: recMatch?.[1]?.trim(),
        })
      }
    })

    if (riskFlags.length === 0) {
      const riskSection = text.match(/## KEY RISK FLAGS([\s\S]*?)(?=##|$)/i)?.[1] || 
                          text.match(/### General Observations([\s\S]*?)(?=###|$)/i)?.[1] || 
                          "";
      const lines = riskSection ? riskSection.split("\n") : text.split("\n");
      const bullets = lines.filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*") || l.trim().startsWith("•"));
      bullets.forEach((line) => {
        const cleanPattern = line.replace(/^[-•*]\s*/, "").trim().replace(/\*\*/g, "");
        if (cleanPattern.length > 20) {
          const isHigh = /\b(critical|unconstitutional|void|penalty|termination|unilateral|withhold|asymmetrical|extensive)\b/i.test(cleanPattern)
          const isMed = /\b(clause|arbitration|liability|ip|non-compete|indemnity)\b/i.test(cleanPattern)
          const clausePart = cleanPattern.split(":")[0]?.trim() || cleanPattern.slice(0, 50);
          riskFlags.push({
            clause: clausePart.slice(0, 80),
            level: isHigh ? "HIGH" : isMed ? "MEDIUM" : "LOW",
            concern: cleanPattern,
          })
        }
      })
    }
  } else {
    const watchSection = text.match(/## WATCH OUT FOR([\s\S]*?)(?=##|$)/i)?.[1] ?? ""
    const lines = watchSection.split("\n").filter((l) => l.trim().length > 10)
    lines.forEach((line) => {
      const clean = line.replace(/^[-•*\d.]\s*/, "").trim()
      if (clean.length > 10) {
        const isHigh = /\b(money|payment|penalty|terminate|end|serious)\b/i.test(clean)
        riskFlags.push({
          clause: clean.slice(0, 80),
          level: isHigh ? "HIGH" : "MEDIUM",
          concern: clean,
        })
      }
    })
  }

  const overviewSection = text.match(/## (?:CONTRACT OVERVIEW|WHAT IS THIS CONTRACT\?)([\s\S]*?)(?=##|$)/i)?.[1] ?? ""

  return {
    rawText: text,
    riskFlags,
    mode,
    overview: overviewSection
      ? {
          type: overviewSection.match(/type[^:]*?:\s*([^\n]+)/i)?.[1]?.trim() ?? "Contract",
          parties: overviewSection.match(/parties[^:]*?:\s*([^\n]+)/i)?.[1]?.trim() ?? "—",
          term: overviewSection.match(/term[^:]*?:\s*([^\n]+)/i)?.[1]?.trim() ?? "—",
          governingLaw: overviewSection.match(/governing law[^:]*?:\s*([^\n]+)/i)?.[1]?.trim() ?? "—",
        }
      : undefined,
  }
}

export default function ContractAnalyserPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [mode, setMode] = React.useState<ReviewMode>("professional")
  const [contractType, setContractType] = React.useState("")
  const [clientName, setClientName] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<AnalysisResult | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [streamedText, setStreamedText] = React.useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)
  
  // Create a minimal local stream effect in place of custom hook
  React.useEffect(() => {
    if (result?.rawText) {
      setStreamedText("")
      const words = result.rawText.split(" ")
      let i = 0
      const int = setInterval(() => {
        if (i >= words.length) {
          clearInterval(int)
          return
        }
        const chunk = words.slice(0, i + 3).join(" ")
        setStreamedText(chunk)
        i += 3
      }, 30) // fast typing
      return () => clearInterval(int)
    } else {
      setStreamedText("")
    }
  }, [result?.rawText])

  const handleFileChange = (f: File | null) => {
    if (!f) return
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    if (!allowed.includes(f.type)) {
      toast.error("Invalid file type. Allowed: PDF, DOC, DOCX, TXT.")
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File too large. Maximum 20 MB.")
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileChange(e.dataTransfer.files?.[0] ?? null)
  }

  const handleAnalyse = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) throw new Error("Not authenticated. Please log in again.")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("mode", mode)
      if (contractType) formData.append("contractType", contractType)
      if (clientName) formData.append("clientName", clientName)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lawyer/contract/review`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const json = await response.json()
      // If success flag differs or is missing, try treating the response directly as payload if it has rawReview
      if (json.success === false && !json.rawReview && !json.data?.rawReview) {
        throw new Error(json.message ?? "Analysis failed")
      }

      const rawText: string = json.data?.rawReview ?? json.rawReview ?? json.data?.review ?? json.data?.analysis ?? json.data?.rawResponse ?? JSON.stringify(json.data ?? json)
      const parsed = parseAnalysis(rawText, mode)
      setResult(parsed)
      toast.success("Contract analysed successfully")
    } catch (err: any) {
      toast.error("Analysis failed", { description: err?.message ?? "Please try again." })
    } finally {
      setLoading(false)
    }
  }

  // Donut data
  const donutData = React.useMemo(() => {
    if (!result) return []
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    result.riskFlags.forEach((f) => { counts[f.level] = (counts[f.level] ?? 0) + 1 })
    return (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const)
      .filter((k) => counts[k] > 0)
      .map((k) => ({ label: riskMeta[k].label, value: counts[k], color: riskMeta[k].color }))
  }, [result])

  const totalRisk = result?.riskFlags.length ?? 0
  const criticalCount = result?.riskFlags.filter((f) => f.level === "CRITICAL").length ?? 0
  const highCount = result?.riskFlags.filter((f) => f.level === "HIGH").length ?? 0

  return (
    <div className="flex-1 overflow-y-auto h-full w-full">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Upload + config card */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm p-6 space-y-5">

          {/* Mode + config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Review Mode</label>
              <Select value={mode} onValueChange={(v) => setMode(v as ReviewMode)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-3.5 w-3.5" />
                      Professional (Lawyer)
                    </div>
                  </SelectItem>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Plain Language (Client)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Contract Type (optional)</label>
              <Input
                placeholder="e.g. Employment, NDA, Service…"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="h-9"
              />
            </div>
            {mode === "client" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Client Name (optional)</label>
                <Input
                  placeholder="e.g. Rajesh Gupta"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-9"
                />
              </div>
            )}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : file ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10" : "border-border/60 hover:border-border hover:bg-muted/20"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready to analyse
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null) }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">Drop your contract here</p>
                  <p className="text-xs text-muted-foreground mt-0.5">PDF, DOC, DOCX or TXT &bull; Max 20 MB</p>
                </div>
                <Button variant="outline" size="sm" className="mt-1">Browse file</Button>
              </>
            )}
          </div>

          {/* Analyse button */}
          <Button
            onClick={handleAnalyse}
            disabled={!file || loading}
            className="w-full bg-[#1A3A5C] hover:bg-[#244d7a] text-white h-10 gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Analysing contract…</>
            ) : (
              <><Sparkles className="h-4 w-4" />Analyse Contract</>
            )}
          </Button>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div className="space-y-6">

            {/* Overview banner */}
            {result.overview && (
              <div className="rounded-xl border border-border/60 bg-card p-5">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Contract Overview
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Type", value: result.overview.type },
                    { label: "Parties", value: result.overview.parties },
                    { label: "Term", value: result.overview.term },
                    { label: "Governing Law", value: result.overview.governingLaw },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{label}</p>
                      <p className="text-sm font-medium text-foreground leading-snug">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual risk analysis */}
            {totalRisk > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Donut chart */}
                <div className="rounded-xl border border-border/60 bg-card p-5">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    Risk Distribution
                  </h2>
                  <DonutChart data={donutData} />
                </div>

                {/* Bar chart */}
                <div className="rounded-xl border border-border/60 bg-card p-5">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Risk by Severity
                  </h2>
                  <RiskBar flags={result.riskFlags} />
                  {(criticalCount > 0 || highCount > 0) && (
                    <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20 px-3 py-2.5 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                        <strong>{criticalCount + highCount} high-risk clause{criticalCount + highCount !== 1 ? "s" : ""}</strong> require immediate attention before signing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk flags list */}
            {result.riskFlags.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Risk Flags ({result.riskFlags.length})
                </h2>
                {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const)
                  .flatMap((level) => result.riskFlags.filter((f) => f.level === level))
                  .map((flag, i) => (
                    <RiskFlagCard key={i} flag={flag} />
                  ))}
              </div>
            )}

            {/* Full raw analysis */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Full Analysis
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5 text-muted-foreground"
                  onClick={() => {
                    const blob = new Blob([result.rawText], { type: "text/plain" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `contract-analysis-${file?.name ?? "report"}.txt`
                    a.click()
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
              <div className="px-5 py-4 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="text-foreground max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-foreground" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-3 mb-1 text-foreground" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1 text-muted-foreground" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1 text-muted-foreground" {...props} />,
                      li: ({node, ...props}) => <li className="text-sm leading-relaxed" {...props} />,
                      p:  ({node, ...props}) => <p className="text-sm mb-3 leading-relaxed text-muted-foreground" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                    }}
                  >
                    {streamedText || result.rawText || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Reset button */}
            <div className="flex justify-center pb-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => { setResult(null); setFile(null) }}
              >
                <RefreshCw className="h-4 w-4" />
                Analyse Another Contract
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

// Missing import fix
function User({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
}
