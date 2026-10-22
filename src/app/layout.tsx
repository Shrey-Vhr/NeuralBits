import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: { default: "ScrapReady | Prepare. Value. Recycle.", template: "%s | ScrapReady" },
  description: "A simple way to prepare scrap, understand its value, and find local recycling partners.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
