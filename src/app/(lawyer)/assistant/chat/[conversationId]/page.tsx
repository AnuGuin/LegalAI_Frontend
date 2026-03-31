"use client"

import React, { useEffect, useState, useRef, use, useCallback, startTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Scale, Send, Paperclip, X, FileText, Copy, ThumbsUp, ThumbsDown, RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Response as MarkdownResponse } from "@/components/citizen/misc/response"
import AITextLoading from "@/components/citizen/misc/ai-text-loading"
import AI_Input from "@/components/citizen/misc/ai-chat"
import { useStream } from "@/hooks/use-stream"
import { toast } from "sonner"


interface Msg { id: string; role: "user" | "assistant"; content: string; createdAt: string; attachments?: string[] }

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000").replace(/\/api$/, "")
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("authToken") : null

function ThinkingIndicator() {
  const [dot, setDot] = useState(0)
  const labels = ["Analyzing legal context…", "Processing your query…", "Researching relevant laws…", "Formulating response…"]
  useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % labels.length), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="text-sm font-mono text-muted-foreground">{labels[dot]}</span>
}


function UserBubble({ msg }: { msg: Msg }) {
  return (
    <div className="flex justify-end w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
        <div className="bg-user-chat-bg text-user-chat-fg rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {msg.attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-1 bg-white/20 rounded px-2 py-0.5 text-xs">
                  <Paperclip className="h-3 w-3" />{f}
                </div>
              ))}
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-right px-1">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  )
}

