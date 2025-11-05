import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "outline";

const badgeStyles: Record<BadgeVariant, string> = {
        default: "inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-200",
        success: "inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-200",
        warning: "inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-200",
        outline:
                "inline-flex items-center rounded-full border border-slate-600 px-2.5 py-0.5 text-xs font-medium text-slate-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
        variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
        return <span className={cn(badgeStyles[variant], className)} {...props} />;
}
