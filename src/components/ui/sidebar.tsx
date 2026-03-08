"use client";

import React, { createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar");
  }
  return context;
};

interface SidebarProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
}

export function Sidebar({ children, open, setOpen, className }: SidebarProps) {
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <motion.div
        className={cn(
          "relative flex h-full w-fit flex-col border-r border-border",
          open && "shadow-xl shadow-slate-300/40 dark:shadow-black/40",
          className
        )}
        initial={false}
        animate={{
          width: open ? "280px" : "65px",
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </SidebarContext.Provider>
  );
}

interface SidebarBodyProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
}

export function SidebarBody({ children, className }: SidebarBodyProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function SidebarLink({ link, className }: SidebarLinkProps) {
  const { open } = useSidebar();

  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 dark:text-neutral-400 transition-colors hover:bg-slate-200 dark:hover:bg-neutral-800 hover:text-slate-700 dark:hover:text-neutral-300",
        className
      )}
    >
      {link.icon && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          {link.icon}
        </div>
      )}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {link.label}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}