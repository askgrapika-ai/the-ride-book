import type { Metadata } from 'next';
import './globals.css';
import RootContent from '@/components/RootContent';

export const metadata: Metadata = {
  title: {
    default: 'The Ride – Official Book by Pavan Akondi',
    template: '%s | The Ride',
  },
  description:
    'Order the official edition of The Ride by Pavan Akondi online. Eight journeys, hundreds of people, countless moments. A story of purpose, faith, and brotherhood on the roads of India.',
  keywords: ['The Ride', 'Pavan Akondi', 'Telugu book', 'motorcycle journey', 'Eswari Publications', 'book order'],
  authors: [{ name: 'Pavan Akondi' }],
  creator: 'Pavan Akondi',
  publisher: 'Eswari Publications',
  openGraph: {
    title: 'The Ride – Official Book by Pavan Akondi',
    description:
      'Eight journeys. Hundreds of people. Countless moments. Order The Ride online — a story of purpose, faith, and brotherhood.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'The Ride',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Ride – Official Book by Pavan Akondi',
    description: 'Eight journeys. Hundreds of people. Countless moments. Order online today.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#080808" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <RootContent>{children}</RootContent>
      </body>
    </html>
  );
}
