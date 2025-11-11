import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  title: "MoBoy - Posting About Momo Coin",
  description: "Web3 platform for posting and sharing Momo Coin content with Solana wallet integration",
  keywords: ["MoBoy", "Momo Coin", "Solana", "Web3", "Crypto", "Posting"],
  authors: [{ name: "MoBoy Team" }],
  icons: {
    icon: "https://raw.githubusercontent.com/romansyah26588-stack/moboy-earn/refs/heads/main/public/Moboy.png",
  },
  openGraph: {
    title: "MoBoy - Posting About Momo Coin",
    description: "Web3 platform for posting and sharing Momo Coin content",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoBoy - Posting About Momo Coin",
    description: "Web3 platform for posting and sharing Momo Coin content",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body
        className={`${GeistSans.className} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" />
      </body>
    </html>
  );
}