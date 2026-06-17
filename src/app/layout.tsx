import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReadyToFly — Préparez votre voyage sereinement",
  description: "L'application qui vous aide à préparer votre départ en toute sérénité. Checklist, documents, rappels — tout en un.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReadyToFly",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full antialiased">
        <div className="app-backdrop">
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen">
              {children}
            </div>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
