import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ToastProvider } from "../components/Toast";
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
  title: "Salle de Sport - Gestion",
  description: "Application de gestion de salle de sport",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <ToastProvider>
          <html
            lang="fr"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
          >
            <body className="min-h-full flex flex-col">{children}</body>
          </html>
        </ToastProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
