import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PG Rent Manager — Production Desktop Application',
  description: 'Simple, reliable, extremely easy-to-use PG rental management application for PG owners and managers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
