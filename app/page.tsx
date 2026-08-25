import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './Home.module.css';
import { BOOK, LAUNCH } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'The Ride – Official Book by Pavan Akondi',
  description:
    'Order the official edition of The Ride by Pavan Akondi. Eight motorcycle journeys across India — a story of purpose, faith, and brotherhood.',
};

export default function HomePage() {
  const rides = BOOK.rides;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className={styles.hero} id="home">
        <div className={styles.heroBg}>
          <div className={styles.heroGradient} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroLeft}>
            <div className={`label ${styles.heroLabel}`}>Official Book</div>
            <h1 className={`display-xl gradient-text ${styles.heroTitle}`}>
              THE RIDE
            </h1>
            <p className={`text-telugu ${styles.heroSubtitle}`}>
              {BOOK.subtitle}
            </p>
            <p className={styles.heroTagline}>{BOOK.tagline}</p>
            <p className={styles.heroDesc}>
              What began as a motorcycle journey has now become a journey in words.
              Every mile became a memory, every encounter became a story,
              every ride became a purpose.
            </p>
            <div className={styles.heroCta}>
              <Link href="/order" className="btn btn-primary btn-lg" id="hero-order-btn">
                Order the Book – ₹{BOOK.price}
              </Link>
              <a href="#about" className="btn btn-outline">
                Learn More
              </a>
            </div>
            <div className={styles.heroMeta}>
              <div className={styles.heroMetaItem}>
                <span className={styles.heroMetaValue}>{BOOK.pages}</span>
                <span className={styles.heroMetaLabel}>Pages</span>
              </div>
              <div className={styles.heroMetaDivider} />
              <div className={styles.heroMetaItem}>
                <span className={styles.heroMetaValue}>8</span>
                <span className={styles.heroMetaLabel}>Journeys</span>
              </div>
              <div className={styles.heroMetaDivider} />
              <div className={styles.heroMetaItem}>
                <span className={styles.heroMetaValue}>1</span>
                <span className={styles.heroMetaLabel}>Purpose</span>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={`animate-float ${styles.bookCoverWrapper}`}>
              <div className={styles.bookCoverPlaceholder}>
                <img src="/images/book%20cover.png" alt="The Ride Book Cover" style={{ width: '420px', height: '600px', borderRadius: '8px', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroScroll}>
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>Scroll to explore</span>
        </div>
      </section>

      {/* ── ABOUT THE BOOK ────────────────────────────────── */}
      <section className={`section ${styles.about}`} id="about">
        <div className="container">
          <div className="section-header">
            <div className="label">About the Book</div>
            <h2 className="display-md">More than a journey.<br />A story of life itself.</h2>
          </div>

          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              {BOOK.descriptionFull.split('\n\n').map((para, i) => (
                <p key={i} className={styles.aboutPara}>{para}</p>
              ))}
            </div>

            <div className={styles.ridesGrid}>
              <h3 className={styles.ridesTitle}>Eight Unforgettable Rides</h3>
              <div className={styles.ridesList}>
                {rides.map((ride, i) => (
                  <div key={i} className={styles.rideItem}>
                    <span className={styles.rideNumber}>0{i + 1}</span>
                    <span className={styles.rideName}>{ride}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOK INFORMATION ──────────────────────────────── */}
      <section className={`section ${styles.bookInfo}`} id="book">
        <div className="container">
          <div className={styles.bookInfoInner}>
            {/* Book Photo Placeholder */}
            <div className={styles.bookInfoImage}>
              <img src="/images/book%20.jpeg" alt="Book Pages Preview" style={{ width: '100%', aspectRatio: '3/4', borderRadius: '12px', objectFit: 'cover' }} />
            </div>

            {/* Book Details */}
            <div className={styles.bookDetails}>
              <div className="label">Book Information</div>
              <h2 className="display-md" style={{ marginBottom: '1.5rem' }}>The Ride</h2>

              <table className={styles.infoTable}>
                <tbody>
                  <tr>
                    <td className={styles.infoKey}>Author</td>
                    <td className={styles.infoVal}>{BOOK.author}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoKey}>Language</td>
                    <td className={styles.infoVal}>{BOOK.language}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoKey}>Pages</td>
                    <td className={styles.infoVal}>{BOOK.pages}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoKey}>Publisher</td>
                    <td className={styles.infoVal}>{BOOK.publisher}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoKey}>Edition</td>
                    <td className={styles.infoVal}>{BOOK.edition}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoKey}>Price</td>
                    <td className={styles.infoVal} style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1.25rem' }}>₹{BOOK.price}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoKey}>Delivery Charge</td>
                    <td className={styles.infoVal}>
                      {BOOK.deliveryCharge === 0 ? 'Free (based on location)' : `₹${BOOK.deliveryCharge} (Flat Rate India)`}
                    </td>
                  </tr>
                </tbody>
              </table>

              <Link href="/order" className="btn btn-primary btn-lg" id="bookinfo-order-btn" style={{ marginTop: '2rem' }}>
                Order Your Copy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOK PREVIEW GALLERY ──────────────────────────── */}
      <section className={`section ${styles.gallery}`} id="preview">
        <div className="container">
          <div className="section-header">
            <div className="label">The Journey</div>
            <h2 className="display-md">Moments from the Rides</h2>
            <p>Photographs and memories collected across thousands of kilometres</p>
          </div>

          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              ['/images/1(1).jpg', 'Varanasi Ride'],
              ['/images/1(2).jpg', 'Hanuman Yatra'],
              ['/images/1(3).jpg', 'Brotherhood Ride'],
              ['/images/1%20(4).jpg', 'Kashmir Ride'],
              ['/images/1%20(5).jpg', 'Ladakh'],
              ['/images/1%20(6).jpg', 'Spirit of Sivaji'],
            ].map(([image, label]) => (
              <div key={image} style={{ position: 'relative', height: '260px', overflow: 'hidden', borderRadius: '16px' }}>
                <img src={image} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', right: '12px', bottom: '12px', color: '#fff', fontWeight: 600, textShadow: '0 1px 4px #000' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFICIAL LAUNCH ───────────────────────────────── */}
      <section className={`section ${styles.launch}`} id="launch">
        <div className="container">
          <div className="section-header">
            <div className="label">Official Book Launch</div>
            <h2 className="display-md">Book Launch Ceremony</h2>
            <p>{LAUNCH.date} · {LAUNCH.time}</p>
          </div>

          <div className={styles.launchCard}>
            <div className={styles.launchInfo}>
              <div className={styles.launchDetail}>
                <span className={styles.launchIcon}>📅</span>
                <div>
                  <div className={styles.launchDetailLabel}>Date & Time</div>
                  <div className={styles.launchDetailValue}>{LAUNCH.date}, {LAUNCH.time}</div>
                </div>
              </div>
              <div className={styles.launchDetail}>
                <span className={styles.launchIcon}>📍</span>
                <div>
                  <div className={styles.launchDetailLabel}>Venue</div>
                  <div className={styles.launchDetailValue}>{LAUNCH.venue}</div>
                </div>
              </div>

              <div className={styles.guestList}>
                <h3 className={styles.guestsTitle}>Distinguished Guests</h3>
                {Object.values(LAUNCH.guests).map((guest, i) => (
                  <div key={i} className={styles.guestItem}>
                    <div className={styles.guestRole}>{guest.role}</div>
                    <div className={styles.guestName}>{guest.name}</div>
                    <div className={styles.guestOrg}>{guest.org}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.launchPhotos}>
              <div className={styles.launchPhotoMain}>
                <img src="/images/1%20(7).JPG" alt="Launch Event Main" style={{ width: '100%', height: '280px', borderRadius: '12px', objectFit: 'cover' }} />
              </div>
              <div className={styles.launchPhotoGrid}>
                <img src="/images/1%20(8).JPG" alt="Launch Event 2" style={{ width: '100%', height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                <img src="/images/1%20(9).JPG" alt="Launch Event 3" style={{ width: '100%', height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AUTHOR ────────────────────────────────────────── */}
      <section className={`section ${styles.author}`} id="author">
        <div className="container">
          <div className={styles.authorCard}>
            <div className={styles.authorImage}>
              <img src="/images/Author%20-%20Pavan%20Akondi.jpg" alt="Pavan Akondi" style={{ width: '400px', height: '400px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div className={styles.authorContent}>
              <div className="label">The Author</div>
              <h2 className="display-md">{BOOK.author}</h2>
              <p className={`text-telugu ${styles.authorNameTelugu}`}>{BOOK.authorTelugu}</p>
              <p className={styles.authorBio}>
                Pavan Akondi is a passionate motorcyclist, social worker, and storyteller from Andhra Pradesh.
                He has undertaken eight remarkable motorcycle journeys across India — from the sacred ghats of
                Varanasi to the breathtaking heights of Ladakh — driven by a deep sense of purpose, brotherhood,
                and the belief that every road has a story to tell.
              </p>
              <p className={styles.authorBio}>
                Through these rides, he has connected with thousands of people, raised awareness for social causes,
                and carried messages of hope and humanity across the country. <em>The Ride</em> is his first book —
                a heartfelt collection of the experiences, people, and moments that shaped him on the road.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────────────────────── */}
      <section className={`section ${styles.reviews}`} id="reviews">
        <div className="container">
          <div className="section-header">
            <div className="label">Reader Reviews</div>
            <h2 className="display-md">What Readers Say</h2>
            <p>Feedback from those who have already experienced The Ride</p>
          </div>

          <div className={styles.reviewsGrid}>
            {/* Placeholder reviews — will be replaced by real approved feedback */}
            {[
              { name: 'Ravi Kumar', rating: 5, text: 'An incredible journey through words. Every page takes you on the ride alongside the author. Truly inspiring.', recommend: 'YES' },
              { name: 'Priya Sharma', rating: 5, text: 'The way Pavan describes each journey is vivid and deeply moving. You feel like you are right there on the road.', recommend: 'YES' },
              { name: 'Srikanth Reddy', rating: 5, text: 'Not just a motorcycle book — it is a book about life, purpose, and the beautiful randomness of human connections.', recommend: 'YES' },
            ].map((review, i) => (
              <div key={i} className={`card ${styles.reviewCard}`}>
                <div className={styles.reviewStars}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className={styles.reviewText}>"{review.text}"</p>
                <div className={styles.reviewFooter}>
                  <span className={styles.reviewName}>{review.name}</span>
                  <span className={`badge badge-gold ${styles.reviewBadge}`}>Verified Reader</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className={styles.finalCta}>
        <div className="container">
          <div className={styles.finalCtaInner}>
            <div className={styles.finalCtaGlow} />
            <div className="label" style={{ color: 'var(--color-gold-light)' }}>Limited Copies Available</div>
            <h2 className={`display-lg ${styles.finalCtaTitle}`}>
              Get Your Copy of<br />
              <span className="gradient-text">THE RIDE</span>
            </h2>
            <p className={styles.finalCtaSubtitle}>
              A journey of purpose, faith, and brotherhood — now in your hands.
            </p>
            <Link href="/order" className="btn btn-primary btn-lg" id="final-cta-btn">
              Order the Book – ₹{BOOK.price}
            </Link>
            <p className={styles.finalCtaNote}>
              Standard delivery · 2–4 working days · Secure payment via Razorpay
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
