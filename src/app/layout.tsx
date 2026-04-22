import { Navbar } from "@/components/landing/Navbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { getSiteUrl } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "G-NNZX850SJS";
const ENABLE_GA =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_ENABLE_GA === "1";

const siteUrl = getSiteUrl();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const titleDefault =
  "Tractionflo — Get your first users without cold outreach";
const description =
  "For founders who built something but need traction: find people already looking for tools like yours, review suggested messages, and approve before anything sends. Early access.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: titleDefault,
    template: "%s | Tractionflo",
  },
  description,
  applicationName: "Tractionflo",
  keywords: [
    "Tractionflo",
    "first users",
    "founder distribution",
    "early-stage SaaS",
    "early users",
    "founder traction",
    "waitlist",
  ],
  authors: [{ name: "Tractionflo" }],
  creator: "Tractionflo",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Tractionflo",
    title: titleDefault,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: titleDefault,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Tractionflo",
      description,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Tractionflo",
      url: siteUrl,
    },
    {
      "@type": "SoftwareApplication",
      name: "Tractionflo",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Early access waitlist",
      },
      description,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full min-w-0 overflow-x-clip bg-white text-[#0A0A0A]">
        {ENABLE_GA && GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
            </Script>
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
