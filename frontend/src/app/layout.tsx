import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Use the variable font for better rendering + expose a CSS var
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sports Arena Booking System",
  description: "University sports facility booking system",
  applicationName: "Asian Tiger Arena",
  keywords: ["sports", "booking", "university", "facilities", "futsal", "badminton", "arena"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Asian Tiger | Sports Arena Booking System",
    description: "Book elite university sports facilities with a premium experience.",
    url: "https://asiantiger.vercel.app",
    siteName: "Asian Tiger Arena",
    images: [
      {
        url: "/tiger.svg", // optional if you add a static OG image
        width: 1200,
        height: 630,
        alt: "Asian Tiger Arena",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asian Tiger | Sports Arena Booking System",
    description: "Book elite university sports facilities with a premium experience.",
    images: ["/og-tiger.jpg"], // optional
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#f97316",
  metadataBase: new URL("https://asiatiger.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={[
          inter.variable,
          "antialiased text-slate-800 bg-slate-50 min-h-screen",
          // base font family via CSS var
          "font-sans",
        ].join(" ")}
      >
        {/* Background: premium gradient with soft “orbs” */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
          {/* Base gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-orange-50/40 to-red-50/40" />
          {/* Orbs layer 1 */}
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-orange-400/20 to-red-400/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-8%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />
          {/* Geometric accents */}
          <div className="absolute top-24 right-24 w-24 h-24 border border-orange-300/40 rotate-12 rounded-2xl" />
          <div className="absolute bottom-24 left-20 w-16 h-16 border border-red-300/40 -rotate-6 rounded-xl" />
        </div>

        {/* Skip to content for accessibility */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only fixed top-4 left-4 z-50 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-slate-200"
        >
          Skip to content
        </a>

        <AuthProvider>
          {/* Page wrapper with subtle max width & breathing room */}
          <div className="relative">
            <main id="content" className="min-h-[calc(100vh-160px)]">{children}</main>

            {/* Premium Footer */}
            <footer className="w-full">
              <div className="relative overflow-hidden">
                {/* Footer background */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-orange-100/60" />
                {/* Light conic shimmer */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    maskImage:
                      "radial-gradient(60% 60% at 50% 0%, rgba(0,0,0,1) 0%, transparent 70%)",
                  }}
                >
                  <div className="absolute right-[-10%] top-[-40%] h-[40rem] w-[40rem] rounded-full bg-gradient-conic from-orange-200 via-amber-200 to-red-200 blur-3xl" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Brand mark */}
                    <div className="flex items-center gap-4">
                        <div className="text-center leading-none">
                          <img src="/tiger.svg" alt="Asian Tiger Arena Logo" className="w-14 h-14" />
                        </div>
                      <div>
                        <p className="text-sm font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                          ASIAN TIGER ARENA
                        </p>
                        <p className="text-xs text-slate-500">
                          Elite Sports Facility Booking
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold text-orange-600">Location:</span>{" "}
                      University Sports Arena, 123 Main St, Yangon, Myanmar
                    </div>

                    {/* Contact */}
                    <div className="text-sm text-slate-700 md:text-right">
                      <span className="font-semibold text-orange-600">Contact:</span>{" "}
                      <a
                        href="mailto:info@asiantigerarena.com"
                        className="underline underline-offset-4 decoration-orange-300 hover:text-orange-700"
                      >
                        info@asiantigerarena.com
                      </a>{" "}
                      |{" "}
                      <a
                        href="tel:+959123456789"
                        className="underline underline-offset-4 decoration-orange-300 hover:text-orange-700"
                      >
                        +95 9 123 456 789
                      </a>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

                  {/* Bottom row */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>
                      © {year} Asian Tiger Arena. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                      <a href="#" className="hover:text-slate-700">
                        Terms
                      </a>
                      <span className="opacity-30">•</span>
                      <a href="#" className="hover:text-slate-700">
                        Privacy
                      </a>
                      <span className="opacity-30">•</span>
                      <a href="#" className="hover:text-slate-700">
                        Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
