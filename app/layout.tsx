import { ClerkProvider } from '@clerk/nextjs';
import { Poppins } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import Provider from './provider';

const roboto = Poppins({ subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'Next.js Premium Startup Boilerplate',
  description:
    'Created using the ultimate interactive Next.js stack generator CLI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={roboto.className}>
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
