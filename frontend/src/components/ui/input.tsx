import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground border-input flex w-full min-w-0 rounded-lg border bg-background shadow-sm transition-spring outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:opacity-50 form-control focus-ring hover-lift relative group",
  {
    variants: {
      size: {
        xs: "h-7 px-2 py-1 text-xs file:h-5 file:text-xs rounded-md",
        sm: "h-8 px-2.5 py-1.5 text-sm file:h-6 file:text-xs rounded-md",
        default: "h-10 px-3 py-2 text-sm file:h-7 file:text-sm rounded-lg",
        lg: "h-12 px-4 py-3 text-base file:h-8 file:text-sm rounded-lg",
        xl: "h-14 px-5 py-4 text-lg file:h-10 file:text-base rounded-xl",
      },
      variant: {
        default: "bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all",
        filled: "bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus-visible:border-violet-500 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)]",
        ghost: "bg-transparent border-transparent hover:bg-muted/30 focus:bg-background/50 focus-visible:border-violet-500 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)]",
        flushed: "bg-transparent border-0 border-b-2 border-border rounded-none px-0 focus:border-b-violet-500 focus:shadow-none hover:border-b-border/70 transition-colors",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground placeholder:text-white/70 focus:bg-white/20 focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.2)]",
        neon: "bg-transparent border-2 border-primary/50 focus-visible:border-primary focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:border-primary/70 animate-pulse-subtle",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ 
  className, 
  type, 
  size, 
  variant,
  ...props 
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, variant, className }))}
      {...props}
    />
  );
}

export { Input };
