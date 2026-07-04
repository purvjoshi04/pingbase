import type { Metadata } from "next";
import "./globals.css"
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { PageLoader } from "@/components/page-loader";

export const metadata: Metadata = {
  title: "Pingbase",
  description: "Monitor uptime, ship beautiful status pages, and get instant incident alerts. Pingbase is the developer-first observability platform.",
  authors: [{ name: "Pingbase" }],
  openGraph: {
    title: "Pingbase — Uptime monitoring built for builders",
    description: "Monitor every endpoint, ship beautiful status pages, and resolve incidents before users notice.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Pingbase",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PageLoader />
        <Providers>{children}</Providers>
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}