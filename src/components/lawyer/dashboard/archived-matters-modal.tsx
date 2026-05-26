"use client";

import * as React from "react";
import { FolderOpen, Archive, Loader2, RefreshCw, X, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiService, type Matter } from "@/lib/api.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ArchivedMattersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ArchivedMattersModal({
  open,
  onOpenChange,
}: ArchivedMattersModalProps) {
  const [matters, setMatters] = React.useState<Matter[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [restoringId, setRestoringId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      loadArchivedMatters();
    }
  }, [open]);

  const loadArchivedMatters = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMatters();
      const archived = (data || []).filter((m) => m.status === "ARCHIVED");
      setMatters(archived);
    } catch (err) {
      console.error("Failed to load archived matters", err);
      toast.error("Failed to load archived matters");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (matterId: string) => {
    setRestoringId(matterId);
    try {
      await apiService.updateMatter(matterId, { status: "ACTIVE" });
      toast.success("Matter restored successfully");
      setMatters((prev) => prev.filter((m) => m.id !== matterId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore matter");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-auto sm:max-w-2xl p-4 sm:p-6 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-popover max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Archive className="w-5 h-5 text-muted-foreground" />
            Archived Matters
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Matters that you have archived. Restoring a matter will reactivate it in your workspace dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground mt-2">Loading archived matters...</p>
            </div>
          ) : matters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Scale className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No archived matters</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs px-4">
                You haven't archived any matters yet, or all archived matters have been restored.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matters.map((matter) => (
                <div
                  key={matter.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 border border-border/60 rounded-xl hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate block">
                        {matter.title}
                      </span>
                      {matter.caseNumber && (
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/65 px-1.5 py-0.5 rounded border border-border/60">
                          #{matter.caseNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Practice Area: <strong className="text-foreground/80">{matter.practiceArea || "—"}</strong></span>
                      <span>•</span>
                      <span>Created: <strong className="text-foreground/80">{new Date(matter.createdAt).toLocaleDateString("en-IN")}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(matter.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-xl transition-all cursor-pointer w-full sm:w-auto justify-center"
                    disabled={restoringId !== null}
                  >
                    {restoringId === matter.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FolderOpen className="w-3.5 h-3.5" />
                    )}
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
