"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Award, Star, ArrowRight } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import Particles from "@/components/ui/particles";

export { Features } from "@/components/landing/features-block";


export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter Console",
      price: billingPeriod === "monthly" ? "Free" : "Free",
      period: "forever",
      description: "Basic legal search utilities and document drafting templates.",
      features: [
        "Up to 50 documents/month",
        "Basic statutory database search",
        "Standard template formatting",
        "Email support response in 48h",
      ],
      cta: "Activate Free Console",
      popular: false,
    },
    {
      name: "Professional Counsel",
      price: billingPeriod === "monthly" ? "₹4,999" : "₹3,999",
      period: "month",
      description: "Comprehensive contract drafting, semantic search, and risk flags.",
      features: [
        "Up to 1,000 documents/month",
        "Advanced interactive clause analysis",
        "Supreme Court precedent correlations",
        "Priority live desk support (4h)",
        "Custom playbook checklists",
      ],
      cta: "Get Professional Counsel",
      popular: true,
    },
    {
      name: "Enterprise System",
      price: "Custom",
      period: "pricing",
      description: "Dedicated server execution, SOC 2 guarantees, and direct API access.",
      features: [
        "Unlimited document throughput",
        "Client-isolated database instance",
        "24/7 dedicated telephone desk",
        "Custom playbook fine-tuning",
        "Active Directory/SSO integrations",
      ],
      cta: "Contact Enterprise Desk",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden rounded-t-[32px] md:rounded-t-[40px] bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-transparent dark:bg-[rgb(3,2,13)] dark:from-[rgb(3,2,13)] dark:via-[rgb(3,2,13)] dark:to-[rgb(3,2,13)]">

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[180px] pointer-events-none opacity-0 dark:opacity-100 blur-[60px] rounded-full"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,79,248,0.28) 0%, rgba(59,79,248,0.08) 45%, transparent 70%)" }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[220px] pointer-events-none opacity-75 dark:opacity-0 blur-[70px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18)_0%,rgba(147,197,253,0.05)_50%,transparent_100%)]"
      />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Commercial Matrix</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
            Predictable, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Calibrate your legal operations with a tier matching your case volumes.
          </p>

          <div className="flex justify-center items-center gap-3 mt-10">
            <span className={`text-sm ${billingPeriod === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="w-12 h-6 rounded-full bg-muted border border-border p-1 flex items-center justify-start relative focus:outline-none cursor-pointer"
            >
              <motion.div
                layout
                className="w-4 h-4 rounded-full bg-primary"
                animate={{ x: billingPeriod === "monthly" ? 0 : 22 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm flex items-center gap-1.5 ${billingPeriod === "yearly" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Yearly billing
              <span className="text-[10px] font-mono bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`rounded-2xl border ${plan.popular
                ? "border-primary/50 dark:border-primary/40 bg-card/95 dark:bg-card/60 shadow-[0_0_50px_rgba(59,130,246,0.2)] md:-translate-y-2"
                : "border-blue-200/30 dark:border-white/10 bg-card/80 dark:bg-card/45"
                } p-8 flex flex-col justify-between relative group hover:border-primary/45 dark:hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-300 backdrop-blur-md`}
            >
              <div>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-indigo-600 border border-primary/40 px-4 py-1 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider shadow-lg z-20">
                    Recommended Tier
                  </div>
                )}

                <h3 className="text-xl font-bold tracking-tight text-foreground font-display mb-2">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold font-display text-foreground">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && plan.price !== "Free" && (
                    <span className="text-xs text-muted-foreground font-mono">
                      /{plan.period}
                    </span>
                  )}
                </div>

                <div className="border-t border-border/60 pt-6 mb-8">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold mb-4">
                    Inclusions
                  </h4>
                  <ul className="space-y-3.5">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href="/auth"
                className={`w-full text-center py-3 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all duration-300 ${plan.popular
                  ? "bg-primary text-white hover:bg-primary/95 shadow-[0_0_20px_rgba(59,79,248,0.25)] hover:scale-[1.02]"
                  : "bg-background/80 hover:bg-background/95 border border-border text-foreground hover:border-primary/20"
                  }`}
              >
                {plan.cta}
              </Link>

              {plan.popular && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <BorderBeam size={180} duration={8} colorFrom="#3b4ff8" colorTo="#818cf8" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


export function CallToAction() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <section id="cta" className="py-24 bg-background dark:bg-[rgb(3,2,13)] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Glow Panel Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-card/15 border border-white/5 rounded-3xl p-12 md:p-20 overflow-hidden flex flex-col items-center text-center shadow-[0_0_100px_rgba(59,79,248,0.1)]"
        >
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Particles particleCount={30} particleSpread={6} speed={0.1} particleColors={["#3b4ff8", "#818cf8"]} />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,79,248,0.12),transparent_70%)] pointer-events-none z-0" />

          <div ref={contentRef} className="relative z-10 max-w-3xl flex flex-col items-center">

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-[1.1]">
              Ready to Calibrate Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
                Legal Workflow?
              </span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground/90 max-w-xl leading-relaxed">
              Equip your firm with high-fidelity clause analysis, immediate statutory search, and structured contract compilers.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter firm email address"
                className="w-full bg-background/50 border border-border/80 px-4 py-3 rounded-xl text-xs font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shrink-0"
              >
                <span>Initialize Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Micro-trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-[10px] font-mono text-muted-foreground/80">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>Zero Retention Sandbox</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>14-day Console Trial</span>
              </div>
            </div>

          </div>

          <BorderBeam size={260} duration={12} colorFrom="#3b4ff8" colorTo="#818cf8" />
        </motion.div>
      </div>
    </section>
  );
}