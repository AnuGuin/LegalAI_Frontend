"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, Loader2 } from "lucide-react";
import * as React from "react";

interface ArchiveMatterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  matterTitle?: string;
}

export function ArchiveMatterDialog({
  open,
  onOpenChange,
  onConfirm,
  matterTitle,
}: ArchiveMatterDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[calc(100%-2rem)] sm:max-w-[425px] p-5 sm:p-6 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.1)] dark:shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-popover"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-600/20">
              <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Archive Matter
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-left pt-2">
            Are you sure you want to archive {matterTitle ? <strong className="text-foreground">"{matterTitle}"</strong> : "this matter"}?
            <span className="block mt-2 text-muted-foreground/80">
              This matter will be hidden from your active dashboard workspace. You can view, search, and restore archived matters at any time from your settings modal.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground px-6"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white border-0 px-6 flex items-center gap-1.5"
            disabled={loading}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
