"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/lawyer/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/lawyer/dashboard/header"
import { CreateMatterModal } from "@/components/lawyer/dashboard/create-matter-modal"

const isSpecificPage = (pathname: string) => {
  const chatMatch = pathname.match(/^\/assistant\/chat\/([^/]+)$/)
  const isChat = chatMatch && chatMatch[1] && chatMatch[1] !== 'new'
  const matterMatch = pathname.match(/^\/assistant\/matter\/([^/]+)$/)
  const isMatter = matterMatch && matterMatch[1]
  return !!(isChat || isMatter)
}

export default function LawyerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const pathname = usePathname()
  const isSpecific = isSpecificPage(pathname)

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden relative bg-background">
        {/* Prismatic Aurora Burst - Multi-layered Gradient */}
        <div
          className="absolute inset-0 z-0 transition-opacity duration-700 ease-in-out pointer-events-none"
          style={{
            opacity: isSpecific ? 0 : 1,
            background: isDark
              ? `radial-gradient(ellipse 100% 70% at 55% 58%, rgba(138, 43, 226, 0.20), transparent 60%),
                 radial-gradient(ellipse 85% 55% at 45% 53%, rgba(0, 255, 255, 0.14), transparent 55%),
                 radial-gradient(ellipse 75% 50% at 65% 63%, rgba(255, 20, 147, 0.16), transparent 55%),
                 radial-gradient(ellipse 85% 45% at 58% 50%, rgba(255, 215, 0, 0.09), transparent 45%),
                 #000000`
              : `radial-gradient(ellipse 100% 70% at 55% 58%, rgba(59, 130, 246, 0.18), transparent 60%),
                 radial-gradient(ellipse 85% 55% at 45% 53%, rgba(14, 165, 233, 0.22), transparent 55%),
                 radial-gradient(ellipse 75% 50% at 65% 63%, rgba(56, 189, 248, 0.18), transparent 55%),
                 radial-gradient(ellipse 85% 45% at 58% 50%, rgba(37, 99, 235, 0.12), transparent 45%),
                 #ffffff`,
          }}
        />
        <div className="relative z-10 flex h-full w-full overflow-hidden flex-1">
          <AppSidebar onCreateMatter={() => setModalOpen(true)} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <DashboardHeader onCreateMatter={() => setModalOpen(true)} />
            <main className="flex-1 overflow-hidden bg-transparent">
              {children}
            </main>
          </div>
        </div>
      </div>
      <CreateMatterModal open={modalOpen} onOpenChange={setModalOpen} />
    </SidebarProvider>
  )
}