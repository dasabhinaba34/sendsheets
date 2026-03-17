import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Sendsheets — Personalized emails from Google Sheets",
  description:
    "Turn any Google Sheet into a personalized email campaign. Write templates with @column variables and send via your own Gmail — free to use.",
  openGraph: {
    title: "Sendsheets — Personalized emails from Google Sheets",
    description:
      "Turn any Google Sheet into a personalized email campaign. Write templates with @column variables and send via your own Gmail.",
    type: "website",
    siteName: "Sendsheets",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sendsheets — Personalized emails from Google Sheets",
    description:
      "Turn any Google Sheet into a personalized email campaign. Write templates with @column variables and send via your own Gmail.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
