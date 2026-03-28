"use client"

import { useState, useRef, useEffect } from "react"
import { MatterMessage, apiService } from "@/lib/api.service"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import AI_Input from "@/components/citizen/misc/ai-chat"
import { Brain, Loader2 } from "lucide-react"

import { Response as MarkdownResponse } from "@/components/citizen/misc/response"
import { useStream } from "@/hooks/use-stream"

interface MatterChatProps {
    matterId: string
    messages: MatterMessage[]
    loading?: boolean
    onMessagesChange?: (messages: MatterMessage[]) => void
}

function MessageBubble({ msg }: { msg: MatterMessage }) {
    const isUser = msg.role === "user"

    if (isUser) {
        return (
            <div className="flex justify-end w-full">
                <div className="max-w-[75%] flex flex-col items-end gap-1">
                    <div className="bg-[#1A3A5C] text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                        {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-4 w-full group">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 mt-1">
                <Brain className="h-4 w-4" />
            </div>
            <div className="flex-1 flex flex-col gap-1 overflow-hidden min-w-0">
                <div className="text-foreground text-sm leading-relaxed py-1">
                    <MarkdownResponse
                        className="prose prose-slate dark:prose-invert max-w-none
                        prose-p:text-[15px] prose-p:leading-[1.6] prose-p:my-2
                        prose-headings:text-foreground prose-headings:font-semibold
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono
                        prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:my-3
                        prose-ul:my-2 prose-li:my-0.5
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
                    >
                        {msg.content}
                    </MarkdownResponse>
                    {msg.metadata?.citation && (
                        <p className="mt-2 text-xs text-primary cursor-pointer hover:underline">
                            File citation: ({msg.metadata.citation})
                        </p>
                    )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    )
}

function ThinkingBubble() {
    return (
        <div className="flex items-start gap-3 w-full">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 mt-0.5">
                <Brain className="h-4 w-4" />
            </div>
            <div className="bg-muted/60 dark:bg-muted/30 border border-border/40 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
            </div>
        </div>
    )
}

function EmptyChat() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                <Brain className="h-7 w-7" />
            </div>
            <div>
                <p className="font-semibold text-foreground text-sm">Start a conversation</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Ask questions about this matter, request legal research, or get help drafting documents.
                </p>
            </div>
        </div>
    )
}

export function MatterChat({ matterId, messages, loading, onMessagesChange }: MatterChatProps) {
    const [localMessages, setLocalMessages] = useState<MatterMessage[]>(messages)
    const [isThinking, setIsThinking] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    // Sync external messages changes
    useEffect(() => {
        setLocalMessages(messages)
    }, [messages])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [localMessages, isThinking])

    const handleSendMessage = async (content: string, file?: File) => {
        if (!content.trim() && !file) return

        const tempId = `temp-${Date.now()}`
        const userMsg: MatterMessage = {
            id: tempId,
            content: content.trim(),
            role: "user",
            createdAt: new Date().toISOString(),
            attachments: file ? [file.name] : undefined
        }

        const newMessages = [...localMessages, userMsg]
        setLocalMessages(newMessages)
        onMessagesChange?.(newMessages)
        setIsThinking(true)

        try {
            const response = await apiService.sendMatterMessage(matterId, content)
            const finalMessages = [...newMessages, response]
            setLocalMessages(finalMessages)
            onMessagesChange?.(finalMessages)
        } catch (error) {
            toast.error("Failed to get response", {
                description: "The AI agent encountered an error processing your message."
            })
            // Revert user message on error
            setLocalMessages(localMessages)
            onMessagesChange?.(localMessages)
        } finally {
            setIsThinking(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-background overflow-hidden">
                <div className="flex-1 p-6 space-y-5 max-w-3xl mx-auto w-full">
                    <div className="flex justify-end">
                        <Skeleton className="h-14 w-[60%] rounded-2xl rounded-tr-sm" />
                    </div>
                    <div className="flex gap-3 items-start">
                        <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                        <Skeleton className="h-28 w-[75%] rounded-2xl rounded-tl-sm" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-12 w-[50%] rounded-2xl rounded-tr-sm" />
                    </div>
                    <div className="flex gap-3 items-start opacity-50">
                        <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                        <Skeleton className="h-20 w-[70%] rounded-2xl rounded-tl-sm" />
                    </div>
                </div>
                <div className="px-4 pb-2">
                    <Skeleton className="h-[90px] w-full rounded-[32px]" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Messages scroll area */}
            <ScrollArea className="flex-1 min-h-0">
                <div className={cn(
                    "flex flex-col gap-4 px-4 pt-6 pb-2 max-w-3xl mx-auto w-full",
                    localMessages.length === 0 && "h-full"
                )}>
                    {localMessages.length === 0 && !isThinking ? (
                        <EmptyChat />
                    ) : (
                        <>
                            {localMessages.map(msg => (
                                <MessageBubble key={msg.id} msg={msg} />
                            ))}
                            {isThinking && <ThinkingBubble />}
                        </>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* AI Input — same aesthetic as dashboard */}
            <div className="shrink-0 px-4 pb-3 border-t border-border/40 bg-background/80 backdrop-blur-sm">
                <AI_Input
                    onSendMessage={handleSendMessage}
                    mode="agentic"
                    showModeIndicator={true}
                    wrapperClassName="w-full max-w-3xl mx-auto"
                    inputMinHeight={72}
                />
            </div>
        </div>
    )
}
