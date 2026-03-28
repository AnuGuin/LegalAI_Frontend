"use client"

import { WorkspaceMemory } from "@/lib/api.service"
import { Brain, RefreshCw, Circle, BookOpen, AlertCircle, FileText, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MatterMemoryProps {
    memory: WorkspaceMemory | null
    loading: boolean
}

const iconMap: Record<string, any> = {
    'facts': FileText,
    'precedents': BookOpen,
    'statutes': Scale,
    'issues': AlertCircle
}

export function MatterMemory({ memory, loading }: MatterMemoryProps) {
    if (loading || !memory) {
        return (
            <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-border/60 bg-muted/20 pb-4 h-full">
                <div className="p-4">Loading Workspace Memory...</div>
            </aside>
        )
    }

    return (
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-border/60 overflow-y-auto bg-card h-full pb-4">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0 sticky top-0 bg-card z-10">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <Brain className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-foreground tracking-tight block leading-none">Context Memory</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-muted">
                    <RefreshCw className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Warning blurb */}
            <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    This context acts as the AI's long-term memory for this matter. It is automatically injected into every message.
                </p>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 pb-8">
                {(memory.sections ?? []).map((section, i) => {
                    const Icon = iconMap[section.category.toLowerCase()] || Circle
                    
                    return (
                        <div key={i} className="px-4 py-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className="h-4 w-4 text-primary" />
                                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    {section.category}
                                </p>
                            </div>
                            <ul className="space-y-2 mt-1">
                                {section.points.map((pt, j) => (
                                    <li key={j} className="flex items-start gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0 mt-1.5" />
                                        <span className="text-xs text-muted-foreground leading-relaxed">{pt}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                })}
            </div>

        </aside>
    )
}
