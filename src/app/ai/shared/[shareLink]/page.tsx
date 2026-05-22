"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { usePageTransition } from "@/hooks/use-page-transition";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderOne } from "@/components/ui/loader";
import { apiService, type Conversation as BackendConversation } from "@/lib/api.service";
import { ChatMessage } from "@/components/citizen/chat/chat-message";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Calendar,
  Eye,
  Clock,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { type Message } from "@/types/chat.types";

interface SharedData {
  userName: string;
  conversation: BackendConversation;
  shareInfo?: {
    viewCount: number;
    maxViews: number | null;
    expiresAt: string | null;
  };
}

function transformMessage(msg: any): Message {
  return {
    id: msg.id,
    uiKey: msg.id,
    content: msg.content,
    role: msg.role === "USER" ? "user" : "assistant",
    attachments: msg.attachments,
    metadata: msg.metadata,
    createdAt: msg.createdAt,
  } as Message;
}

export default function SharedChatPage() {
  const { shareLink } = useParams() as { shareLink: string };
  const { navigate, isNavigating } = usePageTransition();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsCheckingAuth(false);
      } catch (err) {
        navigate("/auth");
      }
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    if (isCheckingAuth || !user || !shareLink) return;

    let mounted = true;
    const fetchSharedChat = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getSharedConversation(shareLink);
        if (mounted) {
          setSharedData(data);
        }
      } catch (err: any) {
        if (mounted) {
          console.error("Error loading shared chat:", err);
          setError(
            err?.body?.message ||
            err?.message ||
            "The conversation link is invalid, has expired, or is no longer shared."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSharedChat();
    return () => {
      mounted = false;
    };
  }, [shareLink, user, isCheckingAuth]);

  const transformedMessages = useMemo(() => {
    return sharedData?.conversation?.messages?.map(transformMessage) || [];
  }, [sharedData]);


  if (isCheckingAuth || isNavigating || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <LoaderOne />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-background" />
        <div className="absolute inset-0 z-0 opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full p-8 rounded-3xl border border-red-500/10 bg-white/5 dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Conversation Not Available</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error}
          </p>
          <Button
            onClick={() => navigate("/ai")}
            className="w-full rounded-xl py-6 bg-red-500/15 hover:bg-red-500/25 text-red-500 border border-red-500/20 transition-all font-semibold"
          >
            Back to Assistant
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background w-full">
      {/* Background radial gradients for branding aesthetic */}
      <div className="absolute inset-0 z-0 bg-background" />
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500 ease-in-out"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 100% 70% at 55% 58%, rgba(138, 43, 226, 0.12), transparent 60%),
               radial-gradient(ellipse 85% 55% at 45% 53%, rgba(0, 255, 255, 0.08), transparent 55%),
               radial-gradient(ellipse 75% 50% at 65% 63%, rgba(255, 20, 147, 0.10), transparent 55%),
               #000000`
            : `radial-gradient(ellipse 100% 70% at 55% 58%, rgba(59, 130, 246, 0.10), transparent 60%),
               radial-gradient(ellipse 85% 55% at 45% 53%, rgba(14, 165, 233, 0.12), transparent 55%),
               radial-gradient(ellipse 75% 50% at 65% 63%, rgba(56, 189, 248, 0.10), transparent 55%),
               #ffffff`,
        }}
      />

      {/* Styled Brand Header bar */}
      <header className="sticky top-4 z-30 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo onClick={() => navigate("/ai")} className="cursor-pointer" />

          <div className="hidden sm:flex items-center gap-2 max-w-[50%]">
            <span className="text-sm font-medium text-muted-foreground truncate">
              Shared Chat:
            </span>
            <span className="text-sm font-semibold text-foreground truncate">
              {sharedData?.conversation?.title}
            </span>
          </div>

          <Button
            onClick={() => navigate("/ai")}
            variant="outline"
            className="rounded-xl px-4 py-2 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-medium text-sm gap-2"
          >
            <span>My Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Scrollable conversation section */}
      <div className="flex-1 overflow-y-auto relative z-10 w-full">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-32">

          {/* Shared Metadata Card */}
          {sharedData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {sharedData.userName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Shared by</p>
                  <h3 className="text-sm font-semibold text-foreground">{sharedData.userName}</h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground border-t border-zinc-200/50 dark:border-zinc-800/50 md:border-t-0 pt-3 md:pt-0">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{sharedData.conversation.createdAt ? new Date(sharedData.conversation.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Unknown Date'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{sharedData.shareInfo?.viewCount ?? 1} views {sharedData.shareInfo?.maxViews ? `/ ${sharedData.shareInfo.maxViews}` : ''}</span>
                </div>
                {sharedData.shareInfo?.expiresAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Expires: {new Date(sharedData.shareInfo.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Conversation history area */}
          <div className="space-y-6">
            {transformedMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom overlay: CTA to Start Your Own Session */}
      <div className="sticky bottom-0 left-0 w-full pt-16 pb-8 px-4 z-20 pointer-events-none bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl rounded-3xl p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400">
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-wider">Read-Only Snapshot</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This conversation is a read-only share. You can start your own session with the NyayMitra Assistant to ask questions, draft documents, or research.
            </p>
            <Button
              onClick={() => navigate("/ai")}
              className="w-full rounded-2xl py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Your Own Session</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
