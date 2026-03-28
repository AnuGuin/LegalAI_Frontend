"use client"

import * as React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/lawyer/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/lawyer/dashboard/header"
import { CreateMatterModal } from "@/components/lawyer/dashboard/create-matter-modal"

export default function LawyerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar onCreateMatter={() => setModalOpen(true)} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader onCreateMatter={() => setModalOpen(true)} />
          <main className="flex-1 overflow-hidden bg-background">
            {children}
          </main>
        </div>
      </div>
      <CreateMatterModal open={modalOpen} onOpenChange={setModalOpen} />
    </SidebarProvider>
  )
}