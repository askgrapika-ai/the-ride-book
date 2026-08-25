import AdminLayoutClient from '@/components/AdminLayout/AdminLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin – The Ride',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
