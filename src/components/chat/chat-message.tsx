"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import { TextShimmer } from "../ui/text-shimmer";
import AITextLoading from "../misc/ai-text-loading";
import AI_Input from "../misc/ai-chat";
import { Response as MarkdownResponse } from "../misc/response";
import { Actions, Action } from "../misc/actions";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CookiePolicyDialog from '@/components/docs/terms/cookie-dialog';
import { Message, Conversation } from "@/types/chat.types";
import { cn } from "@/lib/utils";

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
  const { toast } = useToast();
  const isUser = message.role === "user";
  const displayContent = isStreaming ? streamingContent : message.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent || "");
    toast({
      variant: "default",
      title: "Copied to clipboard!",
      description: "Message content has been copied.",
    });
  };

  const handleLike = () => {
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4" />
          <span>Liked</span>
        </div>
      ) as any,
      description: "Thanks for your feedback!",
    });
  };

  const handleDislike = () => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center gap-2">
          <ThumbsDown className="w-4 h-4" />
          <span>Disliked</span>
        </div>
      ) as any,
      description: "We'll work to improve our responses.",
    });
  };

  const handleRegenerate = () => {
    if (!onRegenerate || !getPrevUserMessageContent) return;
    const previousUserMessage = getPrevUserMessageContent(message.id);
    if (previousUserMessage) onRegenerate(previousUserMessage);
  };


  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%] bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-lg">
          {Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {message.attachments.map((fileName, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-blue-700 px-2 py-1 rounded text-xs"
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
      <div className="text-slate-900 dark:text-neutral-100 rounded-2xl p-4 relative">

        <MarkdownResponse
          className="prose prose-slate dark:prose-invert max-w-none
          prose-p:text-[15px] prose-p:text-slate-700 dark:prose-p:text-neutral-200 prose-p:leading-[1.8] prose-p:my-3
          prose-headings:text-slate-900 dark:prose-headings:text-neutral-100 prose-headings:font-semibold prose-headings:tracking-tight
          prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-3
          prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-2.5
          prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
          prose-strong:text-slate-900 dark:prose-strong:text-neutral-100 prose-strong:font-semibold
          prose-em:text-slate-600 dark:prose-em:text-neutral-300
          prose-code:text-[13px] prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-code:bg-slate-100 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-pre:text-[13px] prose-pre:bg-slate-100 dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-neutral-700 prose-pre:rounded-xl prose-pre:my-4
          prose-blockquote:border-l-2 prose-blockquote:border-blue-400 dark:prose-blockquote:border-blue-500 prose-blockquote:text-slate-600 dark:prose-blockquote:text-neutral-300 prose-blockquote:pl-4 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-neutral-800/50 prose-blockquote:rounded-r-lg prose-blockquote:py-2
          prose-ul:text-[15px] prose-ul:text-slate-700 dark:prose-ul:text-neutral-200 prose-ul:my-3 prose-ul:space-y-1
          prose-ol:text-[15px] prose-ol:text-slate-700 dark:prose-ol:text-neutral-200 prose-ol:my-3 prose-ol:space-y-1
          prose-li:text-slate-700 dark:prose-li:text-neutral-200 prose-li:leading-[1.75] prose-li:marker:text-blue-400 dark:prose-li:marker:text-blue-500
          prose-hr:border-slate-200 dark:prose-hr:border-neutral-700 prose-hr:my-6
          prose-table:text-[14px] prose-th:bg-slate-100 dark:prose-th:bg-neutral-800 prose-th:text-slate-700 dark:prose-th:text-neutral-200 prose-td:text-slate-600 dark:prose-td:text-neutral-300
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium hover:prose-a:underline prose-a:no-underline"
        >
          {displayContent || ""}
        </MarkdownResponse>

        {/* Mobile inline actions  */}
        <div className="flex items-center gap-0.5 mt-2 md:hidden">
          <button onClick={handleCopy} aria-label="Copy" className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleLike} aria-label="Like" className="p-1.5 rounded text-slate-400 hover:text-green-500 dark:text-neutral-500 dark:hover:text-green-400 transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDislike} aria-label="Dislike" className="p-1.5 rounded text-slate-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors">
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleRegenerate} aria-label="Regenerate" className="p-1.5 rounded text-slate-400 hover:text-blue-500 dark:text-neutral-500 dark:hover:text-blue-400 transition-colors">
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
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50 rounded-lg p-1 shadow-lg">
            <Actions>
              <Action onClick={handleCopy} tooltip="Copy">
                <Copy className="w-4 h-4 text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200" />
              </Action>
              <Action onClick={handleLike} tooltip="Like">
                <ThumbsUp className="w-4 h-4 text-slate-500 dark:text-neutral-400 hover:text-green-500 dark:hover:text-green-400" />
              </Action>
              <Action onClick={handleDislike} tooltip="Dislike">
                <ThumbsDown className="w-4 h-4 text-slate-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400" />
              </Action>
              <Action onClick={handleRegenerate} tooltip="Regenerate">
                <RotateCcw className="w-4 h-4 text-slate-500 dark:text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400" />
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
      <div className="h-8 w-8 rounded-full border border-blue-400/20 dark:border-blue-300/20 flex items-center justify-center">
        <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 flex justify-start items-center">
        <AITextLoading
          texts={[
            "Analyzing legal context...",
            "Processing your query...",
            "Researching relevant laws...",
            "Formulating response...",
          ]}
          className="!text-sm !font-mono !font-normal !text-slate-600 dark:!text-neutral-300"
          interval={1000}
        />
      </div>
    </div>
  );
}



