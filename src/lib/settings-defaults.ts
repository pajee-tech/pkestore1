export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  businessHours: string;
  announcement: string;
  announcementActive: boolean;
  currency: string;
  shippingFee: number;
  freeShippingOver: number;
  deliveryTime: string;
  codEnabled: boolean;
  bankEnabled: boolean;
  bankDetails: string;
  jazzcashEnabled: boolean;
  jazzcashNumber: string;
  jazzcashName: string;
  easypaisaEnabled: boolean;
  easypaisaNumber: string;
  easypaisaName: string;
  social: { facebook: string; instagram: string; tiktok: string; youtube: string };
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  footerAbout: string;
  primaryColor: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "PKeStore",
  tagline: "Pakistan ka Smart Online Store",
  logoUrl: "",
  faviconUrl: "",
  phone: "0330 6540540",
  whatsapp: "923306540540",
  email: "pkestore@gmail.com",
  address: "Chungi Amar Sidhu, Lahore",
  businessHours: "Mon–Sat, 10am – 8pm",
  announcement: "Free delivery on orders above Rs 3,000. Cash on Delivery all over Pakistan.",
  announcementActive: true,
  currency: "PKR",
  shippingFee: 250,
  freeShippingOver: 3000,
  deliveryTime: "3–5 working days",
  codEnabled: true,
  bankEnabled: true,
  bankDetails: "Bank: Meezan Bank\nAccount Title: PKeStore\nAccount #: 0000-0000000000\nIBAN: PK00MEZN0000000000000000",
  jazzcashEnabled: true,
  jazzcashNumber: "0300-0000000",
  jazzcashName: "PKeStore",
  easypaisaEnabled: true,
  easypaisaNumber: "0345-0000000",
  easypaisaName: "PKeStore",
  social: { facebook: "https://facebook.com/", instagram: "https://instagram.com/", tiktok: "https://tiktok.com/", youtube: "" },
  seoTitle: "PKeStore – Online Shopping in Pakistan | Cash on Delivery",
  seoDescription:
    "Smart gadgets, home & kitchen, beauty, watches, bags, fitness, toys, car accessories aur lights — best prices aur Cash on Delivery poore Pakistan mein.",
  ogImage: "/seed/og-image.webp",
  googleAnalyticsId: "",
  metaPixelId: "",
  footerAbout:
    "PKeStore Pakistan ka trusted online store hai jahan aap ko quality products, munasib qeemat aur Cash on Delivery ki sahulat milti hai.",
  primaryColor: "#0f766e",
};
