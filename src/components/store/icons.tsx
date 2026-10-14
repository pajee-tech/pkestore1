import {
  Watch, Smartphone, CookingPot, Sparkles, Gem, Briefcase, Dumbbell, Puzzle, Car, Lightbulb, Tag, Truck, ShieldCheck,
  RotateCcw, Headphones, BadgeCheck, Wallet, Package, Star, Gift, Zap, Heart, type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Watch, Smartphone, CookingPot, Sparkles, Gem, Briefcase, Dumbbell, Puzzle, Car, Lightbulb, Tag, Truck, ShieldCheck,
  RotateCcw, Headphones, BadgeCheck, Wallet, Package, Star, Gift, Zap, Heart,
};
export const ICON_NAMES = Object.keys(ICONS);

export function DynIcon({ name, className }: { name?: string | null; className?: string }) {
  const I = (name && ICONS[name]) || Tag;
  return <I className={className} aria-hidden />;
}
