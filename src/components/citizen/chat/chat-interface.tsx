"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatSidebar from "@/components/citizen/misc/chat-sidebar";
import { ChatMessagesArea } from "./chat-message";
import { ChatModeSelector } from "../misc/mode-selector";
import { toast } from "sonner";
import { apiService, type Message as BackendMessage } from "@/lib/api.service";
import { type Message, type Conversation } from "@/types/chat.types";
import { ConversationSkeleton } from "./conversation-skeleton";
import { DeleteConversationDialog } from "./delete-conversation-dialog";
import { useRouter } from "next/navigation";
import { useStream } from "@/hooks/use-stream";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface ChatInterfaceProps {
  user: { name: string; email: string; avatar?: string };
  onLogout: () => void;
  initialConversationId?: string;
}

function transformMessage(msg: BackendMessage): Message {
  return {
    id: msg.id,
    uiKey: msg.id,
    content: msg.content,
    role:
      msg.role === "USER" ? "user" : msg.role === "ASSISTANT" ? "assistant" : "system",
    attachments: msg.attachments,
    metadata: msg.metadata,
    createdAt: msg.createdAt,
  } as Message;
}

function mergeMessages(currentMessages: Message[], newMessages: Message[]): Message[] {
  const currentMap = new Map(currentMessages.map(m => [m.id, m]));
  const tempUserMessages = currentMessages.filter(m => m.id.startsWith('temp-') && m.role === 'user');

  return newMessages.map(newMsg => {
    if (currentMap.has(newMsg.id)) {
      const current = currentMap.get(newMsg.id)!;
      return { ...newMsg, uiKey: current.uiKey || current.id };
    }

    if (newMsg.role === 'user') {
      const match = tempUserMessages.find(temp => temp.content === newMsg.content);
      if (match) {
        return { ...newMsg, uiKey: match.uiKey || match.id };
      }
    }

    return { ...newMsg, uiKey: newMsg.id };
  });
}

const BackgroundLayer: React.FC<{ selectedMode: "chat" | "agentic"; hasActiveConversation: boolean }> = ({
  selectedMode,
  hasActiveConversation,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <div
        className="absolute inset-0 z-0 bg-background transition-opacity duration-700 ease-in-out"
        style={{
          opacity: (selectedMode === "chat" || hasActiveConversation) ? 1 : 0,
        }}
      />
      <div
        className="absolute inset-0 z-0 transition-opacity duration-700 ease-in-out"
        style={{
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
          opacity: (selectedMode === "agentic" && !hasActiveConversation) ? 1 : 0,
        }}
      />
    </>
  );
};



