import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactQueryProvider } from "./util/providers/ReactQueryProvider";
import { FillterProvider } from "./util/providers/SelectedProjectsEmployeesContext";
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
  title: "Office Layout",
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
        <FillterProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </FillterProvider>
      </body>
    </html>
  );
}
