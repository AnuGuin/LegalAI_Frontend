import { Skeleton } from "../ui/skeleton";

export function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-start gap-3 justify-end">
        <div className="w-full max-w-[300px] flex items-center gap-3 flex-row-reverse">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-4/5 rounded-lg ml-auto bg-muted" />
            <Skeleton className="h-3 w-3/5 rounded-lg ml-auto bg-muted" />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-full max-w-[900px] flex items-center gap-3">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded-lg bg-muted" />
            <Skeleton className="h-3 w-4/5 rounded-lg bg-muted" />
            <Skeleton className="h-3 w-3/5 rounded-lg bg-muted" />
            <Skeleton className="h-3 w-4/5 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
