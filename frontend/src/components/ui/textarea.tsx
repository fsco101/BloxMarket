import * as React from "react";

import { cn } from "./utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all flex min-h-[60px] w-full rounded-xl border px-4 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
