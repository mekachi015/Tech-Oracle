import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MUIProvider from '@/app/theme-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Oracle",
  description: "Dedicated AI Assistant for Me as a Technician",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MUIProvider>{children}</MUIProvider>
      </body>
    </html>
  );
}
