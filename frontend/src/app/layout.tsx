import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ToastProvider } from "../components/Toast";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
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
            className={`${bebasNeue.variable} ${spaceGrotesk.variable} h-full antialiased`}
          >
            <body className="min-h-full flex flex-col">{children}</body>
          </html>
        </ToastProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
