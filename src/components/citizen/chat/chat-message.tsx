"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import AITextLoading from "../misc/ai-text-loading";
import AI_Input from "../misc/ai-chat";
import { Response as MarkdownResponse } from "../misc/response";
import { Actions, Action } from "../misc/actions";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Paperclip, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api.service";
import { toast } from "sonner";
import CookiePolicyDialog from '@/components/docs/terms/cookie-dialog';
import { Message, Conversation } from "@/types/chat.types";
import { cn } from "@/lib/utils";
import { mdToPassage } from "@/lib/mdtotext";

interface ChatMessagesAreaProps {
  user: { name: string; email: string; avatar?: string };
  activeConversation: Conversation | undefined;
  isLoading: boolean;
  selectedMode: 'chat' | 'agentic';
  streamingMessageId: string | null;
  streamingContent: string;
  onSendMessage: (content: string, file?: File) => void;
  isNewConversationSelected: boolean;
  onRegenerate?: (content: string) => void;
  onFileUpload?: (file: File) => void;
  onDocumentGenerationRequest?: (data: any) => void;
}

interface ChatMessagesAreaRef {
  scrollToBottom: () => void;
  scrollToTop: () => void;
}


function ChatMessage({
  message,
  isStreaming,
  streamingContent,
  onRegenerate,
  getPrevUserMessageContent
}: {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
  onRegenerate?: (content: string) => void;
  getPrevUserMessageContent?: (id: string) => string | null;
}) {
  const isUser = message.role === "user";
  const displayContent = isStreaming ? streamingContent : message.content;

  const handleCopy = () => {
    const sanitizedContent = mdToPassage(displayContent || "");
    navigator.clipboard.writeText(sanitizedContent);
    toast("Copied to clipboard!", { description: "Message content has been copied." });
  };

  const handleLike = () => {
    toast((
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4" />
          <span>Liked</span>
        </div>
      ) as any, { description: "Thanks for your feedback!" });
  };

  const handleDislike = () => {
    toast.error((
        <div className="flex items-center gap-2">
          <ThumbsDown className="w-4 h-4" />
          <span>Disliked</span>
        </div>
      ) as any, { description: "We'll work to improve our responses." });
  };

  const handleRegenerate = () => {
    if (!onRegenerate || !getPrevUserMessageContent) return;
    const previousUserMessage = getPrevUserMessageContent(message.id);
    if (previousUserMessage) onRegenerate(previousUserMessage);
  };


  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%] bg-user-chat-bg text-user-chat-fg rounded-2xl px-4 py-3 shadow-lg">
          {Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {message.attachments.map((fileName, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-primary/80 px-2 py-1 rounded text-xs"
                >
                  <Paperclip className="w-3 h-3" />
                  <span>{fileName}</span>
                </div>
              ))}
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-sm">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-foreground rounded-2xl p-4 relative">

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
          {displayContent || ""}
        </MarkdownResponse>

        {/* Document Generation Result UI */}
        {message.metadata?.documentResult && (
          <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-4 space-y-4 max-w-sm">
            <div className="flex items-start gap-3">
              {message.metadata.documentResult.generationStatus === "complete" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {message.metadata.documentResult.generationStatus === "complete"
                    ? "Document ready"
                    : "Document generated (incomplete)"}
                </p>
                {message.metadata.documentResult.generationStatus === "incomplete" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {message.metadata.documentResult.warning ??
                      "Some optional fields used placeholders. Review before submission."}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {message.metadata.documentResult.completionPercentage}% complete � {" "}
                  {message.metadata.documentResult.filename}
                </p>
              </div>
            </div>
            <Button
              onClick={() =>
                apiService.downloadBlob(
                  message.metadata!.documentResult.blob,
                  message.metadata!.documentResult.filename
                )
              }
              className="w-full rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}

        {/* Mobile inline actions  */}
        <div className="flex items-center gap-0.5 mt-2 md:hidden">
          <button onClick={handleCopy} aria-label="Copy" className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleLike} aria-label="Like" className="p-1.5 rounded text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDislike} aria-label="Dislike" className="p-1.5 rounded text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleRegenerate} aria-label="Regenerate" className="p-1.5 rounded text-muted-foreground hover:text-primary transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop hover actions */}
        <div
          className="
            hidden md:block
            absolute bottom-2 right-2
            opacity-0 scale-95 translate-y-2
            group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
            transition-all duration-300 pointer-events-auto
          "
        >
          <div className="bg-popover/90 backdrop-blur-sm border border-border/50 rounded-lg p-1 shadow-lg">
            <Actions>
              <Action onClick={handleCopy} tooltip="Copy">
                <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </Action>
              <Action onClick={handleLike} tooltip="Like">
                <ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-green-500 dark:hover:text-green-400" />
              </Action>
              <Action onClick={handleDislike} tooltip="Dislike">
                <ThumbsDown className="w-4 h-4 text-muted-foreground hover:text-red-500 dark:hover:text-red-400" />
              </Action>
              <Action onClick={handleRegenerate} tooltip="Regenerate">
                <RotateCcw className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Action>
            </Actions>
          </div>
        </div>
      </div>
    </div>
  );
}



function LoadingMessage() {
  return (
    <div className="flex gap-3 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center">
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
      </div>
      <div className="flex-1 flex justify-start items-center">
        <AITextLoading
          texts={[
            "Analyzing legal context...",
            "Processing your query...",
            "Researching relevant laws...",
            "Formulating response...",
          ]}
          className="!text-sm !font-mono !font-normal !text-muted-foreground"
          interval={1000}
        />
      </div>
    </div>
  );
}



function WelcomeScreen({ user, onSendMessage, selectedMode, onDocumentGenerationRequest }: {
  user: { name: string; email: string; avatar?: string };
  onSendMessage: (content: string, file?: File) => void;
  selectedMode: "chat" | "agentic";
  onDocumentGenerationRequest?: (data: any) => void;
}) {
  return (
   <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-4 sm:p-6" style={{ top: 'calc(50% - 50px)' }}>
      <div className="text-center max-w-2xl w-full">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-primary" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
            Hello {user.name.split(' ')[0]}
          </h1>
        </div>
        <div className="w-full hidden sm:block">
          <AI_Input onSendMessage={onSendMessage} mode={selectedMode} showModeIndicator={true} onDocumentGenerationRequest={onDocumentGenerationRequest} />
        </div>
      </div>
    </div>
  );
}


export const ChatMessagesArea = forwardRef <ChatMessagesAreaRef, ChatMessagesAreaProps>(
  (
    {
      user,
      activeConversation,
      isLoading,
      selectedMode,
      streamingMessageId,
      streamingContent,
      onSendMessage,
      isNewConversationSelected,
      onRegenerate,
      onDocumentGenerationRequest
    },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isCookieOpen, setIsCookieOpen] = useState(false);
    const isAtBottomRef = useRef(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      isAtBottomRef.current = isAtBottom;
      setShowScrollButton(!isAtBottom);
    };

    const scrollToBottom = () => {
      if (isAtBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    const forceScrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isAtBottomRef.current = true;
      setShowScrollButton(false);
    };

    const scrollToTop = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
        isAtBottomRef.current = false;
      }
    };

    useImperativeHandle(ref, () => ({ scrollToBottom: forceScrollToBottom, scrollToTop }));

    const baseMessages = activeConversation?.messages || [];

    const combinedMessages: Message[] = [
      ...baseMessages,
      ...(streamingMessageId &&
      !baseMessages.some((m) => m.id === streamingMessageId)
        ? [
            {
              id: streamingMessageId,
              role: "assistant",
              content: streamingContent,
              createdAt: new Date().toISOString()
            } as Message
          ]
        : [])
    ];

    const getPrevUserMessageContent = (msgId: string): string | null => {
      const index = baseMessages.findIndex((m) => m.id === msgId);
      if (index <= 0) return null;

      for (let i = index - 1; i >= 0; i--) {
        if (baseMessages[i].role === "user") return baseMessages[i].content;
      }
      return null;
    };

    useEffect(() => {
      if (isNewConversationSelected) {
        scrollToTop();
      } else {
        if (isAtBottomRef.current) {
          forceScrollToBottom();
        }
      }
    }, [combinedMessages.length, isNewConversationSelected]);


    useEffect(() => {
      if (streamingMessageId && isAtBottomRef.current) {
        scrollToBottom();
      }
    }, [streamingContent, streamingMessageId]);

    const hasMessages = combinedMessages.length > 0;

    return (
      <div className="flex flex-col flex-1 min-h-0 relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 min-h-0 metallic-scrollbar relative transition-all duration-200 ${
            hasMessages ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          {hasMessages ? (
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-3 sm:space-y-4">
              {combinedMessages.map((msg) => (
                <ChatMessage
                  key={msg.uiKey || msg.id}
                  message={msg}
                  isStreaming={streamingMessageId === msg.id}
                  streamingContent={streamingContent}
                  onRegenerate={onRegenerate}
                  getPrevUserMessageContent={getPrevUserMessageContent}
                />
              ))}

              {isLoading && !streamingMessageId && <LoadingMessage />}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <WelcomeScreen
              user={user}
              onSendMessage={onSendMessage}
              selectedMode={selectedMode}
            />
          )}
        </div>

        <div className={cn("pt-1 pb-3 sm:pb-4", !hasMessages && "sm:hidden")}>
            <div className="max-w-6xl mx-auto px-2 sm:px-4">
              <AI_Input onSendMessage={onSendMessage} mode={selectedMode} showModeIndicator={false} onDocumentGenerationRequest={onDocumentGenerationRequest} />
            </div>

            <div className="flex items-center justify-center font-light text-xs gap-1 mt-2 text-muted-foreground">
              <p>LegalAI can make mistakes. Refer to</p>
              <a
                href="#cookies"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCookieOpen(true);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policies
              </a>
            </div>

            <CookiePolicyDialog
              open={isCookieOpen}
              onOpenChange={setIsCookieOpen}
            />
        </div>

        {showScrollButton && (
          <button
            onClick={forceScrollToBottom}
            className="absolute bottom-46  left-1/2 -translate-x-1/2 rounded-full bg-background text-muted-foreground hover:text-foreground transition-colors animate-in fade-in zoom-in duration-200"
            aria-label="Scroll to bottom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle-arrow-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M8 12l4 4" /><path d="M12 8v8" /><path d="M16 12l-4 4" /></svg>
          </button>
        )}
      </div>
    );
  }
);

ChatMessagesArea.displayName = "ChatMessagesArea";

export { ChatMessage };





