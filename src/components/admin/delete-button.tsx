"use client";

import { useActionState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import { Toast } from "./admin-form";

export function DeleteButton({
  action,
  id,
  confirmText = "Kya aap waqai delete karna chahte hain? Ye wapis nahi hoga.",
  label,
  className,
  redirectTo,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  id: number | string;
  confirmText?: string;
  label?: string;
  className?: string;
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <button disabled={pending} className={className || "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-sale hover:bg-sale/10"} aria-label={label || "Delete"} title={label || "Delete"}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        {label && <span>{label}</span>}
      </button>
      <Toast state={state} />
    </form>
  );
}
