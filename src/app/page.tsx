"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features, Pricing, CallToAction } from "@/components/landing/sections";
import { Footer } from "@/components/landing/footer";
import { LoaderOne } from "@/components/ui/loader";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { usePageTransition } from "@/hooks/use-page-transition";
import FAQsTwo from "@/components/landing/faq";

 
export default function LandingPage() {
  const { navigate, isNavigating } = usePageTransition();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <>
      {/* Loader */}
      <AnimatePresence mode="wait">
        {isNavigating && (
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
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
          <BackgroundBeams/>
      </div>

      <motion.div
        animate={{ 
          opacity: isNavigating ? 0 : 1,
          scale: isNavigating ? 0.98 : 1 
        }}
        transition={{ duration: 0.3 }}
        className="relative z-10 min-h-screen bg-transparent pt-16 -mt-16 scroll-smooth"
      >
        <Navbar animate />
        <main className="scroll-container">
          <section id="home">
            <Hero/>
          </section>
          <section id="features" className="mt-16">
            <Features />
          </section>
          <section id="faq" className="-mt-12">
            <FAQsTwo />
          </section>
          <section id="pricing">
            <Pricing />
          </section>
          <section id="cta">
            <CallToAction />
          </section>
        </main>
        <Footer />
      </motion.div>
    </>
  );
}
