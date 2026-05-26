"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  Sidebar,
  SidebarBody,
} from "@/components/citizen/misc/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import ProfileDropdown from "@/components/citizen/misc/profile-dropdown";
import { RecentChatSkeleton } from "../chat/recent-chat-sekeleton";

interface ChatSidebarProps {
  user: { name: string; email: string; avatar?: string };
  conversations: Array<{
    id: string;
    title: string;
    lastMessage: string;
  }>;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onLogout: () => void;
  isLoadingConversations?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  mode?: 'chat' | 'agentic';
}

interface SidebarInnerContentProps {
  user: { name: string; email: string; avatar?: string };
  conversations: Array<{ id: string; title: string; lastMessage: string }>;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onLogout: () => void;
  isLoadingConversations?: boolean;
  isExpanded: boolean;
  onLogoClick?: () => void;
  onClose?: () => void;
  mode?: 'chat' | 'agentic';
}

function SidebarInnerContent({
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onLogout,
  isLoadingConversations,
  isExpanded,
  onLogoClick,
  onClose,
  mode = 'chat',
}: SidebarInnerContentProps) {
  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-200 ease-linear">
        {/* Logo row */}
          <div className={cn("flex items-center", isExpanded ? "justify-between" : "justify-center")}>
          <Logo
            collapsed={!isExpanded}
            showText={isExpanded}
            onClick={onLogoClick}
            variant="sidebar"
            className={cn(
              "flex-shrink-0",
              isExpanded ? "justify-start" : "justify-center"
            )}
          />
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "p-1.5 rounded-lg flex-shrink-0 transition-colors",
                mode === 'agentic'
                  ? "hover:bg-white/10 text-white/80 hover:text-white"
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              )}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="mt-4">
          <Button
            onClick={onNewConversation}
            className={cn(
              "w-full transition-all duration-200 ease-linear rounded-lg text-sm font-medium flex-shrink-0 shadow-none focus:outline-none focus-visible:ring-0",
              isExpanded
                ? (mode === 'agentic'
                    ? "justify-start gap-2 px-3 py-2 text-left bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                    : "justify-start gap-2 px-3 py-2 text-left bg-sidebar border border-sidebar-border/20 text-sidebar-foreground hover:bg-sidebar-accent")
                : (mode === 'agentic'
                    ? "justify-center p-2 bg-transparent border-none text-foreground/80 dark:text-white/80 hover:text-foreground dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                    : "justify-center p-2 bg-transparent border-none text-sidebar-foreground hover:bg-sidebar-accent")
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "shrink-0 transition-all duration-200 ease-linear",
                isExpanded ? "h-3 w-3" : "h-5 w-5"
              )}
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
            {isExpanded && (
              <span className={cn("font-medium", mode === 'agentic' ? "text-foreground dark:text-white" : "text-sidebar-foreground")}>
                New Chat
              </span>
            )}
          </Button>
        </div>

        {/* Recent Chats Section */}
        <div className="mt-4 flex flex-col flex-1 min-h-0 gap-1 transition-all duration-200 ease-linear">
          {isExpanded ? (
            <>
              <div className="px-2 py-1 flex-shrink-0">
                <h3 className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  mode === 'agentic' ? "text-foreground/45 dark:text-white/40" : "text-sidebar-foreground"
                )}>
                  Recents
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar min-h-0 pr-1.5">
                {isLoadingConversations ? (
                  <RecentChatSkeleton />
                ) : conversations && conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => onSelectConversation(conversation.id)}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-linear text-left w-full gap-3 px-3 py-2 flex-shrink-0 border border-transparent",
                        mode === 'agentic'
                          ? (activeConversationId === conversation.id
                              ? "bg-black/10 dark:bg-white/10 text-foreground dark:text-white border-black/10 dark:border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] dark:shadow-[0_0_15px_rgba(138,43,226,0.15)]"
                              : "text-foreground/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white")
                          : (activeConversationId === conversation.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")
                      )}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 8l0 4l2 2" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" /></svg>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "truncate font-medium",
                          mode === 'agentic'
                            ? (activeConversationId === conversation.id ? "text-foreground dark:text-white" : "text-foreground/80 dark:text-white/80")
                            : "text-sidebar-foreground"
                        )}>
                          {conversation.title}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={cn(
                    "px-2 py-2 text-center text-xs",
                    mode === 'agentic' ? "text-foreground/30 dark:text-white/30" : "text-sidebar-foreground/40"
                  )}>
                    No conversations yet
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center p-2">
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-md transition-colors duration-200 ease-in-out",
                mode === 'agentic'
                  ? "text-foreground/60 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 8l0 4l2 2" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div
        className={cn(
          "transition-all duration-200 ease-linear flex-shrink-0",
          !isExpanded && "flex justify-center w-full"
        )}
      >
        <ProfileDropdown
          data={{
            name: user.name,
            email: user.email,
            avatar: user.avatar || undefined,
          }}
          showUserDetails={isExpanded}
          side="top"
          align={isExpanded ? "center" : "start"}
          sideOffset={8}
          alignOffset={isExpanded ? 0 : 20}
          onSignOut={onLogout}
          className={cn(
            "transition-all duration-200 ease-linear flex-shrink-0",
            !isExpanded && "w-fit"
          )}
        />
      </div>
    </>
  );
}

export default function ChatSidebar({
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onLogout,
  isLoadingConversations,
  mobileOpen = false,
  onMobileClose,
  mode = 'chat',
}: ChatSidebarProps) {
  const [open, setOpen] = useState(false);

  const sharedProps = {
    user,
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onLogout,
    isLoadingConversations,
    mode,
  };

  return (
    <>
      {/* Mobile: Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile: Sidebar Drawer */}
      <motion.div
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:hidden w-72 flex flex-col transition-all duration-300",
          mode === 'agentic' ? "border-r-0" : "border-r border-border"
        )}
        initial={false}
        animate={{ x: mobileOpen ? 0 : -288 }}
        transition={{ duration: 0.2, ease: "linear" }}
      >
          <div className={cn(
            "justify-between gap-4 p-3 h-full flex flex-col transition-colors duration-200",
            mobileOpen ? "bg-sidebar" : "bg-transparent"
          )}>
          <SidebarInnerContent
            {...sharedProps}
            isExpanded={true}
            onClose={onMobileClose}
          />
        </div>
      </motion.div>

      {/* Desktop: Animated collapsible sidebar */}
      <Sidebar
        open={open}
        setOpen={setOpen}
        className={cn(
          "hidden md:flex flex-shrink-0 transition-all duration-300",
          mode === 'agentic' ? "border-r-0" : ""
        )}
      >
        <SidebarBody
          open={open}
          setOpen={setOpen}
          className={cn(
            "justify-between gap-4 p-3 h-full flex flex-col transition-all duration-300 ease-linear",
            open ? "bg-sidebar" : "bg-transparent"
          )}
        >
          <SidebarInnerContent
            {...sharedProps}
            isExpanded={open}
            onLogoClick={() => setOpen(!open)}
          />
        </SidebarBody>
      </Sidebar>
    </>
  );
}