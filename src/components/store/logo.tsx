import Link from "next/link";
import Image from "next/image";
import { PkMark } from "@/components/brand/pk-mark";

export function Logo({ name, logoUrl, light = false }: { name: string; logoUrl?: string; light?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${name} home`}>
      {logoUrl ? (
        <Image src={logoUrl} alt={name} width={160} height={44} className="h-9 w-auto sm:h-10" priority />
      ) : (
        <>
          <PkMark className="size-9 shrink-0 sm:size-10" />
          <span className={`font-display text-xl font-extrabold tracking-tight sm:text-[22px] ${light ? "text-white" : "text-ink"}`}>
            {name.replace(/store$/i, "")}
            <span className={light ? "text-saffron-400" : "text-brand-700"}>{/store$/i.test(name) ? name.slice(-5) : ""}</span>
          </span>
        </>
      )}
    </Link>
  );
}
