import { cn } from "../../lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
        return (
                <div
                        className={cn(
                                "rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20",
                                className,
                        )}
                        {...props}
                />
        );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
        return <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
        return <h3 className={cn("text-lg font-semibold text-white", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
        return <p className={cn("text-sm text-slate-300", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
        return <div className={cn("text-sm text-slate-200", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
        return <div className={cn("mt-4 flex items-center justify-between", className)} {...props} />;
}
