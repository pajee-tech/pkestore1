import Script from "next/script";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartProvider } from "@/components/store/cart-context";
import { CartDrawer } from "@/components/store/cart-drawer";
import { WhatsAppFloat } from "@/components/store/whatsapp-float";
import { getSettings } from "@/lib/data";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const ga = /^G-[A-Z0-9]+$/.test(s.googleAnalyticsId) ? s.googleAnalyticsId : "";
  const pixel = /^\d{6,20}$/.test(s.metaPixelId) ? s.metaPixelId : "";
  return (
    <CartProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Header />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer freeShippingOver={s.freeShippingOver} shippingFee={s.shippingFee} />
      <WhatsAppFloat number={s.whatsapp} />
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      )}
      {pixel && (
        <Script id="fb-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}</Script>
      )}
    </CartProvider>
  );
}
