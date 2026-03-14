import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import PostHogProvider from "@/components/providers/PostHogProvider";
import SupabaseProvider from "@/components/providers/SupabaseProvider";

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
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700;900&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SupabaseProvider>
          <PostHogProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#151515',
                  color: '#f4f4f5',
                  border: '1px solid rgba(251,191,36,0.2)',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                },
                success: { iconTheme: { primary: '#fbbf24', secondary: '#000' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </PostHogProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
