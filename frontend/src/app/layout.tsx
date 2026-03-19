import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/lib/providers';

export const metadata: Metadata = {
  title: 'Sadar Bazar - Shop the Best Deals',
  description: 'Your one-stop shop for the best products at unbeatable prices. Fast delivery across Pakistan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
