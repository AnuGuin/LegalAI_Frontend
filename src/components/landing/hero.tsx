"use client";

import { useLayoutEffect, useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BorderBeam } from "@/components/ui/border-beam";
import { Spotlight } from "@/components/ui/spotlight";
import Particles from "@/components/ui/particles";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { CanvasText } from "../ui/canvas-text";
interface HeroProps {
  onGetStarted?: () => void;
}

export function Hero({ onGetStarted }: HeroProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-background dark:bg-[rgb(3,2,13)] pt-24 pb-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Ambient Glow & Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Spotlight
          gradientFirst="radial-gradient(50% 50% at 50% 50%, rgba(59, 79, 248, 0.08) 0%, rgba(99, 102, 241, 0.02) 50%, transparent 100%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 100%)"
          width={800}
          height={1400}
        />
        <Particles
          particleCount={80}
          particleSpread={8}
          speed={0.15}
          particleColors={["#3b4ff8", "#818cf8", "#c7d2fe"]}
          alphaParticles
          particleBaseSize={8}
          className="absolute inset-0 opacity-40"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-7xl mx-auto w-full text-center mt-12 md:mt-16">
        {/* Glowing Top Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md text-primary text-xs md:text-sm font-medium tracking-wide mb-6 shadow-[0_0_15px_rgba(59,79,248,0.1)] hover:border-primary/40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Introducing LegalAI Counsel v2.5</span>
          <ArrowRight className="w-3 h-3 text-primary/70" />
        </motion.div>

        {/* Cinematic Headline */}
        <div className="max-w-4xl w-full text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full text-center text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]"
          >
            <span className="block w-full text-center">Your Legal Queries</span>
            <span className="flex justify-center w-full mt-2">
              <CanvasText
                text="Precision Engineered"
                className="text-4xl ml-10 sm:text-6xl md:text-7xl font-bold font-display"
                backgroundClassName="bg-blue-600 dark:bg-blue-700"
                colors={[
                  "rgba(0, 153, 255, 1)",
                  "rgba(0, 153, 255, 0.9)",
                  "rgba(0, 153, 255, 0.8)",
                  "rgba(0, 153, 255, 0.7)",
                  "rgba(0, 153, 255, 0.6)",
                  "rgba(0, 153, 255, 0.5)",
                  "rgba(0, 153, 255, 0.4)",
                  "rgba(0, 153, 255, 0.3)",
                  "rgba(0, 153, 255, 0.2)",
                  "rgba(0, 153, 255, 0.1)",
                ]}
                lineGap={4}
                animationDuration={20}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground/95 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your legal practice with AI-powered solutions. Streamline document analysis, automate contract drafting, and retrieve instant regulatory insights.
          </motion.p>
        </div>

        {/* Responsive Dual Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md"
        >
          <Link
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_30px_rgba(59,79,248,0.35)] hover:shadow-[0_0_40px_rgba(59,79,248,0.5)] cursor-pointer"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}