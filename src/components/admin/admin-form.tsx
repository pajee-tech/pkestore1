"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/action-state";

export function SubmitButton({ children, className = "btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="size-4 animate-spin" />} {children}
    </button>
  );
}

export function Toast({ state }: { state: ActionState }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!state) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), state.ok ? 3500 : 7000);
    return () => clearTimeout(t);
  }, [state]);
  if (!state || !show) return null;
  return (
    <div role="status" className={`fixed bottom-5 right-5 z-[80] flex max-w-sm items-start gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-xl ${state.ok ? "bg-brand-700" : "bg-sale"}`}>
      {state.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
      {state.message}
    </div>
  );
}

export function AdminForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <Toast state={state} />
    </form>
  );
}