export function ChatInterface({ user, onLogout, initialConversationId }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingActiveConversation, setIsLoadingActiveConversation] = useState(false);
  const [isNewConversationSelected, setIsNewConversationSelected] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"chat" | "agentic">("chat");
  const [messageId, setMessageId] = useState<string | null>(null);
  const { streamingContent, startStreaming } = useStream();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const messagesAreaRef = useRef<{ scrollToBottom: () => void; scrollToTop: () => void } | null>(
    null
  );
  const router = useRouter();
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const handleErrorToast = useCallback(
    (title: string, error: unknown, defaultMessage = "Please try again") => {
      console.error(title, error);
      const message =
        (error as any)?.body?.message ||
        (error instanceof Error ? error.message : defaultMessage);
      toast.error('', { description: message });
    },
    [toast]
  );

  const updateConversationUrl = useCallback((conversationId: string | null) => {
    if (conversationId) {
      window.history.replaceState(null, '', `/ai/${conversationId}`);
    } else {
      window.history.replaceState(null, '', '/ai');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoadingConversations(true);
      try {
        const fetched = await apiService.getConversations();
        if (!mounted) return;
        const transformed = fetched.map((conv) => {
          const transformedMessages = conv.messages?.map(transformMessage) || [];
          return {
            ...conv,
            messages: transformedMessages,
            lastMessage: transformedMessages[transformedMessages.length - 1]?.content || "",
          };
        });
        setConversations(transformed);

        if (initialConversationId && transformed.some(c => c.id === initialConversationId)) {
          setIsLoadingActiveConversation(true);
          try {
            const fullConversation = await apiService.getConversationMessages(initialConversationId);
            const transformedMessages = fullConversation.messages?.map(transformMessage) || [];
            setConversations((prev) =>
              prev.map((c) =>
                c.id === initialConversationId
                  ? {
                    ...fullConversation,
                    messages: transformedMessages,
                    lastMessage: transformedMessages[transformedMessages.length - 1]?.content || "",
                  }
                  : c
              )
            );
          } catch (error) {
            handleErrorToast("Failed to load conversation", error);
            updateConversationUrl(null);
            setActiveConversationId(null);
          } finally {
            setIsLoadingActiveConversation(false);
          }
        } else if (initialConversationId && !transformed.some(c => c.id === initialConversationId)) {
          updateConversationUrl(null);
          setActiveConversationId(null);
        }
      } catch (err) {
        handleErrorToast("Failed to load conversations", err);
      } finally {
        if (mounted) setIsLoadingConversations(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [handleErrorToast, initialConversationId, updateConversationUrl]);

  const handleModeChange = useCallback((mode: string) => {
    setSelectedMode(mode as "chat" | "agentic");
  }, []);


  const handleSendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!content.trim() && !file) return;
      setIsLoading(true);

      try {
        let convId = activeConversationId;
        let localConversation = activeConversation;

        if (!localConversation) {
          const mode = selectedMode === "chat" ? "NORMAL" : "AGENTIC";
          const title = content.length > 50 ? `${content.slice(0, 50)}...` : content;
          const newConv = await apiService.createConversation(mode, title);

          const transformedConv: Conversation = {
            ...newConv,
            messages: [],
            lastMessage: content,
          } as Conversation;

          setConversations((prev) => [transformedConv, ...prev]);
          setActiveConversationId(newConv.id);
          updateConversationUrl(newConv.id);
          convId = newConv.id;
          localConversation = transformedConv;
        }

        const tempId = `temp-${Date.now()}`;
        const userMessage: Message = {
          id: tempId,
          uiKey: tempId,
          content,
          role: "user",
          attachments: file ? [file.name] : [],
          createdAt: new Date().toISOString(),
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId
              ? {
                ...conv,
                messages: [...(conv.messages || []), userMessage],
                lastMessage: content,
              }
              : conv
          )
        );

        const mode = selectedMode === "chat" ? "NORMAL" : "AGENTIC";
        const response = await apiService.sendMessage(convId!, content, mode, file);

        const fullConversation = await apiService.getConversationMessages(convId!);
        const transformedMessages = fullConversation.messages?.map(transformMessage) || [];
        const lastAssistantMessage = [...transformedMessages].reverse().find((m) => m.role === "assistant");

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId
              ? {
                ...fullConversation,
                messages: mergeMessages(conv.messages || [], transformedMessages),
                lastMessage: lastAssistantMessage?.content || "",
                sessionId: (response as any)?.conversation?.sessionId ?? conv.sessionId,
                documentId: (response as any)?.conversation?.documentId ?? conv.documentId,
              }
              : conv
          )
        );

        if (lastAssistantMessage) {
          setMessageId(lastAssistantMessage.id);
          startStreaming(
            lastAssistantMessage.content,
            (nextChunk) => {
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === convId
                    ? {
                      ...conv,
                      messages:
                        conv.messages?.map((msg) =>
                          msg.id === lastAssistantMessage.id ? { ...msg, content: nextChunk } : msg
                        ) ?? [],
                      lastMessage: nextChunk,
                    }
                    : conv
                )
              );
            },
            () => setMessageId(null)
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        const status = (error as any)?.status;
        const body = (error as any)?.body;
        toast.error("Failed to send message", { description: (body?.message || (error instanceof Error ? error.message : "Please try again")) });
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
          role: "assistant",
          createdAt: new Date().toISOString(),
        };

        if (activeConversationId) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === activeConversationId
                ? { ...conv, messages: [...(conv.messages || []), errorMessage] }
                : conv
            )
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversation, activeConversationId, selectedMode, startStreaming, toast, updateConversationUrl]
  );

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null);
    updateConversationUrl(null);
  }, [updateConversationUrl]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      setIsLoadingActiveConversation(true);
      setActiveConversationId(id);
      updateConversationUrl(id);
      try {
        const fullConversation = await apiService.getConversationMessages(id);
        const transformedMessages = fullConversation.messages?.map(transformMessage) || [];
        setConversations((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                ...fullConversation,
                messages: transformedMessages,
                lastMessage: transformedMessages[transformedMessages.length - 1]?.content || "",
              }
              : c
          )
        );
        setIsNewConversationSelected(true);
        window.setTimeout(() => setIsNewConversationSelected(false), 100);
      } catch (error) {
        handleErrorToast("Failed to load conversation", error);
      } finally {
        setIsLoadingActiveConversation(false);
      }
    },
    [handleErrorToast, updateConversationUrl]
  );

  const handleShareConversation = useCallback(() => {
    if (!activeConversation) return;
    (async () => {
      try {
        const result = await apiService.shareConversation(activeConversation.id, true);
        if (result.link) {
          let token = result.link;
          if (result.link.includes("/")) {
            const parts = result.link.split("?")[0].split("/");
            token = parts.pop() || parts.pop() || "";
          }
          const frontendLink = `${window.location.origin}/ai/shared/${token}`;
          try {
            await navigator.clipboard.writeText(frontendLink);
            toast("Share link copied", { description: "A secure shareable link has been created and copied to your clipboard." });
          } catch {
            toast.success("Share link created", { description: frontendLink });
          }
        } else if (result.message) {
          toast("Share status", { description: result.message });
        } else {
          toast("Sharing updated", { description: "Sharing status updated successfully." });
        }
      } catch (error) {
        handleErrorToast("Failed to share conversation", error);
      }
    })();
  }, [activeConversation, handleErrorToast, toast]);

  const handleDeleteConversation = useCallback(() => {
    if (!activeConversation) return;
    setIsDeleteDialogOpen(true);
  }, [activeConversation]);

  const confirmDeleteConversation = useCallback(async () => {
    if (!activeConversation) return;
    try {
      await apiService.deleteConversation(activeConversation.id);
      setConversations((prev) => prev.filter((conv) => conv.id !== activeConversation.id));
      if (activeConversationId === activeConversation.id) {
        setActiveConversationId(null);
        updateConversationUrl(null);
      }
      toast("Conversation deleted", { description: "The conversation has been deleted successfully." });
    } catch (error) {
      handleErrorToast("Failed to delete", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }, [activeConversation, activeConversationId, handleErrorToast, toast, updateConversationUrl]);

  const handleTempChatClick = useCallback(() => {
    handleNewConversation();
  }, [handleNewConversation]);

  const sidebarConversations = useMemo(
    () =>
      conversations.map((c) => ({
        id: c.id,
        title: c.title,
        messages: c.messages || [],
        lastMessage: c.lastMessage || "",
      })),
    [conversations]
  );

  return (
    <SidebarProvider>
      <div
        className="flex h-screen relative overflow-hidden chat-interface-container w-full"
        style={{ height: "100dvh" }}
      >
        <BackgroundLayer selectedMode={selectedMode} hasActiveConversation={!!activeConversationId} />

        <ChatSidebar
          user={user}
          conversations={sidebarConversations}
          activeConversationId={activeConversationId || undefined}
          onSelectConversation={(id) => { handleSelectConversation(id); setIsMobileSidebarOpen(false); }}
          onNewConversation={() => { handleNewConversation(); setIsMobileSidebarOpen(false); }}
          onLogout={onLogout}
          isLoadingConversations={isLoadingConversations}
          mobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          mode={selectedMode}
        />

        <div
          className="flex-1 flex flex-col min-h-0 relative z-10 min-w-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] w-full"
        >
          <div className={cn(
            "sticky top-0 z-20 transition-all duration-300",
            selectedMode === "agentic"
              ? "bg-transparent backdrop-blur-md border-b-0"
              : "bg-background"
          )}>
            <ChatModeSelector
              variant={activeConversation ? "chat-selected" : "default"}
              defaultMode={selectedMode}
              onModeChange={handleModeChange}
              onTempChatClick={handleTempChatClick}
              onShareClick={handleShareConversation}
              onDeleteClick={handleDeleteConversation}
              onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
            />
          </div>

          {isLoadingActiveConversation ? (
            <div className="flex-1 overflow-y-auto">
              <ConversationSkeleton />
            </div>
          ) : (
            <ChatMessagesArea
              ref={messagesAreaRef}
              user={user}
              activeConversation={
                activeConversation
                  ? {
                    ...activeConversation,
                    messages: activeConversation.messages || [],
                    lastMessage: activeConversation.lastMessage || "",
                  }
                  : undefined
              }
              isLoading={isLoading}
              selectedMode={selectedMode}
              streamingMessageId={messageId}
              streamingContent={streamingContent}
              onSendMessage={handleSendMessage}
              isNewConversationSelected={isNewConversationSelected}
              onRegenerate={handleSendMessage}
            />
          )}
        </div>

        <DeleteConversationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteConversation}
          conversationTitle={activeConversation?.title}
        />
      </div>
    </SidebarProvider>
  );
}

export default ChatInterface;