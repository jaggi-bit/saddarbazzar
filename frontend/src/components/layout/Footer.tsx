import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <Link href="/" className={styles.logoArea}>
            <div className={styles.logoIcon}>🏪</div>
            <div className={styles.logoText}>
              Sadar <span className={styles.logoAccent}>Bazar</span>
            </div>
          </Link>
          <p className={styles.description}>
            Your premier online shopping destination in Pakistan. Authentic products, unbeatable prices, and lightning-fast delivery nationwide.
          </p>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Shop</h3>
          <ul className={styles.linkList}>
            <li><Link href="/products" className={styles.link}>All Products</Link></li>
            <li><Link href="/category/electronics" className={styles.link}>Electronics</Link></li>
            <li><Link href="/category/clothing" className={styles.link}>Clothing</Link></li>
            <li><Link href="/category/home-kitchen" className={styles.link}>Home & Kitchen</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Customer Service</h3>
          <ul className={styles.linkList}>
            <li><Link href="/track-order" className={styles.link}>Track Order</Link></li>
            <li><Link href="/returns" className={styles.link}>Returns & Exchanges</Link></li>
            <li><Link href="/shipping" className={styles.link}>Shipping Policy</Link></li>
            <li><Link href="/contact" className={styles.link}>Contact Us</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Contact Info</h3>
          <ul className={styles.linkList}>
            <li className={styles.link}>📞 +92 300 1234567</li>
            <li className={styles.link}>✉️ support@sadarbazar.pk</li>
            <li className={styles.link}>📍 Karachi, Pakistan</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} Sadar Bazar. All rights reserved.</p>
        <div className={styles.paymentIcons}>
          <span className={styles.paymentIcon}>COD</span>
          <span className={styles.paymentIcon}>Visa</span>
          <span className={styles.paymentIcon}>Mastercard</span>
          <span className={styles.paymentIcon}>Easypaisa</span>
        </div>
      </div>
    </footer>
  );
}
