import type { ReactNode } from "react";
import type { Metadata } from "next";
import { StoreProvider } from "@/components/providers";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Aakaar | Choose the Print. We Shape the Style.",
  description: "Print-first fashion commerce for design-led wardrobes."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans text-cocoa antialiased" suppressHydrationWarning>
        <StoreProvider>
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
