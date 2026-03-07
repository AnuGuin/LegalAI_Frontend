'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TocDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TocDialog({ open, onOpenChange }: TocDialogProps) {
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const content = contentRef.current;
    if (!content) return;

    const scrollPercentage =
      content.scrollTop / (content.scrollHeight - content.clientHeight);
    if (scrollPercentage >= 0.99 && !hasReadToBottom) {
      setHasReadToBottom(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 w-[calc(100%-2rem)] max-h-[90vh] sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5 backdrop-blur-sm border border-zinc-400/60 dark:border-zinc-600/20 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-white dark:bg-[rgb(53,53,53)]">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 sm:px-6 py-4 text-base">
            Terms & Conditions
          </DialogTitle>
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto"
          >
            <DialogDescription asChild>
              <div className="px-4 sm:px-6 py-4">
                <div className="[&_strong]:text-foreground space-y-4 [&_strong]:font-semibold">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p>
                        <strong>Acceptance of Terms</strong>
                      </p>
                      <p>
                        By accessing and using this website, users agree to
                        comply with and be bound by these Terms of Service.
                        Users who do not agree with these terms should
                        discontinue use of the website immediately.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>User Account Responsibilities</strong>
                      </p>
                      <p>
                        Users are responsible for maintaining the
                        confidentiality of their account credentials. Any
                        activities occurring under a user&lsquo;s account are
                        the sole responsibility of the account holder. Users
                        must notify the website administrators immediately of
                        any unauthorized account access.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Content Usage and Restrictions</strong>
                      </p>
                      <p>
                        The website and its original content are protected by
                        intellectual property laws. Users may not reproduce,
                        distribute, modify, create derivative works, or
                        commercially exploit any content without explicit
                        written permission from the website owners.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Limitation of Liability</strong>
                      </p>
                      <p>
                        The website provides content &ldquo;as is&ldquo; without
                        any warranties. The website owners shall not be liable
                        for direct, indirect, incidental, consequential, or
                        punitive damages arising from user interactions with the
                        platform.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>User Conduct Guidelines</strong>
                      </p>
                      <ul className="list-disc pl-6">
                        <li>Not upload harmful or malicious content</li>
                        <li>Respect the rights of other users</li>
                        <li>
                          Avoid activities that could disrupt website
                          functionality
                        </li>
                        <li>
                          Comply with applicable local and international laws
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Modifications to Terms</strong>
                      </p>
                      <p>
                        The website reserves the right to modify these terms at
                        any time. Continued use of the website after changes
                        constitutes acceptance of the new terms.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Termination Clause</strong>
                      </p>
                      <p>
                        The website may terminate or suspend user access without
                        prior notice for violations of these terms or for any
                        other reason deemed appropriate by the administration.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Governing Law</strong>
                      </p>
                      <p>
                        These terms are governed by the laws of the jurisdiction
                        where the website is primarily operated, without regard
                        to conflict of law principles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="border-t border-zinc-200/60 dark:border-zinc-800/60 px-4 sm:px-6 py-4 sm:items-center gap-2">
          {!hasReadToBottom && (
            <span className="text-muted-foreground grow text-xs max-sm:text-center">
              Read all terms before accepting.
            </span>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline" className="bg-slate-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" disabled={!hasReadToBottom} className="bg-blue-600 dark:bg-zinc-600 text-white dark:text-zinc-100 hover:bg-blue-700 dark:hover:bg-zinc-500 disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:text-slate-500 dark:disabled:text-zinc-400">
              I agree
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
