'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/#about', label: 'About' },
    { href: '/#book', label: 'The Book' },
    { href: '/#launch', label: 'Launch' },
    { href: '/#reviews', label: 'Reviews' },
    { href: '/track', label: 'Track Order' },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>THE RIDE</span>
          <span className={styles.logoSub}>by Pavan Akondi</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA + Hamburger */}
        <div className={styles.navRight}>
          <Link href="/order" className={`btn btn-primary ${styles.ctaBtn}`} id="nav-order-btn">
            Order the Book
          </Link>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`${styles.bar} ${menuOpen ? styles.bar1Open : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.bar2Open : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.bar3Open : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.mobileNavLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/order"
            className={`btn btn-primary ${styles.mobileCta}`}
            onClick={() => setMenuOpen(false)}
            id="mobile-order-btn"
          >
            Order the Book
          </Link>
        </nav>
      </div>
    </header>
  );
}
