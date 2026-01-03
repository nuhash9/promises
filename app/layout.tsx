import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Promises',
  description: 'Keep your word, grow your trust',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900">
        <Header />
        <main className="max-w-screen-md mx-auto px-6 py-12">
          {children}
        </main>
        <footer className="border-t border-stone-200 mt-20 py-10 text-center text-xs text-stone-500 uppercase tracking-widest">
          <p>Promises &bull; Integrity Protocol</p>
        </footer>
      </body>
    </html>
  );
}
