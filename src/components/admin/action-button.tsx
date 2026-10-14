"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import { Toast } from "./admin-form";

export function ActionButton({ action, id, title, children, className, extra }: { action: (s: ActionState, fd: FormData) => Promise<ActionState>; id: number | string; title: string; children: React.ReactNode; className?: string; extra?: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button disabled={pending} title={title} aria-label={title} className={className || "grid size-8 place-items-center rounded-lg hover:bg-black/5"}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : children}
      </button>
      <Toast state={state} />
    </form>
  );
}
