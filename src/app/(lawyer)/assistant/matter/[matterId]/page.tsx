"use client"

import React, { useEffect, useState, useRef, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Brain, Scale, Edit2, Save, X, RefreshCw,
  Clock, Building2, User as UserIcon, AlertCircle, 
  Copy, ThumbsUp, ThumbsDown, RotateCcw, Paperclip,
  Trash2, FileText, Loader2, Sparkles,
  Plus, Search, Globe, ChevronRight, CheckCircle2,
  PanelLeftClose, PanelRightClose, PanelLeft, PanelRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Response as MarkdownResponse } from "@/components/citizen/misc/response"
import AITextLoading from "@/components/citizen/misc/ai-text-loading"
import { useStream } from "@/hooks/use-stream"
import AI_Input from "@/components/citizen/misc/ai-chat"
import { DocumentGenerationModal } from "@/components/citizen/chat/document-generation-modal" 
import {
  apiService,
  type MatterDetail,
  type MatterMessage,
  type MatterDocument,
  type MatterDeadline,
  type WorkspaceMemory,
} from "@/lib/api.service"

const stageBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
}

// Left Panel: Workspace 
function LeftPanel({ 
  matterId, 
  matter,
  memory,
  documents,
  deadlines, 
  loading, 
  onDocumentsChange,
  onDeadlinesChange, 
  onMemoryUpdate,
  onClose
}: {
  matterId: string; 
  matter: MatterDetail | null;
  memory: WorkspaceMemory | null;
  documents: MatterDocument[];
  deadlines: MatterDeadline[]; 
  loading: boolean; 
  onDocumentsChange?: (d: MatterDocument[]) => void;
  onDeadlinesChange?: (d: MatterDeadline[]) => void;
  onMemoryUpdate?: () => void;
  onClose: () => void;
}) {
  const [localDocs, setLocalDocs] = useState<MatterDocument[]>(documents)
  const [localDeadlines, setLocalDeadlines] = useState<MatterDeadline[]>(deadlines)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  
  const [isDocGenModalOpen, setIsDocGenModalOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false)

  const [notesInput, setNotesInput] = useState("")
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const [deadlineForm, setDeadlineForm] = useState({ title: "", date: "", notes: "" })
  const [isSavingDeadline, setIsSavingDeadline] = useState(false)
  
  useEffect(() => { setLocalDocs(documents) }, [documents])
  useEffect(() => { setLocalDeadlines(deadlines) }, [deadlines])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setIsUploading(true)
    const id = toast.loading("Ingesting source document into AI Vector Store...")
    try {
      const doc = await apiService.uploadMatterDocument(matterId, file)
      const updated = [doc, ...localDocs]; 
      setLocalDocs(updated); 
      onDocumentsChange?.(updated);
      
      toast.success("Source ingested! Updating AI memory...", { id })
      
      onMemoryUpdate?.() 
      
      setTimeout(() => {
        onMemoryUpdate?.()
      }, 4000)
      
      setTimeout(() => {
        onMemoryUpdate?.()
        toast.success("Workspace Memory updated with new document facts.", { id: 'memory-update' });
      }, 9000)

    } catch (err: any) { 
      toast.error(err?.message || "Upload failed", { id }) 
    } finally { 
      setIsUploading(false); 
      if (e.target) e.target.value = "" 
    }
  }

  const handleDelete = async (docId: string) => {
    const id = toast.loading("Removing source...")
    try {
      await apiService.deleteMatterDocument(matterId, docId)
      const updated = localDocs.filter(d => d.id !== docId); 
      setLocalDocs(updated); 
      onDocumentsChange?.(updated)
      toast.success("Source removed from workspace memory", { id })
      onMemoryUpdate?.()
    } catch { toast.error("Delete failed", { id }) }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    const id = toast.loading("Saving Lawyer Notes...")
    try {
      await apiService.updateMatterMemory(matterId, { lawyerNotes: notesInput })
      toast.success("Notes updated in Context Memory", { id })
      setIsNotesModalOpen(false)
      onMemoryUpdate?.()
    } catch (error: any) {
      toast.error("Failed to save notes", { id, description: error.message })
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleCreateDeadline = async () => {
    if (!deadlineForm.title || !deadlineForm.date) return toast.error("Please fill in title and date.")
    setIsSavingDeadline(true)
    const id = toast.loading("Creating deadline...")
    try {
      const newDeadline = await apiService.addMatterDeadline(matterId, {
        title: deadlineForm.title,
        dueDate: new Date(deadlineForm.date).toISOString(),
        notes: deadlineForm.notes,
        urgency: "normal",
        month: "",
        day: "",
      });
      const updated = [...localDeadlines, newDeadline]
      setLocalDeadlines(updated)
      onDeadlinesChange?.(updated)
      toast.success("Deadline created successfully", { id })
      setDeadlineForm({ title: "", date: "", notes: "" })
    } catch (error: any) {
      toast.error("Failed to create deadline", { id, description: error.message })
    } finally {
      setIsSavingDeadline(false)
    }
  }

  const handleToggleDeadline = async (deadlineId: string, done: boolean) => {
    try {
      const updated = localDeadlines.map(d => d.id === deadlineId ? { ...d, done } : d)
      setLocalDeadlines(updated)
      onDeadlinesChange?.(updated)
      
      await apiService.toggleMatterDeadline(matterId, deadlineId, done)
    } catch (error) {
      toast.error("Failed to update deadline")
      setLocalDeadlines(localDeadlines)
      onDeadlinesChange?.(localDeadlines)
    }
  }

  const client = (matter?.parties ?? []).find((p: any) => p.role === "client")
  const opponent = (matter?.parties ?? []).find((p: any) => p.role === "opponent")

  return (
    <>
      <aside className="w-full h-full flex flex-col bg-card border-r lg:border border-border/60 lg:rounded-2xl overflow-hidden shadow-2xl lg:shadow-none min-h-0">
        <div className="p-4 flex items-center justify-between border-b border-border/50 shrink-0">
          <h2 className="text-sm font-medium text-foreground">Workspace</h2>
          <Button onClick={onClose} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 [&_[data-slot=scroll-area-scrollbar]]:hidden">
          <div className="p-4 space-y-6">
            {loading || !matter ? (
              <div className="space-y-4">
                {[80, 55, 90, 45].map((w, i) => <Skeleton key={i} className="h-4 rounded bg-muted/50" style={{ width: `${w}%` }} />)}
              </div>
            ) : (
              <>
                {/* Matter Details Card */}
                <div className="bg-muted/30 rounded-xl border border-border/50 p-4 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {matter.practiceArea && (
                      <Badge className="text-[10px] bg-muted text-foreground hover:bg-muted/80 border-none transition-colors">{matter.practiceArea}</Badge>
                    )}
                    <Badge variant="outline" className={cn("text-[10px] border", stageBadge[matter.stage || "ACTIVE"] ?? stageBadge.ACTIVE)}>
                      {(matter.stage || "ACTIVE")}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { label: "Case No.", value: matter.caseNumber },
                      { label: "Court", value: matter.court },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>

                  {(client || opponent) && (
                    <div className="pt-3 space-y-2 border-t border-border/50">
                      {[
                        { party: client, label: "Client", icon: UserIcon },
                        { party: opponent, label: "Opponent", icon: Building2 },
                      ].filter(({ party }) => !!party).map(({ party, label, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded flex items-center justify-center bg-background border border-border/50 text-muted-foreground shrink-0">
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{(party as any).name}</p>
                            <p className="text-[10px] text-muted-foreground">{label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Chips */}
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setIsDocGenModalOpen(true)}
                    className="bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors rounded-xl p-3 flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-md flex items-center justify-center bg-blue-500/10 text-blue-500">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-foreground">Generate Doc</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setIsDeadlineModalOpen(true)}
                    className="bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors rounded-xl p-3 flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-md flex items-center justify-center bg-orange-500/10 text-orange-500">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-foreground">Deadlines</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      setNotesInput(memory?.lawyerNotes || "")
                      setIsNotesModalOpen(true)
                    }}
                    className="col-span-2 bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors rounded-xl p-3 flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-md flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                      <Edit2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-foreground">Lawyer Notes</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-border/50 w-full" />

            {/* Sources Section */}
            <div className="space-y-3 pb-8">
              <h3 className="text-sm font-medium text-foreground mb-1">Sources</h3>
              
              <input type="file" ref={fileRef} className="hidden" onChange={handleUpload} disabled={isUploading} />
              <Button 
                disabled={isUploading} 
                onClick={() => fileRef.current?.click()} 
                variant="outline"
                className="w-full gap-2 justify-center h-10 rounded-xl transition-all border-border hover:bg-muted/50"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isUploading ? "Uploading..." : "Add sources"}
              </Button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search the web for new sources" 
                  className="w-full bg-muted/30 border border-border/50 rounded-xl h-10 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="text-xs font-medium text-muted-foreground">Select all sources</span>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {loading ? (
                  <div className="space-y-2 pt-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted/50" />)}
                  </div>
                ) : localDocs.length === 0 ? (
                   <div className="text-center py-8">
                     <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                     <p className="text-xs text-muted-foreground">No sources added yet</p>
                   </div>
                ) : (
                  <div className="space-y-1">
                    {localDocs.map(doc => (
                      <div key={doc.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-6 w-6 rounded flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-medium text-foreground truncate">{doc.title || doc.name || "Document"}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(doc.id)}>
                             <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </ScrollArea>
      </aside>

      {/* Doc Gen Modal */}
      <DocumentGenerationModal 
        open={isDocGenModalOpen} 
        onOpenChange={setIsDocGenModalOpen} 
      />

      {/* Lawyer Notes Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-md border border-border/60 bg-popover rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-emerald-500" />
              Lawyer Notes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground">
              These notes are securely injected into the AI's context memory for this specific matter.
            </p>
            <Textarea 
              className="min-h-[150px] resize-none bg-muted/30 border-border/50 text-sm"
              placeholder="Add your case strategy, internal facts, or personal reminders here..."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNotesModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
              {isSavingNotes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Deadline Modal */}
      <Dialog open={isDeadlineModalOpen} onOpenChange={setIsDeadlineModalOpen}>
        <DialogContent className="sm:max-w-md border border-border/60 bg-popover rounded-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Matter Deadlines
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto -mx-6 px-6 max-h-[40vh] [&_[data-slot=scroll-area-scrollbar]]:hidden">
            <div className="space-y-3 py-1">
              {localDeadlines.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50">
                  No deadlines yet. Create one below.
                </div>
              ) : (
                localDeadlines.map((d) => (
                  <div key={d.id} className={cn("p-3 rounded-xl border bg-card flex items-start gap-3 transition-colors", d.done && "opacity-70")}>
                    <button 
                      onClick={() => handleToggleDeadline(d.id, !d.done)}
                      className={cn("mt-0.5 shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors", d.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 hover:border-foreground")}
                    >
                      {d.done && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                       <p className={cn("text-sm font-medium leading-none mb-1 text-foreground", d.done && "line-through text-muted-foreground")}>{d.title}</p>
                       <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1.5">
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(d.dueDate).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</span>
                         {d.urgency === 'urgent' && !d.done && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-red-200 text-red-600 bg-red-50 dark:bg-red-950/30">Urgent</Badge>}
                       </div>
                       {d.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{d.notes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 pt-4 mt-2 space-y-4 shrink-0">
            <h4 className="text-xs font-semibold text-foreground">Add New Deadline</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Input 
                  placeholder="e.g., File Written Statement" 
                  className="bg-muted/30 border-border/50 h-8 text-xs"
                  value={deadlineForm.title}
                  onChange={(e) => setDeadlineForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Input 
                    type="datetime-local" 
                    className="bg-muted/30 border-border/50 h-8 text-xs"
                    value={deadlineForm.date}
                    onChange={(e) => setDeadlineForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Button onClick={handleCreateDeadline} disabled={isSavingDeadline} className="w-full h-8 text-xs">
                    {isSavingDeadline ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : "Add Deadline"}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Textarea 
                  placeholder="Optional details..." 
                  className="bg-muted/30 border-border/50 resize-none min-h-[60px] text-xs"
                  value={deadlineForm.notes}
                  onChange={(e) => setDeadlineForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Center Panel:Chat 
function ChatPanel({ 
  matterId, 
  matter, 
  messages, 
  documents,
  onMessagesChange, 
  onMemoryUpdate,
  leftOpen,
  rightOpen,
  onToggleLeft,
  onToggleRight
}: {
  matterId: string; 
  matter: MatterDetail | null;
  messages: MatterMessage[]; 
  documents: MatterDocument[];
  loading: boolean; 
  onMessagesChange: (m: MatterMessage[]) => void; 
  onMemoryUpdate?: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}) {
  const [localMessages, setLocalMessages] = useState<MatterMessage[]>(messages)
  const [isThinking, setIsThinking] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const { streamingContent, startStreaming } = useStream()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  useEffect(() => { setLocalMessages(messages) }, [messages])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    isAtBottomRef.current = Math.abs(scrollHeight - scrollTop - clientHeight) < 60
  }
  
  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" })
  }

  useEffect(() => { if (isAtBottomRef.current) scrollToBottom() }, [localMessages.length, isThinking])
  useEffect(() => { if (streamingId && isAtBottomRef.current) scrollToBottom(false) }, [streamingContent, streamingId])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    setIsThinking(true)
    const tempId = `temp-${Date.now()}`
    const userMsg: MatterMessage = { id: tempId, content, role: "user", createdAt: new Date().toISOString() }
    const withUser = [...localMessages, userMsg]
    setLocalMessages(withUser); onMessagesChange(withUser)

    try {
      const response = await apiService.sendMatterMessage(matterId, content)
      const withAssistant = [...withUser, response]
      setLocalMessages(withAssistant); onMessagesChange(withAssistant)
      setStreamingId(response.id)
      startStreaming(response.content, (chunk) => {
        setLocalMessages(prev => prev.map(m => m.id === response.id ? { ...m, content: chunk } : m))
      }, () => {
        setStreamingId(null);
        if (onMemoryUpdate) onMemoryUpdate();
      })
    } catch (err: any) {
      toast.error("Message Failed", { description: err?.message })
      setLocalMessages(localMessages); onMessagesChange(localMessages)
    } finally { setIsThinking(false) }
  }, [localMessages, matterId, onMessagesChange, startStreaming, onMemoryUpdate])

  const hasMessages = localMessages.length > 0

  return (
    <main className="flex-1 flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden relative h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          {!leftOpen && (
            <Button onClick={onToggleLeft} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-sm font-medium text-foreground">Chat</h2>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
             <Globe className="h-4 w-4" />
          </Button>
          {!rightOpen && (
            <Button onClick={onToggleRight} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <PanelRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-6 py-6 metallic-scrollbar">
        {!hasMessages && !isThinking ? (
          <div className="max-w-2xl mx-auto pt-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
              <Scale className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-medium text-foreground leading-tight mb-4 font-sans">
              {matter?.title || "Matter Workspace"}
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline" className="bg-muted border-border/50 text-muted-foreground font-normal">
                {documents.length} sources
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {matter?.description || "This workspace connects your uploaded sources to an agentic legal AI. Ask questions, request drafting, or summarize case facts."}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-36">
            {localMessages.map((msg) => {
              const isUser = msg.role?.toLowerCase() === "user" || msg.role?.toLowerCase() === "human"
              const isStreaming = streamingId === msg.id
              const display = isStreaming ? streamingContent : msg.content

              if (isUser) return (
                <div key={msg.id} className="flex justify-end w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="max-w-[85%] flex flex-col items-end gap-1 sm:max-w-[75%] md:max-w-[70%]">     
                    <div className="bg-user-chat-bg text-user-chat-fg px-4 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm w-full">
                      {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {msg.attachments.map((f, i) => (
                            <div key={i} className="flex items-center gap-1 bg-white/20 rounded px-2 py-1 text-xs">
                              <Paperclip className="h-3 w-3" />{f}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    </div>
                    {msg.createdAt && (
                      <span className="text-[10px] text-muted-foreground px-1">   
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              )

              // AI Message 
              return (
                <div key={msg.id} className="flex items-start gap-4 w-full group animate-in fade-in slide-in-from-bottom-2 duration-300">
                 
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden min-w-0 text-foreground rounded-2xl relative">
                    {isStreaming && !display ? (
                      <div className="flex gap-3 items-center py-2">
                        <div className="h-6 w-6 rounded-full border border-primary/20 flex items-center justify-center shrink-0">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        </div>
                        <AITextLoading texts={["Analyzing legal context...", "Researching memory...", "Formulating response..."]} className="!text-sm !font-mono !font-normal !text-muted-foreground" interval={1000} />
                      </div>
                    ) : (
                      <MarkdownResponse
                        className="prose prose-slate dark:prose-invert max-w-none font-sans
                          prose-p:font-sans prose-headings:font-sans
                          prose-p:text-[15px] prose-p:text-foreground prose-p:leading-[1.7] prose-p:my-2
                          prose-headings:text-foreground prose-headings:font-semibold
                          prose-h1:text-xl prose-h1:mt-6 prose-h1:mb-3
                          prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-2
                          prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1
                          prose-strong:text-foreground prose-strong:font-semibold
                          prose-em:text-muted-foreground
                          prose-code:text-[13px] prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                          prose-pre:text-[13px] prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:my-4
                          prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:pl-4 prose-blockquote:bg-transparent prose-blockquote:py-1
                          prose-ul:text-[15px] prose-ul:text-foreground prose-ul:my-3
                          prose-ol:text-[15px] prose-ol:text-foreground prose-ol:my-3
                          prose-li:text-foreground prose-li:leading-[1.7] prose-li:marker:text-primary
                          prose-hr:border-border/50 prose-hr:my-6
                          prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-a:no-underline"
                      >
                        {display}
                      </MarkdownResponse>
                    )}

                    {/* Hover Actions */}
                    <div className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {[
                        { icon: Copy, fn: () => { navigator.clipboard.writeText(msg.content); toast("Copied!") }, label: "Copy" },
                        { icon: ThumbsUp, fn: () => toast("Thanks for the feedback!"), label: "Good response" },
                        { icon: ThumbsDown, fn: () => toast("Got it, we'll improve"), label: "Bad response" },
                        { icon: RotateCcw, fn: () => {
                          const idx = localMessages.findIndex(m => m.id === msg.id)
                          for (let i = idx - 1; i >= 0; i--) {
                            if (localMessages[i]?.role?.toLowerCase() === "user" || localMessages[i]?.role?.toLowerCase() === "human") { sendMessage(localMessages[i]!.content); break }
                          }
                        }, label: "Regenerate" },
                      ].map(({ icon: Icon, fn, label }) => (
                        <button key={label} type="button" onClick={fn} title={label} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {isThinking && !streamingId && (
              <div className="animate-in fade-in duration-300 py-2">
                <div className="flex gap-3 items-center">
                  <div className="h-6 w-6 rounded-full border border-primary/20 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                  <AITextLoading texts={["Analyzing legal context...", "Processing query...", "Drafting..."]} className="!text-sm !font-mono !font-normal !text-muted-foreground" interval={1000} />
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Floating Input Dock */}
      <div className="absolute bottom-0 left-0 w-full pt-16 pb-6 px-4 z-10 bg-gradient-to-t from-card via-card/95 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col items-center pointer-events-auto">
          <AI_Input 
             onSendMessage={sendMessage} 
             disabled={isThinking} 
             mode="agentic" 
             showModeIndicator={false}
             hasActiveConversation={true}
             wrapperClassName="w-full rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.08),0_1px_4px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35),0_1px_4px_rgb(0,0,0,0.15)] focus-within:ring-1 focus-within:ring-black/15 dark:focus-within:ring-white/15 focus-within:border-black/15 dark:focus-within:border-white/15 transition-all"
           />
           <p className="text-center text-[10px] text-muted-foreground mt-3 font-light">Legal AI can make mistakes. Please verify important information.</p>
        </div>
      </div>
    </main>
  )
}

// Right Panel: Memory 
function MemoryPanel({ matterId, memory, loading, onClose, onRefresh }: {
  matterId: string; memory: WorkspaceMemory | null; loading: boolean; onClose: () => void; onRefresh: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editForm, setEditForm] = useState({
    partySummary: "",
    legalIssues: "",
    lawyerNotes: "",
    factChronology: ""
  });

  useEffect(() => {
    if (memory && !isEditing) {
      setEditForm({
        partySummary: memory.partySummary || "",
        legalIssues: memory.legalIssues || "",
        lawyerNotes: memory.lawyerNotes || "",
        factChronology: memory.factChronology || ""
      });
    }
  }, [memory, isEditing]);

  const handleSave = async () => {
    const id = toast.loading("Saving workspace memory...")
    try {
      await apiService.updateMatterMemory(matterId, editForm);
      toast.success("Memory updated successfully", { id });
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      toast.error("Failed to update memory", { id });
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const id = toast.loading("Triggering AI summary regeneration...")
    try {
      await apiService.regenerateMatterMemory(matterId);
      toast.success("Regeneration started. Summary will update shortly.", { id });
      // Poll a few times
      setTimeout(onRefresh, 3000);
      setTimeout(onRefresh, 8000);
    } catch (err) {
      toast.error("Failed to trigger regeneration", { id });
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <aside className="w-full h-full flex flex-col bg-card border-l lg:border border-border/60 lg:rounded-2xl overflow-hidden shadow-2xl lg:shadow-none min-h-0">
      <div className="p-4 flex items-center justify-between border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
           <Brain className="h-4 w-4 text-primary" />
           <h2 className="text-sm font-medium text-foreground">Context Memory</h2>
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground"><X className="h-4 w-4" /></Button>
              <Button onClick={handleSave} size="sm" className="h-7 text-xs bg-primary text-primary-foreground">Save</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></Button>
              <Button onClick={onClose} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 min-h-0 [&_[data-slot=scroll-area-scrollbar]]:hidden">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-muted/50" />)}
          </div>
        ) : !memory ? (
          <div className="flex flex-col items-center justify-center text-center pt-10">
            <Brain className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-xs text-muted-foreground">Memory will appear after the AI processes your first conversation.</p>
          </div>
        ) : isEditing ? (
          <div className="space-y-5 pb-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Party Details</label>
               <Textarea 
                 className="min-h-[80px] text-xs bg-muted/30 border-border/50" 
                 value={editForm.partySummary} 
                 onChange={e => setEditForm(prev => ({ ...prev, partySummary: e.target.value }))} 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Legal Issues</label>
               <Textarea 
                 className="min-h-[80px] text-xs bg-muted/30 border-border/50" 
                 value={editForm.legalIssues} 
                 onChange={e => setEditForm(prev => ({ ...prev, legalIssues: e.target.value }))} 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Facts / Chronology</label>
               <Textarea 
                 className="min-h-[80px] text-xs bg-muted/30 border-border/50" 
                 value={editForm.factChronology} 
                 onChange={e => setEditForm(prev => ({ ...prev, factChronology: e.target.value }))} 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lawyer Notes</label>
               <Textarea 
                 className="min-h-[100px] text-xs bg-muted/30 border-border/50" 
                 value={editForm.lawyerNotes} 
                 placeholder="Add personal notes here (injected as context)..."
                 onChange={e => setEditForm(prev => ({ ...prev, lawyerNotes: e.target.value }))} 
               />
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
              <p className="text-[10px] text-primary/80 leading-relaxed text-center">Auto-injected into every AI message as long-term matter memory.</p>
            </div>

            {memory.aiSummary && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5"><Brain className="h-3 w-3 text-primary"/> AI Summary</p>
                  <Button disabled={isRegenerating} onClick={handleRegenerate} size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors">
                    <RefreshCw className={cn("h-3 w-3", isRegenerating && "animate-spin")} />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/50">
                   <MarkdownResponse
                      className="prose prose-slate dark:prose-invert max-w-none font-sans
                        prose-p:font-sans prose-headings:font-sans
                        prose-p:text-xs prose-p:text-muted-foreground prose-p:leading-normal prose-p:my-1
                        prose-headings:text-foreground prose-headings:font-medium
                        prose-h1:text-sm prose-h1:mt-2 prose-h1:mb-1
                        prose-h2:text-xs prose-h2:mt-2 prose-h2:mb-1
                        prose-h3:text-xs prose-h3:mt-2 prose-h3:mb-1
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-ul:text-xs prose-ul:text-muted-foreground prose-ul:my-1 prose-ul:pl-4
                        prose-ol:text-xs prose-ol:text-muted-foreground prose-ol:my-1 prose-ol:pl-4
                        prose-li:text-muted-foreground prose-li:leading-normal prose-li:marker:text-primary/50 prose-li:my-0.5"
                   >
                     {memory.aiSummary}
                   </MarkdownResponse>
                </div>
              </div>
            )}

            {[
              { label: "Party Details", content: memory.partySummary, icon: "👥", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Legal Issues", content: memory.legalIssues, icon: "⚖️", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
              { label: "Facts & Chronology", content: memory.factChronology, icon: "📋", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "Lawyer Notes", content: memory.lawyerNotes, icon: "📝", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].filter(s => s.content).map((section, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-6 w-6 rounded-md flex items-center justify-center text-[10px]", section.bg, section.color)}>
                      {section.icon}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">{section.label}</p>
                  </div>
                  <div className={cn("text-xs leading-relaxed border-l-2 pl-3 py-0.5", section.border)}>
                     <MarkdownResponse
                        className="prose prose-slate dark:prose-invert max-w-none font-sans
                          prose-p:font-sans prose-headings:font-sans
                          prose-p:text-xs prose-p:text-muted-foreground prose-p:leading-normal prose-p:my-1
                          prose-headings:text-foreground prose-headings:font-medium
                          prose-h1:text-sm prose-h1:mt-2 prose-h1:mb-1
                          prose-h2:text-xs prose-h2:mt-2 prose-h2:mb-1
                          prose-h3:text-xs prose-h3:mt-2 prose-h3:mb-1
                          prose-strong:text-foreground prose-strong:font-semibold
                          prose-ul:text-xs prose-ul:text-muted-foreground prose-ul:my-1 prose-ul:pl-4
                          prose-ol:text-xs prose-ol:text-muted-foreground prose-ol:my-1 prose-ol:pl-4
                          prose-li:text-muted-foreground prose-li:leading-normal prose-li:marker:text-primary/50 prose-li:my-0.5"
                     >
                       {section.content}
                     </MarkdownResponse>
                  </div>
                </div>
            ))}
            
            {/* Show an empty state inside if there is absolutely no manual data */}
            {!memory.partySummary && !memory.legalIssues && !memory.factChronology && !memory.lawyerNotes && (
               <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full text-xs h-8 border-dashed border-border/60 hover:bg-muted/50 text-muted-foreground">
                 <Plus className="h-3 w-3 mr-1" /> Add Manual Context
               </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}

//  Main Workspace Page 
export default function MatterWorkspacePage({ params }: { params: Promise<{ matterId: string }> }) {
  const router = useRouter()
  const { matterId } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [matter, setMatter] = useState<MatterDetail | null>(null)
  const [messages, setMessages] = useState<MatterMessage[]>([])
  const [documents, setDocuments] = useState<MatterDocument[]>([])
  const [deadlines, setDeadlines] = useState<MatterDeadline[]>([])
  const [memory, setMemory] = useState<WorkspaceMemory | null>(null)

  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) setLeftOpen(false)
      if (window.innerWidth < 1280) setRightOpen(false)
    }
  }, [])

  const fetchMemory = useCallback(() => {
     apiService.getMatterMemory(matterId).then(setMemory).catch(() => null)
  }, [matterId])

  useEffect(() => {
    if (!matterId) return
    setLoading(true)
    Promise.all([
      apiService.getMatter(matterId),
      apiService.getMatterMessages(matterId).catch(() => []),
      apiService.getMatterDocuments(matterId).catch(() => []),
      apiService.getMatterDeadlines(matterId).catch(() => []),
      apiService.getMatterMemory(matterId).catch(() => null),
    ]).then(([m, msgs, docs, dlns, mem]) => {
      setMatter(m); setMessages(msgs); setDocuments(docs); setDeadlines(dlns); setMemory(mem)
    }).catch(err => setError(err?.message || "Failed to load matter"))
      .finally(() => setLoading(false))
  }, [matterId])

  if (error) return (
    <div className="flex h-full w-full items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4 max-w-sm bg-card p-8 rounded-2xl border border-border/50">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-base font-medium">Matter not found</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/lawyer/dashboard")} className="w-full">
           Return to Dashboard
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-full w-full bg-background p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden font-sans relative">
      
      {/* Mobile Backdrop Left */}
      {leftOpen && <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setLeftOpen(false)} />}
      
      {/* Left Panel */}
      <div className={cn(
        "transition-all duration-300 z-50",
        leftOpen ? "absolute inset-y-2 left-2 w-[85vw] sm:w-[320px] lg:static lg:w-[300px] xl:w-[340px]" : "hidden"
      )}>
        <LeftPanel 
          matterId={matterId} 
          matter={matter}
          memory={memory}
          documents={documents} 
          deadlines={deadlines}
          loading={loading} 
          onDocumentsChange={setDocuments} 
          onDeadlinesChange={setDeadlines}
          onMemoryUpdate={fetchMemory}
          onClose={() => setLeftOpen(false)}
        />
      </div>

      {/* Chat Center */}
      <ChatPanel 
        matterId={matterId} 
        matter={matter} 
        messages={messages} 
        documents={documents} 
        loading={loading} 
        onMessagesChange={setMessages} 
        onMemoryUpdate={fetchMemory} 
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => setLeftOpen(!leftOpen)}
        onToggleRight={() => setRightOpen(!rightOpen)}
      />

      {/* Mobile Backdrop Right */}
      {rightOpen && <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 xl:hidden" onClick={() => setRightOpen(false)} />}
      
      {/* Right Panel Memory */}
      <div className={cn(
        "transition-all duration-300 z-50",
        rightOpen ? "absolute inset-y-2 right-2 w-[85vw] sm:w-[320px] xl:static xl:w-[300px]" : "hidden"
      )}>
        <MemoryPanel 
          matterId={matterId}
          memory={memory} 
          loading={loading} 
          onClose={() => setRightOpen(false)}
          onRefresh={fetchMemory}
        />
      </div>

    </div>
  )
}