import type { Metadata } from "next";
import {
  Montserrat,
  Playfair_Display,
  Source_Code_Pro,
  Instrument_Serif,
} from "next/font/google";
// @ts-ignore
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { HeroUIProvider } from "@heroui/system";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Consolas", "monospace"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "LegalAI",
  description:
    "Transform complex legal questions into clear, actionable insights with our AI-powered legal assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="metallic-scrollbar">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} ${sourceCodePro.variable} ${instrumentSerif.variable} antialiased metallic-scrollbar`} >
        <HeroUIProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}