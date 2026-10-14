"use client";

import { useActionState } from "react";
import { subscribeAction } from "@/app/(store)/actions";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribeAction, null);
  return (
    <form action={action} className="mt-4">
      <div className={`flex rounded-full p-1 ${dark ? "bg-white/10" : "border border-line bg-white"}`}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          aria-label="Email address"
          className={`h-10 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none ${dark ? "text-white placeholder:text-white/50" : "placeholder:text-muted/70"}`}
        />
        <button disabled={pending} className="btn-accent h-10 shrink-0 px-5">
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {state?.message && <p className={`mt-2 text-sm ${state.ok ? (dark ? "text-saffron-400" : "text-brand-700") : "text-sale"}`}>{state.message}</p>}
    </form>
  );
}
