import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { StoreProvider } from "@/components/providers";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Clozet | Choose the Print. We Shape the Style.",
  description: "Print-first fashion commerce for design-led wardrobes."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans text-cocoa antialiased" suppressHydrationWarning>
        <Script id="strip-fdprocessedid" strategy="beforeInteractive">
          {`
            (function () {
              var strip = function () {
                var nodes = document.querySelectorAll('[fdprocessedid]');
                for (var i = 0; i < nodes.length; i += 1) {
                  nodes[i].removeAttribute('fdprocessedid');
                }
              };

              strip();

              var observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i += 1) {
                  if (mutations[i].type === 'attributes' && mutations[i].attributeName === 'fdprocessedid') {
                    var target = mutations[i].target;
                    if (target && target.removeAttribute) {
                      target.removeAttribute('fdprocessedid');
                    }
                  }
                }
              });

              observer.observe(document.documentElement, {
                attributes: true,
                subtree: true,
                attributeFilter: ['fdprocessedid']
              });

              setTimeout(function () {
                observer.disconnect();
              }, 4000);
            })();
          `}
        </Script>
        <StoreProvider>
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
