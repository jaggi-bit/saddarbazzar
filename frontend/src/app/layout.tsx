import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Providers from "@/lib/providers";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

// Configure Plus Jakarta Sans for a premium, geometric typographic feel
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta', // Exposes the CSS variable for globals.css
});

export const metadata: Metadata = {
  title: "Sadar Bazar - Localized E-Commerce",
  description: "Your modern, fast, and secure online shopping destination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
