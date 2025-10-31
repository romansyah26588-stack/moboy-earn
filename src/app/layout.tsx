import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <-- PERBAIKAN 1: Import dari sonner

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PERBAIKAN 2: Metadata diperbarui untuk proyek Moboy
export const metadata: Metadata = {
  title: "Moboy Post to Earn",
  description: "A futuristic web application that allows users to submit social media content and earn rewards based on views in the Solana ecosystem.",
  keywords: ["Moboy", "Solana", "Web3", "Next.js", "Post to Earn", "React"],
  authors: [{ name: "Moboy Team" }],
  icons: {
    // Ganti dengan logo Moboy jika ada, atau biarkan default
    icon: "/favicon.ico", 
  },
  openGraph: {
    title: "Moboy Post to Earn",
    description: "Earn rewards in the Solana ecosystem by submitting your social media content.",
    url: "https://moboy-post-to-earn.pages.dev", // Ganti dengan URL Anda nanti
    siteName: "Moboy Post to Earn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moboy Post to Earn",
    description: "Earn rewards in the Solana ecosystem by submitting your social media content.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}