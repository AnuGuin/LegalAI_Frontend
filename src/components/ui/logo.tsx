"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  showText?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "sidebar";
}

export function Logo({ 
  collapsed = false, 
  showText = true, 
  onClick, 
  className,
  variant = "default" 
}: LogoProps) {
  const isClickable = !!onClick;
  
  const content = (
    <motion.div
      className={cn(
        "flex items-center",
        variant === "sidebar" ? "gap-2" : "space-x-2",
        className
      )}
      whileHover={isClickable ? { scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center rounded-lg relative overflow-hidden transition-all duration-300 ease-in-out aspect-square",
          variant === "sidebar" ? "h-10 w-10" : "h-12 w-12",
          collapsed
            ? "bg-transparent shadow-none"
            : variant === "sidebar"
            ? "bg-transparent shadow-none"
            : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
        )}
        whileHover={isClickable ? { scale: 1.05, rotate: collapsed ? 0 : 5 } : undefined}
        whileTap={isClickable ? { scale: 0.95 } : undefined}
        animate={{
          background: collapsed
            ? "transparent"
            : variant === "sidebar"
            ? "transparent"
            : "linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241))",
          boxShadow: collapsed
            ? "0 0 0 0 rgba(0, 0, 0, 0)"
            : variant === "sidebar"
            ? "0 0 0 0 rgba(0, 0, 0, 0)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          scale: collapsed && isClickable ? [1, 1.02, 1] : 1,
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: collapsed && isClickable ? Infinity : 0,
            ease: "easeInOut",
          },
          background: { duration: 0.3 },
          boxShadow: { duration: 0.3 },
          default: { type: "spring", stiffness: 400, damping: 17 },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={collapsed ? "logo-collapsed" : "logo"}
            initial={{ opacity: 0, rotate: collapsed ? -90 : 90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: collapsed ? 90 : -90, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-center"
          >
            <img src="/images/light.png" alt="LegalAI" className="block dark:hidden h-full w-full object-contain" style={{ imageRendering: "auto" }} />
            <img src="/images/dark.png" alt="LegalAI" className="hidden dark:block h-full w-full object-contain" style={{ imageRendering: "auto" }} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showText && !collapsed && (
          <motion.span
            className={cn(
              "font-bold bg-gradient-to-r bg-clip-text text-transparent",
              variant === "sidebar"
                ? "text-lg from-slate-800 to-slate-600 dark:from-neutral-100 dark:to-neutral-300"
                : "text-xl from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
            )}
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            LegalAI
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative z-20 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out",
          variant === "sidebar"
            ? cn("text-sidebar-foreground p-2 rounded-lg")
            : "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {content}
      </button>
    );
  }

  return content;
}