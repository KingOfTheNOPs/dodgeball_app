import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export function AlertDialogContent({ children, ...props }: AlertDialogPrimitive.AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
      <AlertDialogPrimitive.Content
        className="fixed left-1/2 top-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow"
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
}

export const AlertDialogHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`space-y-2 ${className}`} {...props} />
);

export const AlertDialogFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-4 flex justify-end gap-2 ${className}`} {...props} />
);

export const AlertDialogTitle = (props: AlertDialogPrimitive.AlertDialogTitleProps) => (
  <AlertDialogPrimitive.Title className="text-lg font-semibold" {...props} />
);

export const AlertDialogDescription = (props: AlertDialogPrimitive.AlertDialogDescriptionProps) => (
  <AlertDialogPrimitive.Description className="text-sm text-slate-600" {...props} />
);

export const AlertDialogAction = (props: AlertDialogPrimitive.AlertDialogActionProps) => (
  <AlertDialogPrimitive.Action
    className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
    {...props}
  />
);

export const AlertDialogCancel = (props: AlertDialogPrimitive.AlertDialogCancelProps) => (
  <AlertDialogPrimitive.Cancel className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50" {...props} />
);
