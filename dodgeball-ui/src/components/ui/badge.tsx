import * as React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";

  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-slate-800 text-white",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200",
    outline: "border border-slate-300 text-slate-800 bg-white",
    destructive: "bg-rose-600 text-white",
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}
