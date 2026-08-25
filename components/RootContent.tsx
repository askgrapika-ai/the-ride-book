// components/RootContent.tsx
// Conditionally renders Navbar + Footer only on non-admin pages
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function RootContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px', minHeight: 'calc(100vh - 72px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
