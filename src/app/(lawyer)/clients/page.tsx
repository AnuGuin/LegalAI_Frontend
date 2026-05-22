"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  User, Building2, Search, Phone, Mail, Scale, ChevronRight,
  Users, MessageCircle, Send, Copy, Check, Loader2, Sparkles,
  ArrowLeft, MessageSquare, Mic, AtSign, X, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface ClientRecord {
  name: string
  phone?: string
  email?: string
  type?: string
  matters: { id: string; title: string; stage: string }[]
}

interface CommsResult {
  whatsapp?: string
  emailSubject?: string
  emailBody?: string
  voiceNote?: string
  rawOutput?: string
}

type CommsFormat = "whatsapp" | "email" | "voice_note" | "all"


function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

const AVATAR_COLORS = [
  "from-blue-500 to-blue-600", "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600", "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600", "from-cyan-500 to-cyan-600",
]
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]

const stageBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  CLOSED: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button type="button" onClick={copy}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function CommsOutput({ result, format }: { result: CommsResult; format: CommsFormat }) {
  const sections = [
    {
      key: "whatsapp",
      show: (format === "all" || format === "whatsapp") && !!result.whatsapp,
      icon: MessageCircle,
      label: "WhatsApp Message",
      color: "text-green-600 bg-green-50 dark:bg-green-950/30",
      content: result.whatsapp ?? "",
    },
    {
      key: "email",
      show: (format === "all" || format === "email") && !!(result.emailSubject || result.emailBody),
      icon: AtSign,
      label: "Email",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
      content: result.emailBody ?? "",
      subject: result.emailSubject,
    },
    {
      key: "voice",
      show: (format === "all" || format === "voice_note") && !!result.voiceNote,
      icon: Mic,
      label: "Voice Note Script",
      color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
      content: result.voiceNote ?? "",
    },
  ]

  const visible = sections.filter(s => s.show)
  if (visible.length === 0 && result.rawOutput) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.rawOutput}</pre>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visible.map(section => {
        const Icon = section.icon
        const copyText = section.subject
          ? `Subject: ${section.subject}\n\n${section.content}`
          : section.content
        return (
          <div key={section.key} className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", section.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold text-foreground">{section.label}</span>
              </div>
              <CopyButton text={copyText} />
            </div>
            <div className="px-4 py-4 space-y-3">
              {section.subject && (
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Subject</p>
                  <p className="text-sm font-medium text-foreground">{section.subject}</p>
                </div>
              )}
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CommsGenerator({ client }: { client: ClientRecord }) {
  const [selectedMatter, setSelectedMatter] = React.useState(client.matters[0]?.id ?? "")
  const [eventContext, setEventContext] = React.useState("")
  const [additionalContext, setAdditionalContext] = React.useState("")
  const [format, setFormat] = React.useState<CommsFormat>("all")
  const [outputLanguage, setOutputLanguage] = React.useState("en")
  const [generating, setGenerating] = React.useState(false)
  const [result, setResult] = React.useState<CommsResult | null>(null)

  const handleGenerate = async () => {
    if (!selectedMatter || !eventContext.trim()) {
      toast.error("Please select a matter and describe what to communicate.")
      return
    }
    setGenerating(true)
    setResult(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (!token) throw new Error("Not authenticated")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lawyer/comms/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          matterId: selectedMatter,
          eventContext: eventContext.trim(),
          clientName: client.name,
          format,
          outputLanguage,
          additionalContext: additionalContext.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? "Generation failed")
      setResult({
        whatsapp: json.data?.whatsapp,
        emailSubject: json.data?.emailSubject,
        emailBody: json.data?.emailBody,
        voiceNote: json.data?.voiceNote,
        rawOutput: json.data?.rawOutput,
      })
      toast.success("Communications generated")
    } catch (err: any) {
      toast.error("Generation failed", { description: err?.message })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Config row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Matter</label>
          <Select value={selectedMatter} onValueChange={setSelectedMatter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select matter…" />
            </SelectTrigger>
            <SelectContent>
              {client.matters.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Format</label>
          <Select value={format} onValueChange={(v) => setFormat(v as CommsFormat)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              <SelectItem value="whatsapp">WhatsApp only</SelectItem>
              <SelectItem value="email">Email only</SelectItem>
              <SelectItem value="voice_note">Voice note only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Language</label>
          <Select value={outputLanguage} onValueChange={setOutputLanguage}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="bn">Bengali</SelectItem>
              <SelectItem value="mr">Marathi</SelectItem>
              <SelectItem value="ta">Tamil</SelectItem>
              <SelectItem value="te">Telugu</SelectItem>
              <SelectItem value="gu">Gujarati</SelectItem>
              <SelectItem value="kn">Kannada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Event context */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          What to communicate <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={eventContext}
          onChange={e => setEventContext(e.target.value)}
          placeholder="e.g. The hearing scheduled for 15 Jan has been adjourned to 22 Feb. The court also directed our client to file additional documents within 2 weeks…"
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      {/* Additional context */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">Additional notes for AI (optional)</label>
        <Textarea
          value={additionalContext}
          onChange={e => setAdditionalContext(e.target.value)}
          placeholder="e.g. Tone should be reassuring. Client is anxious about delays."
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={generating || !selectedMatter || !eventContext.trim()}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10"
      >
        {generating
          ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
          : <><Sparkles className="h-4 w-4" />Generate Communications</>}
      </Button>

      {/* Results */}
      {result && <CommsOutput result={result} format={format} />}
    </div>
  )
}

//  Client card (list view) 
function ClientListItem({ client, onSelect }: { client: ClientRecord; onSelect: () => void }) {
  const router = useRouter()
  return (
    <button type="button" onClick={onSelect}
      className="group w-full flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all duration-200 text-left">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white text-sm font-semibold bg-gradient-to-br", avatarColor(client.name))}>
        {initials(client.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {client.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
          {client.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{client.matters.length} matter{client.matters.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
          <MessageCircle className="h-3 w-3" />
          Comms
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  )
}

// Main page 
export default function ClientsPage() {
  const [clients, setClients] = React.useState<ClientRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<ClientRecord | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const matters = await apiService.getMatters()
        const map = new Map<string, ClientRecord>()
        matters.forEach((m: any) => {
          if (!Array.isArray(m.parties)) return
          m.parties.forEach((p: any) => {
            if (p.role !== "client" || !p.name?.trim()) return
            const key = p.name.trim().toLowerCase()
            if (!map.has(key)) {
              map.set(key, { name: p.name.trim(), phone: p.phone, email: p.email, type: p.type ?? "individual", matters: [] })
            }
            const rec = map.get(key)!
            if (!rec.phone && p.phone) rec.phone = p.phone
            if (!rec.email && p.email) rec.email = p.email
            rec.matters.push({ id: m.id, title: m.title, stage: m.stage })
          })
        })
        setClients(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)))
      } catch {
        toast.error("Failed to load clients")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = clients.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  )

  if (selected) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {/* Back + client header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setSelected(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-white text-sm font-semibold bg-gradient-to-br shrink-0", avatarColor(selected.name))}>
                {initials(selected.name)}
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{selected.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {selected.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selected.phone}</span>}
                  {selected.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selected.email}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Matters summary */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Related Matters</p>
            <div className="flex flex-wrap gap-2">
              {selected.matters.map(m => (
                <span key={m.id} className="flex items-center gap-1.5 text-xs border border-border/60 rounded-lg px-2.5 py-1.5 bg-muted/30">
                  <Scale className="h-3 w-3 text-muted-foreground" />
                  {m.title}
                  <Badge variant="outline" className={cn("text-[9px] px-1 border ml-1", stageBadge[m.stage] ?? stageBadge.ACTIVE)}>
                    {m.stage.charAt(0) + m.stage.slice(1).toLowerCase()}
                  </Badge>
                </span>
              ))}
            </div>
          </div>

          {/* Comms generator */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Generate Client Communications</h2>
                <p className="text-xs text-muted-foreground">AI-powered WhatsApp messages, emails and voice note scripts</p>
              </div>
            </div>
            <CommsGenerator client={selected} />
          </div>
        </div>
      </div>
    )
  }

  // Client list view 
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div><p className="text-xl font-bold">{clients.length}</p><p className="text-xs text-muted-foreground">Total Clients</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div><p className="text-xl font-bold">{clients.filter(c => c.type !== "company").length}</p><p className="text-xs text-muted-foreground">Individuals</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div><p className="text-xl font-bold">{clients.filter(c => c.type === "company").length}</p><p className="text-xs text-muted-foreground">Companies</p></div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card">
                <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/60 bg-muted/10">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No clients found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search ? "Try a different search." : "Clients are pulled automatically from matter parties."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(client => (
              <ClientListItem key={client.name} client={client} onSelect={() => setSelected(client)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

