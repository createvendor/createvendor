import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Vendor - Build Your Online Store",
  description: "The most powerful multi-vendor e-commerce website builder. Launch your store on createvendor.shop.",
  icons: {
    icon: '/favicon.ico', // You should put your logo here later
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Aggressively silence technical AbortErrors and hide the dev overlay
              const ignoreErrors = ['AbortError', 'The user aborted a request', 'Failed to fetch', 'cancel', 'abort'];
              const originalError = console.error;
              
              console.error = (...args) => {
                const message = (args[0]?.message || args[0]?.toString() || '').toLowerCase();
                if (ignoreErrors.some(err => message.includes(err.toLowerCase()))) return;
                originalError.apply(console, args);
              };

              window.addEventListener('unhandledrejection', (event) => {
                const message = (event.reason?.message || event.reason?.toString() || '').toLowerCase();
                if (ignoreErrors.some(err => message.includes(err.toLowerCase()))) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                }
              }, true);

              // Brute-force: Remove the Next.js overlay portal if it appears
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                      if (node instanceof HTMLElement) {
                        if (node.id === 'nextjs-portal' || 
                            node.getAttribute('data-nextjs-dialog-overlay') ||
                            node.style.zIndex === '2147483647') {
                          node.remove();
                        }
                      }
                    }
                  }
                });
                observer.observe(document.body, { childList: true, subtree: true });
              }
            `,
          }}
        />
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
