"use client";

import { useActionState } from "react";
import { contactAction } from "@/app/(store)/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, null);
  if (state?.ok) return <p className="rounded-2xl bg-brand-50 p-5 font-medium text-brand-800">{state.message}</p>;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div><label htmlFor="c-name" className="label">Name</label><input id="c-name" name="name" required className="input" /></div>
      <div><label htmlFor="c-phone" className="label">Mobile</label><input id="c-phone" name="phone" inputMode="tel" className="input" /></div>
      <div className="sm:col-span-2"><label htmlFor="c-email" className="label">Email</label><input id="c-email" name="email" type="email" className="input" /></div>
      <div className="sm:col-span-2"><label htmlFor="c-subject" className="label">Subject</label><input id="c-subject" name="subject" className="input" /></div>
      <div className="sm:col-span-2"><label htmlFor="c-msg" className="label">Message</label><textarea id="c-msg" name="message" required rows={5} className="input" /></div>
      {state && !state.ok && <p role="alert" className="text-sm font-medium text-sale sm:col-span-2">{state.message}</p>}
      <button disabled={pending} className="btn-primary h-12 sm:col-span-2 sm:w-fit sm:px-8">{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
