"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  BookOpen,
  FileSignature,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/context/user-context"
import AI_Input from "@/components/citizen/misc/ai-chat"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  iconBg: string
}

const quickActions: QuickAction[] = [
  {
    id: "draft",
    title: "Draft Document",
    description: "Generate pleadings, notices and applications.",
    icon: FileText,
    href: "/lawyer/assistant",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: "research",
    title: "Research Cases",
    description: "Search judgments and legal provisions.",
    icon: BookOpen,
    href: "/lawyer/assistant",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "analyse",
    title: "Analyse Contract",
    description: "Review clauses and flag risks.",
    icon: FileSignature,
    href: "/lawyer/assistant",
    iconBg: "bg-violet-50 text-violet-600",
  },
  {
    id: "deadlines",
    title: "Upcoming Deadlines",
    description: "Hearings, filings and client milestones.",
    icon: CalendarClock,
    href: "/lawyer/dashboard/deadlines",
    iconBg: "bg-amber-50 text-amber-600",
  },
]

export default function LawyerDashboardPage() {
  const { user } = useUser()
  const [lawyerName, setLawyerName] = React.useState<string>("")

  const hour = new Date().getHours()
  const greeting =
    hour < 7 ? "Late night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  React.useEffect(() => {
    if (user?.name) {
      setLawyerName(user.name)
      return
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        const name = json?.data?.name || json?.data?.user?.name
        if (name) setLawyerName(name)
      })
      .catch(() => { })
  }, [user])

  const displayName = lawyerName || user?.name || "Counsellor"
  const firstName = displayName.split(" ")[0]

  const handleSendMessage = (message: string, file?: File) => {
    console.log("dashboard send:", message, file)
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
            mode="chat"
            showModeIndicator={false}
            wrapperClassName="w-full"
            inputMinHeight={90}
          />

          {/* Quickstart cards — below the input */}
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className={cn(
                    "group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4",
                    "hover:border-border hover:shadow-sm transition-all duration-200"
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