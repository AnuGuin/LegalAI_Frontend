"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileText,
  Shield,
  Check,
  Search,
  FileCheck,
  Terminal,
  Bot,
  Globe,
  Share2,
  Scale,
  MessageSquare,
  BookOpen,
  Languages,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from "lucide-react";

function IconBox({ icon: Icon, className = "" }: { icon: React.ElementType; className?: string }) {
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${className}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

interface BentoGridItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  tag?: string;
}

const BentoGridItem = ({
  title,
  description,
  icon,
  className,
  size = "small",
  tag,
}: BentoGridItemProps) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, damping: 25 },
    },
  };

  return (
    <motion.div
      variants={variants}
      className={cn(
        "group border-blue-200/40 dark:border-white/[0.06] bg-blue-50/30 dark:bg-white/[0.02] hover:border-primary/30 dark:hover:border-primary/20 relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border px-6 pt-6 pb-8 shadow-sm hover:shadow-md transition-all duration-500",
        className,
      )}
    >

      <div className="absolute top-0 -right-1/2 z-0 size-full cursor-pointer bg-[linear-gradient(to_right,rgba(59,79,248,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,79,248,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(59,79,248,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,79,248,0.06)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:20px_20px] transition-all duration-500 group-hover:scale-105"></div>

      <div className="text-primary/5 dark:text-primary/3 group-hover:text-primary/8 absolute right-1 bottom-3 scale-[6] transition-all duration-700 group-hover:scale-[6.2] pointer-events-none select-none">
        {icon}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="bg-primary/10 text-primary shadow-primary/5 dark:shadow-none group-hover:bg-primary/25 mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/15 shadow transition-all duration-500">
            {icon}
          </div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-lg font-bold font-display tracking-tight text-foreground leading-snug">{title}</h3>
            {tag && (
              <span className="text-[9px] font-mono font-semibold text-primary/70 dark:text-primary/40 bg-primary/10 dark:bg-primary/20 border border-primary/15 px-2 py-0.5 rounded-full shrink-0">
                {tag}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
        </div>
        <div className="text-primary dark:text-primary-foreground/90 mt-6 flex items-center text-xs font-semibold">
          <span className="mr-1">Learn more</span>
          <ArrowRight className="size-3.5 transition-all duration-500 group-hover:translate-x-2" />
        </div>
      </div>

      <div className="from-primary/60 to-primary/10 absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r blur-sm transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:blur-none" />
    </motion.div>
  );
};


export function Features() {
  const cards = [
    {
      id: "clause-analysis",
      title: "Interactive Clause Analysis",
      description:
        "Identify liabilities, exposure metrics, and non-standard terms in complex contracts instantly with real-time risk flagging.",
      gradient: "from-blue-100/80 via-indigo-50 to-slate-100 dark:from-blue-950/90 dark:via-blue-900/70 dark:to-slate-950/90",
      accentColor: "#3b82f6",
      visual: (
        <div className="w-full h-full flex flex-col gap-3 items-start justify-center px-2">
          <div className="w-full bg-background/50 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-mono font-bold bg-red-500/20 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">HIGH RISK</span>
              <span className="text-[9px] font-mono text-muted-foreground">§ 14.2 Liability Cap</span>
            </div>
            <div className="h-1.5 bg-red-500/20 rounded-full w-3/4" />
          </div>
          <div className="w-full bg-background/50 border border-primary/20 rounded-lg p-3 opacity-80">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-mono font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">STANDARD</span>
              <span className="text-[9px] font-mono text-muted-foreground">§ 8.1 IP Transfer</span>
            </div>
            <div className="h-1.5 bg-primary/20 rounded-full w-1/2" />
          </div>
          <div className="w-full bg-background/50 border border-amber-500/20 rounded-lg p-3 opacity-60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">REVIEW</span>
              <span className="text-[9px] font-mono text-muted-foreground">§ 22.4 Indemnity</span>
            </div>
            <div className="h-1.5 bg-amber-500/20 rounded-full w-2/3" />
          </div>
        </div>
      ),
    },
    {
      id: "smart-drafting",
      title: "Smart Contract Architect",
      description:
        "Generate tailored contracts from intelligent templates. Jurisdiction-aware, playbook-aligned, ready for signature.",
      gradient: "from-sky-100/80 via-blue-50 to-slate-100 dark:from-slate-950/90 dark:via-blue-950/60 dark:to-slate-900/90",
      accentColor: "#60a5fa",
      visual: (
        <div className="w-full h-full flex flex-col gap-3 items-start justify-center px-2">
          <div className="flex items-center gap-2 w-full bg-background/40 border border-border/60 rounded-lg px-3 py-2">
            <FileCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[9px] font-mono text-foreground">Non-Disclosure Agreement</span>
            <span className="ml-auto text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">READY</span>
          </div>
          <div className="flex items-center gap-2 w-full bg-background/40 border border-border/60 rounded-lg px-3 py-2 opacity-75">
            <FileCheck className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
            <span className="text-[9px] font-mono text-foreground">SaaS Services Agreement</span>
            <span className="ml-auto text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">READY</span>
          </div>
          <div className="flex items-center gap-2 w-full bg-background/40 border border-border/60 rounded-lg px-3 py-2 opacity-45">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-[9px] font-mono text-muted-foreground">Employment Indemnity Form</span>
            <span className="ml-auto text-[8px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">DRAFT</span>
          </div>
        </div>
      ),
    },
    {
      id: "semantic-search",
      title: "Semantic Search Matrix",
      description:
        "Search using conversational legal intents. Scan thousands of court rulings, statutes, and codes in milliseconds.",
      gradient: "from-indigo-100/80 via-sky-50 to-slate-100 dark:from-slate-950/90 dark:via-blue-950/50 dark:to-slate-900/90",
      accentColor: "#93c5fd",
      visual: (
        <div className="w-full h-full flex flex-col gap-3 items-start justify-center px-2">
          <div className="flex items-center gap-2 w-full bg-background/50 border border-primary/20 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-[9px] font-mono text-foreground/70">gross negligence liability cap...</span>
          </div>
          <div className="w-full border-l-2 border-primary/50 pl-3 py-1">
            <div className="text-[9px] font-mono font-bold text-foreground/90">Central Board v. TechCorp (2024)</div>
            <div className="text-[8px] font-mono text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              &ldquo;Liability terms do not apply when gross negligence is documented.&rdquo;
            </div>
          </div>
          <div className="w-full border-l-2 border-border/40 pl-3 py-1 opacity-50">
            <div className="text-[9px] font-mono font-bold text-foreground/70">Apex Logistics v. State Union (2022)</div>
            <div className="text-[8px] font-mono text-muted-foreground mt-1">§4.1 waiver nullified — safety non-compliance.</div>
          </div>
        </div>
      ),
    },
  ];

  const leftNodes = [
    { Icon: Bot, label: "Agentic Chat", sub: "NORMAL & AGENTIC modes" },
    { Icon: FileText, label: "Doc Generation", sub: "PDF · DOCX · TXT" },
    { Icon: Search, label: "Clause Analysis", sub: "Real-time risk flagging" },
  ];
  const rightNodes = [
    { Icon: Languages, label: "Translation", sub: "20+ legal languages" },
    { Icon: Share2, label: "Secure Sharing", sub: "Expirable share links" },
    { Icon: Scale, label: "Lawyer Portal", sub: "Bar verification · 2FA" },
  ];

  const features = [
    {
      Icon: MessageSquare,
      title: "Dual Chat Modes",
      desc: "Switch between standard NORMAL mode and full AGENTIC mode for autonomous multi-step legal reasoning.",
      tag: "Chat",
      size: "large" as const,
    },
    {
      Icon: BookOpen,
      title: "Document Templates",
      desc: "Generate Vakalatnama, Bail Applications, NDAs, and more from validated templates with critical field checking.",
      tag: "Documents",
      size: "small" as const,
    },
    {
      Icon: Search,
      title: "Semantic Case Search",
      desc: "Query precedents, statutes, and codes using natural language across thousands of indexed court rulings.",
      tag: "Search",
      size: "medium" as const,
    },
    {
      Icon: Globe,
      title: "Legal Translation",
      desc: "Translate legal documents across 20+ languages with automatic language detection and full audit history.",
      tag: "Translation",
      size: "medium" as const,
    },
    {
      Icon: Share2,
      title: "Conversation Sharing",
      desc: "Generate secure, expirable share links for legal consultations with view-count limits and access controls.",
      tag: "Collaboration",
      size: "small" as const,
    },
    {
      Icon: ShieldCheck,
      title: "Lawyer Verification",
      desc: "Dedicated portal for verified advocates with Bar Council authentication, OTP 2FA, and jurisdiction profiling.",
      tag: "Security",
      size: "large" as const,
    },
  ];


  const SvgDefs = () => (
    <defs>
      <linearGradient id="lg-left" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id="lg-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
      </linearGradient>
      <filter id="glow-line" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );

  return (
    <section
      id="features"
      className="py-24 md:py-32 relative overflow-hidden rounded-t-[32px] md:rounded-t-[40px] bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-transparent dark:bg-[rgb(3,2,13)] dark:from-[rgb(3,2,13)] dark:via-[rgb(3,2,13)] dark:to-[rgb(3,2,13)]"
    >
      <div className="absolute inset-0 rounded-t-[32px] md:rounded-t-[40px] overflow-hidden pointer-events-none">

        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[320px] opacity-0 dark:opacity-100 blur-[90px]"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,79,248,0.55) 0%, rgba(59,79,248,0.22) 40%, rgba(99,102,241,0.06) 65%, transparent 80%)" }}
        />

        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[45%] h-[200px] opacity-0 dark:opacity-100 blur-[50px]"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,120,255,0.45) 0%, rgba(59,79,248,0.12) 55%, transparent 75%)" }}
        />

        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[75%] h-[260px] opacity-75 dark:opacity-0 blur-[70px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.22)_0%,rgba(147,197,253,0.07)_50%,transparent_100%)]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </motion.div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight leading-tight max-w-xl"
            >
              Built for every stage of legal work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base text-muted-foreground leading-relaxed max-w-sm md:text-right"
            >
              Domain-specialized LLMs aligned with legal principles to de-risk operations and streamline discovery.
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.12 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative rounded-2xl border border-blue-200/30 dark:border-white/10 bg-card/80 dark:bg-card/45 backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/45 dark:hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
              style={{ minHeight: "420px" }}
            >
              <div className={`relative h-[220px] w-full bg-gradient-to-br ${card.gradient} overflow-hidden`}>
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-35" style={{ background: card.accentColor }} />
                <div className="relative z-10 w-full h-full p-5">{card.visual}</div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display tracking-tight leading-snug mb-2.5 group-hover:text-primary dark:group-hover:text-white transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50 dark:border-white/10">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono text-muted-foreground bg-muted/40 dark:bg-white/5 border border-border/50 dark:border-white/10 px-2 py-0.5 rounded">AI-Powered</span>
                    <span className="text-[9px] font-mono text-muted-foreground bg-muted/40 dark:bg-white/5 border border-border/50 dark:border-white/10 px-2 py-0.5 rounded">Real-time</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className="w-7 h-7 rounded-full border border-border/60 dark:border-white/15 flex items-center justify-center text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-all duration-200"
                  >
                    <span className="text-sm font-light leading-none">+</span>
                  </motion.div>
                </div>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${card.accentColor}90, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-20 relative rounded-3xl border border-blue-200/30 dark:border-blue-400/12 bg-card/85 dark:bg-[#0a123c]/55 backdrop-blur-md overflow-hidden"
        >


          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.14),transparent_65%)] pointer-events-none" />

          <div className="relative z-10 px-6 py-12 md:py-14">

            <div className="text-center mb-10">
              <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mb-2">Core Architecture</p>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
                Unlock your legal practice&apos;s{" "}
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                  full potential
                </span>
              </h3>
            </div>

            <div className="hidden md:flex items-center justify-center max-w-5xl mx-auto">

              <div className="flex flex-col gap-3 w-[180px] shrink-0">
                {leftNodes.map(({ Icon, label, sub }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2.5 bg-primary/10 border border-primary/15 rounded-xl px-3 py-2.5 hover:bg-primary/15 hover:border-primary/25 transition-all duration-200 cursor-default group"
                  >
                    <IconBox icon={Icon} className="bg-primary/15 border border-primary/20 text-primary group-hover:bg-primary/20" />
                    <div>
                      <div className="text-[11px] font-semibold text-foreground group-hover:text-primary dark:group-hover:text-white transition-colors leading-tight">{label}</div>
                      <div className="text-[9px] text-muted-foreground font-mono mt-0.5 leading-tight">{sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex-1 relative" style={{ height: "190px", minWidth: "56px" }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 190" preserveAspectRatio="none">
                  <SvgDefs />
                  <motion.path d="M 0,30 C 70,30 90,95 160,95" stroke="url(#lg-left)" strokeWidth="1.5" fill="none" filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.5 }} />
                  <motion.path d="M 0,95 L 160,95" stroke="url(#lg-left)" strokeWidth="1.5" fill="none" filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.65 }} />
                  <motion.path d="M 0,160 C 70,160 90,95 160,95" stroke="url(#lg-left)" strokeWidth="1.5" fill="none" filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.8 }} />
                  <motion.circle cx="0" cy="0" r="3" fill="#60a5fa"
                    animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5, delay: 2 }}>
                    <animateMotion dur="1.6s" repeatCount="indefinite" begin="2s" path="M 0,30 C 70,30 90,95 160,95" />
                  </motion.circle>
                  <motion.circle cx="0" cy="0" r="3" fill="#60a5fa"
                    animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5, delay: 3.2 }}>
                    <animateMotion dur="1.6s" repeatCount="indefinite" begin="3.2s" path="M 0,160 C 70,160 90,95 160,95" />
                  </motion.circle>
                </svg>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45, type: "spring", stiffness: 180 }}
                className="relative flex-shrink-0 flex flex-col items-center"
              >
                <motion.div animate={{ scale: [1, 1.28, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-28 h-28 rounded-full border border-primary/20 bg-primary/4" />
                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0, 0.15] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                  className="absolute w-28 h-28 rounded-full border border-primary/12" />
                <div className="relative w-[84px] h-[84px] rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-[0_0_48px_rgba(59,130,246,0.6)] border border-blue-400/25 z-10">
                  <Cpu className="w-9 h-9 text-white/90" />
                </div>
                <div className="mt-3 text-[9px] font-mono font-bold text-primary/70 uppercase tracking-widest whitespace-nowrap">
                  LegalAI Core
                </div>
              </motion.div>

              <div className="flex-1 relative" style={{ height: "190px", minWidth: "56px" }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 190" preserveAspectRatio="none">
                  <motion.path d="M 0,95 C 70,95 90,30 160,30" stroke="url(#lg-right)" strokeWidth="1.5" fill="none" filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.55 }} />
                  <motion.path d="M 0,95 L 160,95" stroke="url(#lg-right)" strokeWidth="1.5" fill="none" filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.7 }} />
                  <motion.path d="M 0,95 C 70,95 90,160 160,160" stroke="url(#lg-right)" strokeWidth="1.5" fill="none" filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.85 }} />
                  <motion.circle cx="0" cy="0" r="3" fill="#60a5fa"
                    animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5, delay: 2.5 }}>
                    <animateMotion dur="1.6s" repeatCount="indefinite" begin="2.5s" path="M 0,95 C 70,95 90,30 160,30" />
                  </motion.circle>
                </svg>
              </div>

              <div className="flex flex-col gap-3 w-[180px] shrink-0">
                {rightNodes.map(({ Icon, label, sub }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.35 + i * 0.1 }}
                    className="flex items-center gap-2.5 bg-primary/10 border border-primary/15 rounded-xl px-3 py-2.5 hover:bg-primary/15 hover:border-primary/25 transition-all duration-200 cursor-default group"
                  >
                    <IconBox icon={Icon} className="bg-primary/15 border border-primary/20 text-primary group-hover:bg-primary/20" />
                    <div>
                      <div className="text-[11px] font-semibold text-foreground group-hover:text-primary dark:group-hover:text-white transition-colors leading-tight">{label}</div>
                      <div className="text-[9px] text-muted-foreground font-mono mt-0.5 leading-tight">{sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex md:hidden flex-col items-center gap-8">
              {/* Orb */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative flex flex-col items-center"
              >
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-24 h-24 rounded-full border border-primary/20 bg-primary/4" />
                <div className="relative w-[76px] h-[76px] rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.55)] border border-blue-400/25 z-10">
                  <Cpu className="w-8 h-8 text-white/90" />
                </div>
                <div className="mt-3 text-[9px] font-mono font-bold text-primary/70 uppercase tracking-widest">LegalAI Core</div>
              </motion.div>

              <div className="grid grid-cols-2 gap-3 w-full">
                {[...leftNodes, ...rightNodes].map(({ Icon, label, sub }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                    className="flex items-center gap-2 bg-primary/10 border border-primary/15 rounded-xl px-3 py-2.5 group"
                  >
                    <IconBox icon={Icon} className="bg-primary/15 border border-primary/20 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-foreground leading-tight truncate">{label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
              },
            },
          }}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6"
        >
          {features.map(({ Icon, title, desc, tag, size }, idx) => (
            <BentoGridItem
              key={idx}
              title={title}
              description={desc}
              icon={<Icon className="size-6" />}
              size={size}
              tag={tag}
              className={cn(
                size === "large"
                  ? "md:col-span-4 sm:col-span-2 col-span-1"
                  : size === "medium"
                    ? "md:col-span-3 sm:col-span-1 col-span-1"
                    : "md:col-span-2 sm:col-span-1 col-span-1",
                "h-full"
              )}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-blue-200/45 dark:border-blue-400/10 px-8 py-5 bg-blue-50/45 dark:bg-white/[0.03] backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground font-display">Enterprise Shield</p>
              <p className="text-xs text-muted-foreground">Zero retention · SOC 2 aligned · Client-privilege isolation</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Real-time Risk Flagging</div>
            <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Jurisdiction Alignment</div>
            <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Custom Playbooks</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}