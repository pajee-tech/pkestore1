import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <Link href="/" className="btn-primary mt-6">Go to homepage</Link>
    </div>
  );
}
