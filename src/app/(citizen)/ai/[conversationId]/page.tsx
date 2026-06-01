"use client";

import { ChatInterface } from "@/components/citizen/chat/chat-interface";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderOne } from "@/components/ui/loader";
import { usePageTransition } from "@/hooks/use-page-transition";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export default function AIConversationPage() {
  const { navigate, isNavigating } = usePageTransition();
  const params = useParams();
  const conversationId = params.conversationId as string | undefined;
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      
        setTimeout(() => {
          setIsCheckingAuth(false);
        }, 300);
      } catch (error) {
        navigate("/auth");
        return;
      }
    } else {
      navigate("/auth");
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    navigate("/", () => {
      localStorage.removeItem("user");
      setUser(null);
    });
  };

  if (isCheckingAuth || isNavigating || !user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="loader"
          className="fixed inset-0 flex items-center justify-center bg-background z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoaderOne />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ChatInterface 
        user={user} 
        onLogout={handleLogout} 
        initialConversationId={conversationId}
      />
    </motion.div>
  );
}
