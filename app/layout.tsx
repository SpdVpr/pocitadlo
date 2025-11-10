import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import GlobalTimer from "@/components/GlobalTimer";
import { AuthProvider } from "@/lib/authContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://evidujcas.cz'),
  title: {
    default: "EvidujCas.cz - Sledování odpracovaných hodin | Evidence pracovní doby",
    template: "%s | EvidujCas.cz"
  },
  description: "Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním. Sledujte odpracované hodiny, spravujte projekty a generujte faktury. Zdarma a bezpečně.",
  keywords: [
    "evidence pracovní doby",
    "sledování času",
    "časovač",
    "time tracking",
    "evidence hodin",
    "odpracované hodiny",
    "správa projektů",
    "fakturace",
    "hodinová sazba",
    "šifrování dat",
    "GDPR",
    "česká aplikace",
    "zdarma",
    "online evidence času"
  ],
  authors: [{ name: "EvidujCas.cz" }],
  creator: "EvidujCas.cz",
  publisher: "EvidujCas.cz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://evidujcas.cz",
    siteName: "EvidujCas.cz",
    title: "EvidujCas.cz - Sledování odpracovaných hodin",
    description: "Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním. Sledujte odpracované hodiny, spravujte projekty a generujte faktury.",
    images: [
      {
        url: "/front-image.png",
        width: 1200,
        height: 630,
        alt: "EvidujCas.cz - Ukázka aplikace pro evidenci pracovní doby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EvidujCas.cz - Sledování odpracovaných hodin",
    description: "Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním. Zdarma a bezpečně.",
    images: ["/front-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Přidejte své verifikační kódy po registraci v Google Search Console
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: "https://evidujcas.cz",
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AuthProvider>
          <Navigation />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <GlobalTimer />
        </AuthProvider>
      </body>
    </html>
  );
}
