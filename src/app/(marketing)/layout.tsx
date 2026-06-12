import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://routine-tracker-tawny.vercel.app";

export const metadata: Metadata = {
  title: "Routine — Simple Daily Tracking",
  description:
    "Track habits, learning, health, work, and personal goals from one simple dashboard. Stay consistent without complicated systems.",
  openGraph: {
    title: "Routine — Simple Daily Tracking",
    description:
      "Track habits, learning, health, work, and personal goals from one simple dashboard.",
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
    title: "Routine — Simple Daily Tracking",
    description:
      "Track habits, learning, health, work, and personal goals from one simple dashboard.",
    images: ["/logo.png"],
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-smooth bg-white text-stone-900">{children}</div>
  );
}
