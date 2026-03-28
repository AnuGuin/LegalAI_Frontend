"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Folder, CalendarDays, ArrowLeft, Loader2, MoreHorizontal, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    apiService,
    MatterDetail,
    MatterMessage,
    MatterDocument,
    MatterDeadline,
    WorkspaceMemory
} from "@/lib/api.service"

import { MatterSidebar } from "@/components/lawyer/chat/matter-sidebar"
import { MatterChat } from "@/components/lawyer/chat/matter-chat"
import { MatterDocuments } from "@/components/lawyer/chat/matter-documents"
import { MatterDeadlines } from "@/components/lawyer/chat/matter-deadlines"
import { MatterMemory } from "@/components/lawyer/chat/matter-memory"

export default function MatterWorkspacePage({ params }: { params: Promise<{ matterId: string }> }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [matter, setMatter] = useState<MatterDetail | null>(null)
    const [messages, setMessages] = useState<MatterMessage[]>([])
    const [documents, setDocuments] = useState<MatterDocument[]>([])
    const [deadlines, setDeadlines] = useState<MatterDeadline[]>([])
    const [memory, setMemory] = useState<WorkspaceMemory | null>(null)

    const resolvedParams = React.use(params)
    const matterId = resolvedParams.matterId

    useEffect(() => {
        async function loadAllData() {
            setLoading(true)
            setError(null)
            try {
                const [
                    matterData,
                    msgsData,
                    docsData,
                    deadlinesData,
                    memoryData
                ] = await Promise.all([
                    apiService.getMatter(matterId),
                    apiService.getMatterMessages(matterId).catch(() => []),
                    apiService.getMatterDocuments(matterId).catch(() => []),
                    apiService.getMatterDeadlines(matterId).catch(() => []),
                    apiService.getMatterMemory(matterId).catch(() => null)
                ])

                setMatter(matterData)
                setMessages(msgsData)
                setDocuments(docsData)
                setDeadlines(deadlinesData)
                setMemory(memoryData)
            } catch (err: any) {
                console.error("Failed to load matter workspace:", err)
                setError(err.message || "Failed to load matter data.")
            } finally {
                setLoading(false)
            }
        }

        if (matterId) {
            loadAllData()
        }
    }, [matterId])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-background p-4">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <ArrowLeft className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold">Matter not found</h2>
                    <p className="text-muted-foreground text-sm">{error}</p>
                    <Button onClick={() => router.push('/dashboard')} className="w-full mt-4">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        /* Use h-full so we fill (lawyer)/layout.tsx's <main> without fighting it */
        <div className="flex h-full w-full flex-col bg-background font-sans overflow-hidden">
            {/* Main Stage */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Left Sidebar — matter details */}
                <MatterSidebar matter={matter} loading={loading} />

                {/* Center — Tabs: AI Chat / Documents / Deadlines */}
                <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
                    <Tabs defaultValue="chat" className="flex flex-col flex-1 h-full overflow-hidden">

                        {/* Tab Headers */}
                        <div className="shrink-0 bg-background/80 backdrop-blur-md px-4 pt-2 border-b border-border/60">
                            <TabsList className="h-10 bg-transparent p-0 gap-6 w-full justify-start">
                                <TabsTrigger
                                    value="chat"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#1A3A5C] rounded-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground h-10 transition-all gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    AI Chat
                                </TabsTrigger>
                                <TabsTrigger
                                    value="documents"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#1A3A5C] rounded-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground h-10 transition-all gap-2"
                                >
                                    <Folder className="h-4 w-4" />
                                    Documents
                                    {documents.length > 0 && (
                                        <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] tabular-nums">
                                            {documents.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="deadlines"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#1A3A5C] rounded-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground h-10 transition-all gap-2"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Deadlines
                                    {deadlines.filter(d => !d.done).length > 0 && (
                                        <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] tabular-nums">
                                            {deadlines.filter(d => !d.done).length}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab Content Areas */}
                        <TabsContent
                            value="chat"
                            className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden m-0 p-0 border-none outline-none"
                        >
                            <MatterChat
                                matterId={matterId}
                                messages={messages}
                                loading={loading}
                                onMessagesChange={setMessages}
                            />
                        </TabsContent>

                        <TabsContent
                            value="documents"
                            className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden m-0 border-none outline-none"
                        >
                            <MatterDocuments
                                matterId={matterId}
                                documents={documents}
                                loading={loading}
                                onDocumentsChange={setDocuments}
                            />
                        </TabsContent>

                        <TabsContent
                            value="deadlines"
                            className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden m-0 border-none outline-none"
                        >
                            <MatterDeadlines
                                matterId={matterId}
                                deadlines={deadlines}
                                loading={loading}
                                onDeadlinesChange={setDeadlines}
                            />
                        </TabsContent>
                    </Tabs>
                </main>

                {/* Right Rail — WorkspaceMemory */}
                <MatterMemory memory={memory} loading={loading} />

            </div>
        </div>
    )
}