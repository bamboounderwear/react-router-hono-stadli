import { forwardRef } from "react";

import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
        return (
                <input
                        ref={ref}
                        type={type}
                        className={cn(
                                "flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50",
                                className,
                        )}
                        {...props}
                />
        );
});

Input.displayName = "Input";
