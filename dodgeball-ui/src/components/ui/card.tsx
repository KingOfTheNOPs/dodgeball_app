import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export const Card = React.forwardRef<HTMLDivElement, DivProps>(function Card(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(function CardHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("flex flex-col gap-1.5 p-4 pb-2", className)}
      {...props}
    />
  );
});

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref as any}
        className={cx("text-base font-semibold leading-none tracking-tight text-slate-800", className)}
        {...props}
      />
    );
  }
);

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(function CardContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cx("p-4 pt-2", className)} {...props} />;
});
