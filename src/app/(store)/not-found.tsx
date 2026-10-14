import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">Ye page nahi mila</h1>
      <p className="mt-2 max-w-md text-muted">Link purana ho sakta hai ya product hata diya gaya ho. Search karein ya shop browse karein.</p>
      <div className="mt-6 flex gap-3"><Link href="/" className="btn-primary">Go to homepage</Link><Link href="/shop" className="btn-outline">Browse shop</Link></div>
    </div>
  );
}
