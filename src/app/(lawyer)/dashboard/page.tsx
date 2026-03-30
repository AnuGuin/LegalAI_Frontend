"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  BookOpen,
  FileSignature,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/context/user-context"
import { apiService } from "@/lib/api.service"
import AI_Input from "@/components/citizen/misc/ai-chat"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href?: string
  iconBg: string
  accent?: string
}

const quickActions: QuickAction[] = [
  {
    id: "draft",
    title: "Draft Document",
    description: "Generate pleadings, notices and applications.",
    icon: FileText,
    iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    accent: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
  },
  {
    id: "research",
    title: "Research Cases",
    description: "Search judgments and legal provisions.",
    icon: BookOpen,
    href: "/assistant",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    accent: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
  },
  {
    id: "analyse",
    title: "Analyse Contract",
    description: "Review clauses and flag risks.",
    icon: FileSignature,
    href: "/contract",
    iconBg: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
    accent: "group-hover:border-violet-200 dark:group-hover:border-violet-800",
  },
  {
    id: "deadlines",
    title: "Upcoming Deadlines",
    description: "Hearings, filings and client milestones.",
    icon: CalendarClock,
    href: "/deadlines",
    iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    accent: "group-hover:border-amber-200 dark:group-hover:border-amber-800",
  },
]


export default function LawyerDashboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [lawyerName, setLawyerName] = React.useState("")
  const [triggerDocModal, setTriggerDocModal] = React.useState(false)
  const hour = new Date().getHours()
  const greeting = hour < 7 ? "Late night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  React.useEffect(() => {
    if (user?.name) { setLawyerName(user.name); return }
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lawyer/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { const n = j?.data?.name || j?.data?.lawyer?.name; if (n) setLawyerName(n) })
      .catch(() => {})
  }, [user])



  const displayName = lawyerName || user?.name || "Counsellor"
  const firstName = displayName.split(" ")[0]

  const handleSendMessage = async (message: string, file?: File) => {
    if (!message.trim() && !file) return
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (!token) { router.push("/auth/lawyer"); return }

      const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lawyer/chat/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: message.trim().slice(0, 80) || "New conversation" }),
      })
      const createJson = await createRes.json()
      const convId = createJson?.data?.id
      if (!convId) throw new Error("Could not create conversation")

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lawyer/chat/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: message.trim() }),
      })

      router.push(`/assistant/chat/${convId}`)
    } catch {
      router.push(`/assistant/chat/new?q=${encodeURIComponent(message.trim())}`)
    }
  }

  const handleDocumentGenerationRequest = async (result: any) => {
    try {
      const { templateName, data, format } = result
      const docResult = await apiService.generateDocument(templateName, data, format || 'pdf')
      apiService.downloadBlob(docResult.blob, docResult.filename)
    } catch (error) {
      console.error("Document generation failed", error)
    }
  }

  return (
    <div className="relative w-full h-full min-h-[calc(100dvh-64px)]">
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center px-6"
        style={{ top: "calc(50% - 10px)" }}
      >
        <div className="w-full max-w-3xl space-y-4">

          {/* Greeting */}
          <div className="text-center">
            <h1
              className="text-4xl font-semibold text-foreground"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              {greeting}, {firstName}!
            </h1>
          </div>

          {/* AI Input */}
          <AI_Input
            onSendMessage={handleSendMessage}
            onDocumentGenerationRequest={handleDocumentGenerationRequest}
            triggerDocModal={triggerDocModal}
            onTriggerDocModal={() => setTriggerDocModal(false)}
            mode="chat"
            showModeIndicator={false}
            wrapperClassName="w-full"
            inputMinHeight={90}
          />

          {/* Quickstart cards - below the input */}
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              if (action.id === 'draft') {
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setTriggerDocModal(true)}
                    className={cn(
                      "group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 text-left",
                      "hover:shadow-sm transition-all duration-200", action.accent
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", action.iconBg)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </button>
                )
              }
              return (
                <Link
                  key={action.id}
                  href={action.href || "#"}
                  className={cn(
                    "group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 text-left",
                    "hover:shadow-sm transition-all duration-200", action.accent
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", action.iconBg)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {action.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}