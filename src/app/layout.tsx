import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import Navbar from "@/components/navbar/Navbar";
import { ReactQueryProvider } from "@/util/providers/ReactQueryProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeskHub",
  description: "A simple office layout application",
  icons: {
    icon: "/favicon2.svg",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ReactQueryProvider>
            <Navbar />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
