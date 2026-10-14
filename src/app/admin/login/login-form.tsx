"use client";

import { useActionState } from "react";
import { loginAction } from "../auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
      {state && !state.ok && <p role="alert" className="rounded-xl bg-sale/10 px-3 py-2 text-sm font-medium text-sale">{state.message}</p>}
      <button disabled={pending} className="btn-primary h-11 w-full">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
