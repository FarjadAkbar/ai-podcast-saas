import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { ClerkProvider } from '@clerk/nextjs'

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body className="flex min-h-screen w-full flex-col">{children}</body>
      </ClerkProvider>
      <Analytics />
    </html>
  );
}