function WelcomeScreen({ user, onSendMessage, selectedMode }: {
  user: { name: string; email: string; avatar?: string };
  onSendMessage: (content: string, file?: File) => void;
  selectedMode: "chat" | "agentic";
}) {
  return (
   <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-4 sm:p-6" style={{ top: 'calc(50% - 30px)' }}>
      <div className="text-center max-w-2xl w-full">
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-4 text-blue-600 dark:text-blue-400">
            Hello {user.name.split(' ')[0]}
          </h1>
          <div>
            <TextShimmer className='font-medium text-sm' duration={4}>
              How can I assist you with your legal questions?
            </TextShimmer>
          </div>
        </div>
        <div className="w-full hidden sm:block">
          <AI_Input 
            onSendMessage={onSendMessage} 
            mode={selectedMode}
            showModeIndicator={true}
          />
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
      onRegenerate
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
        if (isAtBottomRef.current) 
+      forceScrollToBottom();
      }
    }, [combinedMessages.length, isNewConversationSelected]);


    useEffect(() => {
      if (streamingMessageId && isAtBottomRef.current) {
        scrollToBottom();
      }
    }, [streamingContent, streamingMessageId]);

    const hasMessages = combinedMessages.length > 0;

    return (
      <>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 metallic-scrollbar relative transition-all duration-200 ${
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
              <AI_Input
                onSendMessage={onSendMessage}
                mode={selectedMode}
                showModeIndicator={false}
              />
            </div>

            <div className="flex items-center justify-center font-light text-xs gap-1 mt-2 text-slate-500 dark:text-white/70">
              <p>LegalAI can make mistakes. Refer to</p>
              <a
                href="#cookies"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCookieOpen(true);
                }}
                className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors"
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
            className="absolute bottom-24 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-20 p-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-slate-200 dark:border-neutral-700 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all shadow-lg animate-in fade-in zoom-in duration-200"
            aria-label="Scroll to bottom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle-arrow-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M8 12l4 4" /><path d="M12 8v8" /><path d="M16 12l-4 4" /></svg>
          </button>
        )}
      </>
    );
  }
);

ChatMessagesArea.displayName = "ChatMessagesArea";

export { ChatMessage };
