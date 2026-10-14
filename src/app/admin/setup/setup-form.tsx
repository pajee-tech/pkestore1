"use client";

import { useActionState } from "react";
import { setupAction } from "../auth-actions";

export function SetupForm() {
  const [state, action, pending] = useActionState(setupAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="setupKey" className="label">Setup key</label>
        <input id="setupKey" name="setupKey" type="password" required className="input" />
        <p className="mt-1 text-xs text-muted">Ye wohi SETUP_KEY hai jo aap ne Vercel / Hostinger environment variables mein rakhi.</p>
      </div>
      <div><label htmlFor="name" className="label">Full name</label><input id="name" name="name" required className="input" /></div>
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="new-password" className="input" />
        <p className="mt-1 text-xs text-muted">Kam az kam 10 characters, bare aur chhote letters aur ek number.</p>
      </div>
      <div><label htmlFor="confirm" className="label">Confirm password</label><input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="input" /></div>
      {state && !state.ok && <p role="alert" className="rounded-xl bg-sale/10 px-3 py-2 text-sm font-medium text-sale">{state.message}</p>}
      <button disabled={pending} className="btn-primary h-11 w-full">{pending ? "Creating…" : "Create Master Admin"}</button>
    </form>
  );
}
