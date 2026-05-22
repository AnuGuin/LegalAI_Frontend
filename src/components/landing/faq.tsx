'use client'

import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import ContactUsModal from '../team/contact-us'
import { HelpCircle, Terminal } from 'lucide-react'

export default function FAQsTwo() {
    const [isContactOpen, setIsContactOpen] = useState(false)

    const faqItems = [
        {
            id: 'item-1',
            question: 'How does LegalAI secure client privilege and work product?',
            answer: 'We enforce a zero-retention data policy. Documents uploaded to the parsing console are processed in ephemeral memory, fully encrypted in transit and at rest, and are never utilized to train public or foundational models.',
        },
        {
            id: 'item-2',
            question: 'How does the platform prevent hallucination of statutes and cases?',
            answer: 'LegalAI utilizes a multi-step Retrieval-Augmented Generation (RAG) system cross-referenced against authoritative statutory codes and supreme court databases. Each citation is appended with direct hyperlink sources, permitting quick manual verification.',
        },
        {
            id: 'item-3',
            question: 'Can we upload custom legal playbooks and corporate guidelines?',
            answer: 'Yes. Professional and Enterprise tiers support custom playbook uploads. The AI parser maps incoming contracts against your specific clauses, flagging variance values based on your firm\'s exact liability thresholds.',
        },
        {
            id: 'item-4',
            question: 'Does the platform integrate with active case management systems?',
            answer: 'Our Enterprise Console provides RESTful APIs and webhook channels to link analysis, summaries, and drafts directly into Clio, Filevine, or custom document management platforms.',
        },
        {
            id: 'item-5',
            question: 'Is LegalAI designed to replace human legal associates?',
            answer: 'No. LegalAI is calibrated to automate routine document sorting, discovery correlations, and preliminary drafts, permitting senior counsel to focus on client strategy and courtroom execution.',
        },
    ]

    return (
        <section
            id="faq"
            className="py-24 relative overflow-hidden rounded-t-[32px] md:rounded-t-[40px] bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-transparent dark:bg-[rgb(3,2,13)] dark:from-[rgb(3,2,13)] dark:via-[rgb(3,2,13)] dark:to-[rgb(3,2,13)]"
        >
            {/* Halo bloom — dark mode only */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[180px] pointer-events-none opacity-0 dark:opacity-100 blur-[60px] rounded-full"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,79,248,0.28) 0%, rgba(59,79,248,0.08) 45%, transparent 70%)" }}
            />
            {/* Light mode bloom */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[220px] pointer-events-none opacity-75 dark:opacity-0 blur-[70px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18)_0%,rgba(147,197,253,0.05)_50%,transparent_100%)]"
            />

            <div className="mx-auto max-w-4xl px-4 md:px-6 relative z-10">

                {/* FAQ Header */}
                <div className="mx-auto text-center max-w-2xl mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Platform FAQs</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
                        Frequently Answered Queries
                    </h2>
                    <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                        Detailed specifications on architecture, security policy, and domain-alignment methods.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="mx-auto mt-12 max-w-2xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card/70 dark:bg-card/45 backdrop-blur-md w-full rounded-2xl border border-blue-200/30 dark:border-white/10 px-6 sm:px-8 py-3 shadow-xl relative z-10">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed border-border/80">
                                <AccordionTrigger className="cursor-pointer text-sm font-medium hover:no-underline py-4 text-foreground hover:text-primary transition-colors">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                                        {item.answer}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-center text-xs font-mono text-muted-foreground mt-8">
                        Require specialized deployment details?{' '}
                        <Link
                            href="#contact"
                            onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}
                            className="text-primary font-bold hover:underline">
                            Contact our systems desk
                        </Link>
                    </p>
                    <ContactUsModal open={isContactOpen} onOpenChange={setIsContactOpen} />
                </div>
            </div>
        </section>
    )
}