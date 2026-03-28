import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function RecentChatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center rounded-lg px-3 py-2 gap-3">
          <Skeleton className="h-4 w-4 rounded bg-sidebar-accent" />
          <Skeleton className="h-3 flex-1 rounded bg-sidebar-accent" />
        </div>
      ))}
    </div>
  );
}
