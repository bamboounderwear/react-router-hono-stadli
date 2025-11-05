import { forwardRef } from "react";

import { cn } from "../../lib/utils";

const variantStyles = {
        default:
                "inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
        outline:
                "inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
        ghost:
                "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
} satisfies Record<string, string>;

const sizeStyles = {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
} satisfies Record<string, string>;

type Variant = keyof typeof variantStyles;
type Size = keyof typeof sizeStyles;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
        variant?: Variant;
        size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
        ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
                return (
                        <button
                                ref={ref}
                                type={type}
                                className={cn(variantStyles[variant], sizeStyles[size], className)}
                                {...props}
                        />
                );
        },
);

Button.displayName = "Button";