function AssistantBubble({ msg, isStreaming, streamContent, onRegenerate, getPrevUser }: {
  msg: Msg; isStreaming?: boolean; streamContent?: string
  onRegenerate?: () => void; getPrevUser?: () => string | null
}) {
  const display = isStreaming ? streamContent : msg.content

  const copy = () => { navigator.clipboard.writeText(msg.content); toast("Copied!") }
  const like = () => toast("Thanks for the feedback!")
  const dislike = () => toast("Got it, we'll improve")

  return (
    <div className="w-full relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-foreground rounded-2xl p-4 relative">
        {isStreaming && !display ? (
          <ThinkingIndicator />
        ) : (
          <MarkdownResponse
            className="prose prose-slate dark:prose-invert max-w-none
              prose-p:text-[16px] prose-p:text-foreground prose-p:leading-[1.65] prose-p:my-2
              prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
              prose-h1:text-2xl prose-h1:mt-5 prose-h1:mb-2
              prose-h2:text-xl prose-h2:mt-4 prose-h2:mb-1.5
              prose-h3:text-lg prose-h3:mt-3 prose-h3:mb-1
              prose-strong:text-foreground prose-strong:font-semibold
              prose-em:text-muted-foreground
              prose-code:text-[14px] prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:text-[13px] prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:my-3
              prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:pl-4 prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1.5
              prose-ul:text-[16px] prose-ul:text-foreground prose-ul:my-2
              prose-ol:text-[16px] prose-ol:text-foreground prose-ol:my-2
              prose-li:text-foreground prose-li:leading-[1.65] prose-li:marker:text-primary
              prose-hr:border-border prose-hr:my-4
              prose-table:text-[14px] prose-th:bg-muted prose-th:text-foreground prose-td:text-muted-foreground
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium hover:prose-a:underline prose-a:no-underline"
          >
            {display || ""}
          </MarkdownResponse>
        )}

        {/* Mobile inline actions */}
        <div className="flex items-center gap-0.5 mt-2 md:hidden">
          {[
            { icon: Copy, fn: copy, label: "Copy" },
            { icon: ThumbsUp, fn: like, label: "Like" },
            { icon: ThumbsDown, fn: dislike, label: "Dislike" },
            { icon: RotateCcw, fn: onRegenerate, label: "Regenerate" },
          ].map(({ icon: Icon, fn, label }) => (
            <button key={label} type="button" onClick={fn} aria-label={label}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Desktop hover actions */}
        <div className="hidden md:block absolute bottom-2 right-2 opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto">
          <div className="bg-popover/90 backdrop-blur-sm border border-border/50 rounded-lg p-1 shadow-lg flex items-center gap-0.5">
            {[
              { icon: Copy, fn: copy, label: "Copy" },
              { icon: ThumbsUp, fn: like, label: "Like" },
              { icon: ThumbsDown, fn: dislike, label: "Dislike" },
              { icon: RotateCcw, fn: onRegenerate, label: "Regenerate" },
            ].map(({ icon: Icon, fn, label }) => (
              <button key={label} type="button" onClick={fn} title={label}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex gap-3 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center shrink-0">
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
      </div>
      <div className="flex-1 flex items-center">
        <AITextLoading
          texts={["Analyzing legal context...", "Processing your query...", "Researching relevant laws...", "Formulating response..."]}
          className="!text-sm !font-mono !font-normal !text-muted-foreground"
          interval={1000}
        />
      </div>
    </div>
  )
}

function WelcomeScreen({ onPrompt }: { onPrompt: (p: string) => void }) {
  const prompts = [
    "What are the grounds for anticipatory bail under CrPC?",
    "Explain Section 138 of the Negotiable Instruments Act",
    "Draft a legal notice for breach of contract",
    "Research IPC Section 420 case law",
  ]
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-sm sm:max-w-2xl w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-primary mb-4 sm:mb-6 font-sans">
          Law Research 
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-2">Powered by Nyay Mitra Agent</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 max-w-xs sm:max-w-xl mx-auto">
          {prompts.map(p => (
            <button key={p} type="button" onClick={() => onPrompt(p)}
              className="text-left text-xs sm:text-sm text-muted-foreground border border-border/60 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-card hover:bg-muted/50 hover:text-foreground transition-colors">
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LawyerStandaloneChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { conversationId } = use(params)
  const isNew = conversationId === "new"

  const [messages, setMessages] = useState<Msg[]>([])
  const [convTitle, setConvTitle] = useState<string>("")
  const [convId, setConvId] = useState<string | null>(isNew ? null : conversationId)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSending, setIsSending] = useState(false)
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const { streamingContent, startStreaming } = useStream()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const [isNewConvSelected, setIsNewConvSelected] = useState(false)

  const updateUrl = useCallback((id: string) => {
    window.history.replaceState(null, "", `/assistant/chat/${id}`)
    setConvId(id)
  }, [])

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    isAtBottomRef.current = Math.abs(scrollHeight - scrollTop - clientHeight) < 60
  }
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" })
  }, [])

  useEffect(() => {
    if (isNewConvSelected) { scrollContainerRef.current && (scrollContainerRef.current.scrollTop = 0); setIsNewConvSelected(false) }
    else if (isAtBottomRef.current) scrollToBottom()
  }, [messages.length, isNewConvSelected, scrollToBottom])

  useEffect(() => {
    if (streamingMsgId && isAtBottomRef.current) scrollToBottom(false)
  }, [streamingContent, streamingMsgId, scrollToBottom])

  useEffect(() => {
    if (isNew) { setIsLoading(false); return }
    const token = getToken()
    if (!token) { router.push("/auth/lawyer"); return }
    setIsLoading(true)
    fetch(`${API}/api/lawyer/chat/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setConvTitle(json.data.title ?? "")
          const msgs: Msg[] = (json.data.messages ?? []).map((m: any) => ({
            id: m.id, role: m.role?.toLowerCase() === "user" ? "user" : "assistant",
            content: m.content, createdAt: m.createdAt, attachments: m.attachments,
          }))
          setMessages(msgs)
          setIsNewConvSelected(true)
        }
      })
      .catch(() => toast.error("Could not load conversation"))
      .finally(() => setIsLoading(false))
  }, [conversationId, isNew, router])

  const hasAutoSent = useRef(false)
  useEffect(() => {
    const q = searchParams.get("q")
    if (!q || hasAutoSent.current || isLoading) return
    hasAutoSent.current = true
    setTimeout(() => sendMessage(q), 100)
  }, [isLoading])

  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!content.trim() && !file) return
    const token = getToken()
    if (!token) { toast.error("Not authenticated"); return }

    setIsSending(true)
    let currentConvId = convId

    if (!currentConvId) {
      try {
        const res = await fetch(`${API}/api/lawyer/chat/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: content.slice(0, 80) }),
        })
        const json = await res.json()
        currentConvId = json?.data?.id
        if (!currentConvId) throw new Error("Failed to create conversation")
        updateUrl(currentConvId)
        setConvTitle(content.slice(0, 60))
      } catch (err: any) {
        toast.error("Could not create conversation", { description: err?.message })
        setIsSending(false); return
      }
    }

    const tempId = `temp-${Date.now()}`
    const userMsg: Msg = { 
      id: tempId, 
      role: "user", 
      content, 
      createdAt: new Date().toISOString(),
      attachments: file ? [file.name] : undefined
    }
    setMessages(prev => [...prev, userMsg])

    try {
      let res: Response
      if (file) {
        const formData = new FormData()
        formData.append('message', content)
        formData.append('file', file)
        res = await fetch(`${API}/api/lawyer/chat/conversations/${currentConvId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
      } else {
        res = await fetch(`${API}/api/lawyer/chat/conversations/${currentConvId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: content }),
        })
      }

      const json = await res.json()
      if (!json.success) throw new Error(json.message)

      const assistantContent =
        json.data?.assistantMessage?.content ??
        json.data?.message?.content ??
        json.data?.response ??
        "No response received."
      const assistantId = json.data?.assistantMessage?.id ?? `asst-${Date.now()}`

      const assistantMsg: Msg = { id: assistantId, role: "assistant", content: assistantContent, createdAt: new Date().toISOString() }

      setMessages(prev => [...prev, assistantMsg])
      setStreamingMsgId(assistantId)
      startStreaming(
        assistantContent,
        (chunk) => setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: chunk } : m)),
        () => setStreamingMsgId(null)
      )
    } catch (err: any) {
      toast.error("Failed to get response", { description: err?.message })
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }, [convId, startStreaming, updateUrl])

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col flex-1 min-h-0 relative z-10 min-w-0 overflow-hidden w-full h-full bg-background">
      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 min-h-0 metallic-scrollbar relative transition-all duration-200",
          hasMessages ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        {hasMessages ? (
          <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-36 space-y-3 sm:space-y-4">
            {messages.map((msg, i) => {
              if (msg.role === "user") return <UserBubble key={msg.id} msg={msg} />
              return (
                <AssistantBubble
                  key={msg.id}
                  msg={msg}
                  isStreaming={streamingMsgId === msg.id}
                  streamContent={streamingContent}
                  onRegenerate={() => {
                    for (let j = i - 1; j >= 0; j--) {
                      if (messages[j]?.role === "user") { sendMessage(messages[j]!.content); break }
                    }
                  }}
                />
              )
            })}
            {isSending && !streamingMsgId && <LoadingMessage />}
            <div ref={messagesEndRef} />
          </div>
        ) : isLoading ? (
          
          <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3 justify-end">
              <div className="w-full max-w-[300px] flex flex-col gap-2">
                <div className="h-3 w-4/5 rounded-lg bg-muted animate-pulse ml-auto" />
                <div className="h-3 w-3/5 rounded-lg bg-muted animate-pulse ml-auto" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-full max-w-[900px] flex flex-col gap-2">
                <div className="h-3 w-3/5 rounded-lg bg-muted animate-pulse" />
                <div className="h-3 w-4/5 rounded-lg bg-muted animate-pulse" />
                <div className="h-3 w-3/5 rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <WelcomeScreen onPrompt={(p) => sendMessage(p)} />
        )}
        <div ref={messagesEndRef} className="h-24" />
      </div>

      {/* Floating Input Dock */}
      <div className="absolute bottom-0 left-0 w-full pt-16 pb-6 px-4 z-10 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col items-center pointer-events-auto">
          <AI_Input
            onSendMessage={sendMessage}
            disabled={isSending}
            mode="chat"
            showModeIndicator={false}
            wrapperClassName="w-full shadow-lg rounded-[32px] bg-background border border-border/50"
          />
          <p className="text-center text-[10px] text-muted-foreground mt-1 font-light">Legal AI can make mistakes. Please verify important information.</p>
        </div>
      </div>
    </div>
  )
}