"use client"

import { Building2, User } from "lucide-react"
import { MatterDetail } from "@/lib/api.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface MatterSidebarProps {
    matter: MatterDetail | null
    loading?: boolean
}

export function MatterSidebar({ matter, loading }: MatterSidebarProps) {
    if (loading || !matter) {
        return (
            <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/60 bg-muted/20">
                <div className="flex flex-col gap-4 p-5">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 mt-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </div>
            </aside>
        )
    }

    return (
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/60 bg-muted/20 pb-4 h-full">
            <ScrollArea className="flex-1 px-5 py-6">
                <div className="flex flex-col gap-5">

                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/20 bg-primary/5">
                                {matter.practiceArea}
                            </Badge>
                            {matter.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-[10px] uppercase font-semibold">
                                    Urgent
                                </Badge>
                            )}
                        </div>
                        <h2 className="text-xl font-semibold leading-tight text-foreground tracking-tight">
                            {matter.title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {matter.description}
                        </p>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Metadata items */}
                    <div className="grid gap-3 text-sm">
                        {matter.court && (
                            <div className="grid grid-cols-[80px_1fr] items-start">
                                <span className="text-xs font-medium text-muted-foreground mt-0.5">Court</span>
                                <span className="text-foreground text-sm font-medium">{matter.court}</span>
                            </div>
                        )}
                        {matter.caseNumber && (
                            <div className="grid grid-cols-[80px_1fr] items-start">
                                <span className="text-xs font-medium text-muted-foreground mt-0.5">Case No</span>
                                <span className="text-foreground text-sm font-medium font-mono">{matter.caseNumber}</span>
                            </div>
                        )}
                        {matter.filingDate && (
                            <div className="grid grid-cols-[80px_1fr] items-start">
                                <span className="text-xs font-medium text-muted-foreground mt-0.5">Filed</span>
                                <span className="text-foreground text-sm font-medium">{new Date(matter.filingDate).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    <Separator className="opacity-50 mt-1" />

                    {/* Client & Opponent */}
                    <div className="flex flex-col gap-4">
                        {/* Client */}
                        {matter.client && (
                            <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Client</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {matter.client.type === 'company' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{matter.client.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{matter.client.role || 'Client'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Opponent */}
                        {matter.opponent && (
                            <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Opposing</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                        {matter.opponent.type === 'company' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{matter.opponent.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{matter.opponent.role || 'Opponent'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </ScrollArea>
        </aside>
    )
}
