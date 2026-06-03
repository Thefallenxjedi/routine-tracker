import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSplash } from "@/components/layout/app-splash";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://routine-tracker-tawny.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Routine — Activity Tracker",
  description:
    "Track daily activities and habits with yes/no or numeric metrics.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/logo.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "Routine — Activity Tracker",
    description:
      "Track daily activities and habits with yes/no or numeric metrics.",
    url: siteUrl,
    siteName: "Routine",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Routine logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Routine — Activity Tracker",
    description:
      "Track daily activities and habits with yes/no or numeric metrics.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppSplash />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
