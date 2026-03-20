import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import PostHogProvider from "@/components/providers/PostHogProvider";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import BugReport from "@/components/BugReport";

export const metadata: Metadata = {
  title: {
    default: "King of Good Times | sandnco.lol",
    template: "%s | King of Good Times",
  },
  description: "Post anonymous rumors. Bust myths. Win challenges. Rule the city.",
  keywords: ["rumors", "challenges", "anonymous", "urban legends", "city culture"],
  openGraph: {
    title: "King of Good Times",
    description: "Post anonymous rumors. Bust myths. Win challenges. Rule the city.",
    url: "https://sandnco.lol",
    siteName: "sandnco.lol",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "King of Good Times",
    description: "Post anonymous rumors. Bust myths. Win challenges.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SupabaseProvider>
          <PostHogProvider>
            {children}
            <BugReport />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#0C0C0C',
                  color: '#FF2D55',
                  border: '1px solid rgba(255,45,85,0.2)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase' as const,
                },
                success: { iconTheme: { primary: '#00FF87', secondary: '#0C0C0C' } },
                error: { iconTheme: { primary: '#FF3B3B', secondary: '#0C0C0C' } },
              }}
            />
          </PostHogProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
