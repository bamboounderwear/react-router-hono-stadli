import { cn } from "../../lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
        return (
                <table
                        className={cn("w-full caption-bottom text-sm text-slate-200", className)}
                        {...props}
                />
        );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
        return <thead className={cn("text-left text-xs uppercase text-slate-400", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
        return <tbody className={cn("divide-y divide-slate-800", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
        return <tr className={cn("transition hover:bg-slate-900/60", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
        return <th className={cn("pb-2 font-medium", className)} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
        return <td className={cn("py-3 align-middle", className)} {...props} />;
}

export function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
        return <caption className={cn("mt-4 text-sm text-slate-400", className)} {...props} />;
}
