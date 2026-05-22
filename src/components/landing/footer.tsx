"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import TocDialog from '@/components/docs/terms/toc-dialog'
import PrivacyDialog from '@/components/docs/terms/privacy-dialog'
import CookiePolicyDialog from '@/components/docs/terms/cookie-dialog'
import ContactUsModal from '@/components/team/contact-us'

export function Footer() {
  const [isTocOpen, setIsTocOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isCookieOpen, setIsCookieOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <footer className="bg-background dark:bg-[rgb(3,2,13)] pt-24 pb-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-900 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto relative z-10">

        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-display font-medium text-zinc-900 dark:text-zinc-100 leading-snug tracking-tight">
              Fusing deep technology and domain legal expertise to build sovereign legal AI systems.
            </h2>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 w-full sm:w-[380px]">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-0 outline-none text-sm text-zinc-900 dark:text-white w-full pr-12 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-0"
              />
              <button
                aria-label="Subscribe to newsletter"
                className="absolute right-1.5 w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] font-mono tracking-wider text-zinc-400 dark:text-zinc-600 mt-3 uppercase">
              BY SUBSCRIBING YOU AGREE TO OUR TERMS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 mb-20">
          <div>
            <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-300 tracking-wider uppercase mb-5">Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Home</a></li>
              <li>
                <Link href="/about" target="_blank" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}
                  className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-300 tracking-wider uppercase mb-5">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Our Platform</a></li>
              <li><a href="#pricing" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Why LegalAI?</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-300 tracking-wider uppercase mb-5">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#faq" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Research</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-300 tracking-wider uppercase mb-5">Socials</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">X</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-900/80 pt-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono tracking-widest text-zinc-400 dark:text-zinc-600 gap-4 uppercase mb-16">
          <div>© COPYRIGHT {new Date().getFullYear()} LEGALAI.SOFTWARE</div>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => setIsTocOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              TERMS OF SERVICE
            </button>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              PRIVACY POLICY
            </button>
            <button
              onClick={() => setIsCookieOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              COOKIE POLICY
            </button>
          </div>
        </div>

        <div className="mt-8 select-none pointer-events-none text-center">
          <h1 className="text-[15vw] font-black tracking-widest leading-none text-zinc-200 dark:text-zinc-900 uppercase font-display">
            LEGALAI
          </h1>
        </div>

        {/* Dialogs */}
        <TocDialog open={isTocOpen} onOpenChange={setIsTocOpen} />
        <PrivacyDialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
        <CookiePolicyDialog open={isCookieOpen} onOpenChange={setIsCookieOpen} />
        <ContactUsModal open={isContactOpen} onOpenChange={setIsContactOpen} />

      </div>
    </footer>
  )
}