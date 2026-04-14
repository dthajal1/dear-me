import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileFrame } from "@/components/dear-me/mobile-frame";
import { AppBootstrap } from "@/lib/bootstrap/app-bootstrap";
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
  title: "dear-me",
  description: "A voice journal for you, from you.",
};

export const viewport: Viewport = {
  themeColor: "#EFF2E6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-body antialiased">
        <AppBootstrap />
        <MobileFrame>{children}</MobileFrame>
      </body>
    </html>
  );
}
