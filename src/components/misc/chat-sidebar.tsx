"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  Sidebar,
  SidebarBody,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import ProfileDropdown from "@/components/misc/profile-dropdown";
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
}: SidebarInnerContentProps) {
  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-500 ease-out">
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
              className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground flex-shrink-0 transition-colors"
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
              "w-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] text-sidebar-foreground hover:bg-sidebar-accent rounded-lg text-sm font-medium flex-shrink-0 shadow-none focus:outline-none focus-visible:ring-0",
              isExpanded
                ? "justify-start gap-2 px-3 py-2 text-left bg-sidebar border border-sidebar-border/20 focus:outline-none focus-visible:ring-0"
                : "justify-center p-2 bg-transparent border-none"
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
                "shrink-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isExpanded ? "h-3 w-3" : "h-5 w-5"
              )}
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
            {isExpanded && (
              <span className="text-sidebar-foreground font-medium">
                New Chat
              </span>
            )}
          </Button>
        </div>

        {/* Recent Chats Section */}
        <div className="mt-4 flex flex-col flex-1 min-h-0 gap-1 transition-all duration-500 ease-out">
          {isExpanded ? (
            <>
              <div className="px-2 py-1 flex-shrink-0">
                <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
                  Recents
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar min-h-0">
                {isLoadingConversations ? (
                  <RecentChatSkeleton />
                ) : conversations && conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => onSelectConversation(conversation.id)}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] text-left w-full gap-3 px-3 py-2 flex-shrink-0",
                        activeConversationId === conversation.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 8l0 4l2 2" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" /></svg>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-sidebar-foreground">
                          {conversation.title}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-2 py-2 text-center text-xs text-sidebar-foreground/40">
                    No conversations yet
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center p-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-md text-sidebar-foreground/60 transition-colors duration-300 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 8l0 4l2 2" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div
        className={cn(
          "transition-all duration-500 ease-out flex-shrink-0",
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
            "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex-shrink-0",
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
  };

  return (
    <>
      {/* Mobile: Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile: Sidebar Drawer */}
      <motion.div
        className="fixed inset-y-0 left-0 z-50 md:hidden w-72 flex flex-col border-r"
        initial={false}
        animate={{ x: mobileOpen ? 0 : -288 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      >
          <div className={cn(
            "justify-between gap-4 p-3 h-full flex flex-col transition-colors duration-300",
            mobileOpen ? "bg-sidebar" : "bg-background"
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
        className="hidden md:flex flex-shrink-0"
      >
        <SidebarBody
          open={open}
          setOpen={setOpen}
          className={cn(
            "justify-between gap-4 p-3 h-full flex flex-col transition-colors duration-300 ease-out",
            open ? "bg-sidebar" : "bg-background"
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