"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  X,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Scale,
  Hash,
  MapPin,
  AlignLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  UserX,
  AlertCircle,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api.service"



type PracticeArea =
  | "Criminal"
  | "Civil"
  | "Corporate"
  | "Family"
  | "Property"
  | "Labour"
  | "Constitutional"
  | "Tax"
  | "IP"

type Priority = "low" | "medium" | "high"

interface Party {
  id: string
  role: "client" | "opponent" | "other"
  name: string
  phone: string
  email: string
  counsel: string
  roleLabel: string
}

interface FormData {
  title: string
  practiceArea: PracticeArea | ""
  court: string
  caseNumber: string
  priority: Priority
  description: string
  parties: Party[]
}



const PRACTICE_AREAS: { value: PracticeArea; label: string; color: string; bg: string }[] = [
  { value: "Criminal", label: "Criminal", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  { value: "Civil", label: "Civil", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  { value: "Corporate", label: "Corporate", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { value: "Family", label: "Family", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  { value: "Property", label: "Property", color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
  { value: "Labour", label: "Labour", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  { value: "Constitutional", label: "Constitutional", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
  { value: "Tax", label: "Tax", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  { value: "IP", label: "IP", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
]

const COURTS = [
  "Supreme Court of India",
  "High Court — Allahabad",
  "High Court — Bombay",
  "High Court — Calcutta",
  "High Court — Delhi",
  "High Court — Jaipur",
  "High Court — Madras",
  "District Court",
  "Sessions Court",
  "Family Court",
  "Labour Tribunal",
  "NCLT",
  "NCLAT",
  "Arbitration",
  "Consumer Forum",
  "Other",
]

const PRIORITY_OPTIONS: { value: Priority; label: string; dot: string; active: string }[] = [
  { value: "low", label: "Low", dot: "bg-emerald-500", active: "border-emerald-400 bg-emerald-50 text-emerald-700" },
  { value: "medium", label: "Medium", dot: "bg-amber-500", active: "border-amber-400 bg-amber-50 text-amber-700" },
  { value: "high", label: "High", dot: "bg-red-500", active: "border-red-400 bg-red-50 text-red-700" },
]

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Parties" },
  { id: 3, label: "Review" },
]

const EMPTY_CLIENT: Party = {
  id: "client-0",
  role: "client",
  name: "",
  phone: "",
  email: "",
  counsel: "",
  roleLabel: "Client / Petitioner",
}

const EMPTY_OPPONENT: Party = {
  id: "opponent-0",
  role: "opponent",
  name: "",
  phone: "",
  email: "",
  counsel: "",
  roleLabel: "Respondent / Opposite Party",
}

function newOther(): Party {
  return {
    id: `other-${Date.now()}`,
    role: "other",
    name: "",
    phone: "",
    email: "",
    counsel: "",
    roleLabel: "",
  }
}

const BLANK_FORM: FormData = {
  title: "",
  practiceArea: "",
  court: "",
  caseNumber: "",
  priority: "medium",
  description: "",
  parties: [{ ...EMPTY_CLIENT }, { ...EMPTY_OPPONENT }],
}


function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center px-6 py-4 border-b border-border/50">
      {STEPS.map((step, i) => {
        const done = step.id < current
        const active = step.id === current
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all",
                  done && "bg-[#1A3A5C] text-white",
                  active && "border border-[#1A3A5C] text-[#1A3A5C] bg-transparent",
                  !done && !active && "border border-border text-muted-foreground bg-transparent"
                )}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-xs tracking-tight",
                  active && "font-medium text-foreground",
                  !active && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-px flex-1 transition-colors",
                  done ? "bg-[#1A3A5C]/30" : "bg-border/50"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}



function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-red-500 normal-case tracking-normal">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}



function PartyCard({
  party,
  canDelete,
  onChange,
  onDelete,
}: {
  party: Party
  canDelete: boolean
  onChange: (updated: Party) => void
  onDelete: () => void
}) {
  const isClient = party.role === "client"
  const isOpponent = party.role === "opponent"
  const isOther = party.role === "other"

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3.5 space-y-3">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded",
              isClient && "bg-blue-50 text-blue-600",
              isOpponent && "bg-rose-50 text-rose-600",
              isOther && "bg-muted text-muted-foreground"
            )}
          >
            {isClient && <User className="h-3 w-3" />}
            {isOpponent && <UserX className="h-3 w-3" />}
            {isOther && <Briefcase className="h-3 w-3" />}
          </div>
          {isOther ? (
            <Input
              className="h-5 text-xs font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 w-44"
              placeholder="Role label (e.g. Intervenor)"
              value={party.roleLabel}
              onChange={(e) => onChange({ ...party, roleLabel: e.target.value })}
            />
          ) : (
            <span className="text-xs font-medium text-foreground">{party.roleLabel}</span>
          )}
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Fields row */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" required={isClient}>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              className="pl-7 h-8 text-xs"
              placeholder={isClient ? "Client's full name" : "Name or entity"}
              value={party.name}
              onChange={(e) => onChange({ ...party, name: e.target.value })}
            />
          </div>
        </Field>

        {isClient || isOther ? (
          <Field label="Phone">
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                className="pl-7 h-8 text-xs"
                placeholder="+91 98765 43210"
                value={party.phone}
                onChange={(e) => onChange({ ...party, phone: e.target.value })}
              />
            </div>
          </Field>
        ) : (
          <Field label="Represented by">
            <div className="relative">
              <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                className="pl-7 h-8 text-xs"
                placeholder="Counsel / firm name"
                value={party.counsel}
                onChange={(e) => onChange({ ...party, counsel: e.target.value })}
              />
            </div>
          </Field>
        )}
      </div>

      {(isClient || isOther) && (
        <Field label="Email">
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              className="pl-7 h-8 text-xs"
              placeholder="email@example.com"
              type="email"
              value={party.email}
              onChange={(e) => onChange({ ...party, email: e.target.value })}
            />
          </div>
        </Field>
      )}
    </div>
  )
}



function ReviewRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="w-28 shrink-0 text-[11px] text-muted-foreground pt-px">{label}</span>
      <span className={cn("text-xs font-medium flex-1 leading-relaxed", accent ?? "text-foreground")}>{value}</span>
    </div>
  )
}



interface CreateMatterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMatterModal({ open, onOpenChange }: CreateMatterModalProps) {
  const router = useRouter()

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [showTopFade, setShowTopFade] = React.useState(false)
  const [showBottomFade, setShowBottomFade] = React.useState(true)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return

    setShowTopFade(el.scrollTop > 5)
    setShowBottomFade(el.scrollHeight - el.scrollTop > el.clientHeight + 5)
  }

  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({})

  const [form, setForm] = React.useState<FormData>({ ...BLANK_FORM, parties: [{ ...EMPTY_CLIENT }, { ...EMPTY_OPPONENT }] })

  function handleOpenChange(val: boolean) {
    if (!val) {
      setTimeout(() => {
        setStep(1)
        setErrors({})
        setSubmitError(null)
        setForm({ ...BLANK_FORM, parties: [{ ...EMPTY_CLIENT }, { ...EMPTY_OPPONENT }] })
      }, 300)
    }
    onOpenChange(val)
  }


  function validateStep1(): boolean {
    const e: typeof errors = {}
    if (!form.title.trim()) e.title = "Matter title is required"
    if (!form.practiceArea) e.practiceArea = "Select a practice area"
    if (!form.court) e.court = "Select a court or forum"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    const e: typeof errors = {}
    const client = form.parties.find((p) => p.role === "client")
    if (!client?.name.trim()) e.clientName = "Client name is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setErrors({})
    setStep((s) => Math.min(s + 1, 3))
  }

  function back() {
    setErrors({})
    setSubmitError(null)
    setStep((s) => Math.max(s - 1, 1))
  }


  function updateParty(id: string, updated: Party) {
    setForm((f) => ({ ...f, parties: f.parties.map((p) => (p.id === id ? updated : p)) }))
  }

  function deleteParty(id: string) {
    setForm((f) => ({ ...f, parties: f.parties.filter((p) => p.id !== id) }))
  }

  function addOther() {
    setForm((f) => ({ ...f, parties: [...f.parties, newOther()] }))
  }

  async function handleSubmit() {
    setLoading(true)
    setSubmitError(null)
    try {
      const payload = {
        title: form.title.trim(),
        practiceArea: form.practiceArea,
        court: form.court,
        caseNumber: form.caseNumber.trim() || undefined,
        priority: form.priority,
        description: form.description.trim() || undefined,
        parties: form.parties.map(({ role, name, phone, email, counsel, roleLabel }) => ({
          role,
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          counsel: counsel.trim() || undefined,
          roleLabel: roleLabel.trim() || undefined,
        })),
      }

      const matter = await apiService.createMatter(payload)
      handleOpenChange(false)
      router.push(`/assistant/matter/${matter.id}`)
    } catch (err: any) {
      setSubmitError(
        err?.message?.replace(/^HTTP \d+:\s*/, "") || "Something went wrong. Please try again."
      )
      setLoading(false)
    }
  }

  const selectedArea = PRACTICE_AREAS.find((a) => a.value === form.practiceArea)
  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === form.priority)
  const client = form.parties.find((p) => p.role === "client")
  const opponent = form.parties.find((p) => p.role === "opponent")
  const others = form.parties.filter((p) => p.role === "other")


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          w-full max-w-2xl
          h-[90vh] max-h-[90vh]
          p-0 gap-0
          flex flex-col
          overflow-hidden
          [&>button]:hidden
        "
      >

        {/* Header */}
        <DialogHeader className="sticky top-0 z-20 flex flex-row items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50 bg-background space-y-0">
          <DialogTitle className="text-sm font-semibold tracking-tight m-0">New Matter</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => handleOpenChange(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </DialogHeader>

        {/* Step bar */}
        <div className="sticky top-[57px] z-10 bg-background">
          <StepBar current={step} />
        </div>

        {/* Body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="
            relative
            overflow-y-auto
            flex-1
            scrollbar-hide
          "
        >
          {showTopFade && (
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10" />
          )}

          {showBottomFade && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10" />
          )}

          <div className="px-4 sm:px-6 py-5 space-y-4 w-full mx-auto">

            {/* STEP 1: Matter details */}
            {step === 1 && (
              <div className="space-y-4">

                <Field label="Matter title" required error={errors.title}>
                <div className="relative">
                  <Scale className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-9 text-sm"
                    placeholder="e.g. Sharma vs. State of Rajasthan"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    autoFocus
                  />
                </div>
              </Field>

              <Field label="Practice area" required error={errors.practiceArea}>
                <div className="flex flex-wrap gap-1.5">
                  {PRACTICE_AREAS.map((area) => {
                    const selected = form.practiceArea === area.value
                    return (
                      <button
                        key={area.value}
                        type="button"
                        onClick={() => setForm({ ...form, practiceArea: area.value })}
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11px] font-medium transition-all",
                          selected
                            ? cn(area.bg, area.color, "border-current")
                            : "border-border/50 text-muted-foreground bg-transparent hover:border-border hover:text-foreground"
                        )}
                      >
                        {area.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Court / Forum" required error={errors.court}>
                  <Select value={form.court} onValueChange={(v) => setForm({ ...form, court: v })}>
                    <SelectTrigger className="h-9 text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="Select court…" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {COURTS.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Case / FIR number" hint="Optional">
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="pl-8 h-9 text-xs"
                      placeholder="CRL 1204/2024"
                      value={form.caseNumber}
                      onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Priority">
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITY_OPTIONS.map((opt) => {
                    const selected = form.priority === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, priority: opt.value })}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-md border py-2 text-xs font-medium transition-all",
                          selected
                            ? opt.active
                            : "border-border/50 text-muted-foreground bg-transparent hover:border-border"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", opt.dot)} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label="Brief description" hint="Key facts, context, or initial notes">
                <div className="relative">
                  <AlignLeft className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Textarea
                    className="pl-8 text-xs min-h-[68px] resize-none"
                    placeholder="Summarise the matter in a few lines…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </Field>
            </div>
          )}

            {/* STEP 2: Parties */}
            {step === 2 && (
              <div className="space-y-3">
                {form.parties.map((party) => (
                <PartyCard
                  key={party.id}
                  party={party}
                  canDelete={party.role === "other"}
                  onChange={(updated) => updateParty(party.id, updated)}
                  onDelete={() => deleteParty(party.id)}
                />
              ))}

              {errors.clientName && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {errors.clientName}
                </p>
              )}

              <button
                type="button"
                onClick={addOther}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border/60 py-2.5 px-4 text-xs text-muted-foreground hover:border-[#1A3A5C]/40 hover:text-[#1A3A5C] transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add another party (co-accused, intervenor, third party…)
              </button>
            </div>
          )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <div className="space-y-4">

                <div className="rounded-lg border border-border/40 bg-card px-4 py-1">
                <ReviewRow label="Matter title" value={form.title} />
                <ReviewRow
                  label="Practice area"
                  value={
                    <span className={cn("rounded-full px-2 py-px text-[10px] font-semibold border", selectedArea?.bg, selectedArea?.color)}>
                      {form.practiceArea}
                    </span>
                  }
                />
                <ReviewRow label="Court / Forum" value={form.court} />
                {form.caseNumber && <ReviewRow label="Case number" value={form.caseNumber} />}
                <ReviewRow
                  label="Priority"
                  value={selectedPriority?.label ?? "—"}
                  accent={
                    form.priority === "high" ? "text-red-600" :
                      form.priority === "medium" ? "text-amber-600" :
                        "text-emerald-600"
                  }
                />
                <ReviewRow label="Client" value={client?.name || "—"} />
                {client?.phone && <ReviewRow label="Client phone" value={client.phone} />}
                <ReviewRow label="Respondent" value={opponent?.name || "—"} />
                {opponent?.counsel && <ReviewRow label="Counsel" value={opponent.counsel} />}
                {others.map((o, i) => (
                  <ReviewRow key={o.id} label={o.roleLabel || `Other party ${i + 1}`} value={o.name || "—"} />
                ))}
                {form.description && <ReviewRow label="Notes" value={form.description} />}
              </div>

              {/* AI hint */}
              <div className="flex gap-3 rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1A3A5C] mt-px">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">WorkspaceMemory will be generated</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    The AI will automatically build structured context — key facts, parties, and relevant statutes — injected into every conversation.
                  </p>
                </div>
              </div>

            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 border-t border-border/50 bg-background px-4 sm:px-6 py-3">

          {/* Inline error */}
          {submitError && (
            <p className="flex items-center gap-1.5 text-[11px] text-red-500 mb-2">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {submitError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
                  onClick={back}
                  disabled={loading}
                >
                  ← Back
                </Button>
              ) : (
                <span className="text-[11px] text-muted-foreground">Step {step} of {STEPS.length}</span>
              )}
            </div>

            {step < 3 ? (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs bg-[#1A3A5C] hover:bg-[#244d7a] text-white"
                onClick={next}
              >
                Continue
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs bg-[#1A3A5C] hover:bg-[#244d7a] text-white min-w-[120px]"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating matter…
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Create matter
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}