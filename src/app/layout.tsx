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

export const metadata: Metadata = {
  title: "Routine — Activity Tracker",
  description: "Track daily activities and habits with simple yes/no completion",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
