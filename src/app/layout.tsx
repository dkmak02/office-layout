import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactQueryProvider } from "./util/providers/ReactQueryProvider";
import { AppDataProvider } from "./util/providers/AppDataContext";
import "./globals.css";
import NavbarMenu from "./components/nav-bar-components/Menu";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
// import "./i18n";
// import { I18nextProvider } from "react-i18next";
// import i18n from "./i18n";
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
          <AppDataProvider>
            <ReactQueryProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <NavbarMenu />
                {children}
              </Suspense>
            </ReactQueryProvider>
          </AppDataProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
