'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import styles from './AdminLayout.module.css';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/feedback', label: 'Feedback', icon: '⭐' },
  { href: '/admin/inventory', label: 'Inventory', icon: '📚' },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({ email: u.email });
      } else {
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/admin/login');
  };

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--color-text-muted)' }}>
        Loading...
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>THE RIDE</div>
          <div className={styles.sidebarSub}>Admin Panel</div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminEmail}>{user.email}</div>
          <button className={`btn btn-ghost btn-sm ${styles.signOutBtn}`} onClick={handleSignOut} id="admin-signout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            ☰
          </button>
          <span className={styles.mobileTitle}>THE RIDE Admin</span>
        </div>

        {children}
      </main>

      {/* Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
