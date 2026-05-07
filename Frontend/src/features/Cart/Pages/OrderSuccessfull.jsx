import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return storedTheme === 'dark' || (!storedTheme && prefersDark)
  })

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return { isDark, toggleDark }
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

  .premium-bg { background-color: var(--bg-primary); transition: background-color 0.5s ease; }
  .premium-surface { background-color: var(--bg-secondary); transition: background-color 0.5s ease; }
  .premium-text { color: var(--text-primary); transition: color 0.5s ease; }
  .premium-text-muted { color: var(--text-secondary); transition: color 0.5s ease; }
  .premium-border { border-color: var(--border); transition: border-color 0.5s ease; }

  .font-outfit { font-family: 'Outfit', sans-serif; }
  .font-playfair { font-family: 'Playfair Display', serif; }

  .btn-accent {
    background-color: var(--text-primary);
    color: var(--bg-primary);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-accent:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    background-color: var(--accent);
    color: #fff;
  }

  .glass-header {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
  }

  .os-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .os-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
    background-color: var(--bg-primary);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .os-spacer {
    width: 40px; /* To balance the toggle button on the right */
  }

  .os-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    letter-spacing: 0.5em;
    font-weight: 600;
    margin-left: 0.5em; /* to offset the letter spacing */
    color: var(--text-primary);
    text-decoration: none;
    text-transform: uppercase;
  }

  .os-theme-toggle {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
    width: 40px;
    height: 40px;
  }

  .os-theme-toggle:hover {
    background-color: var(--bg-secondary);
  }

  .os-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 1.5rem;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .os-checkmark-container {
    width: 80px;
    height: 80px;
    color: var(--success);
    animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  @keyframes scaleIn {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .os-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-align: center;
  }

  .os-subtitle {
    color: var(--text-secondary);
    font-size: 1.1rem;
    text-align: center;
    margin-bottom: 2.5rem;
    line-height: 1.5;
  }

  .os-order-box {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    margin-bottom: 2.5rem;
  }

  .os-order-meta {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px dashed var(--border);
  }

  .os-meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .os-meta-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  .os-mono {
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    background-color: var(--bg-primary);
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    letter-spacing: 1px;
  }

  .os-highlight {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1.1rem;
    margin: 0;
  }

  .os-items-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .os-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .os-item-img {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
  }

  .os-item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .os-item-name {
    font-weight: 500;
    margin: 0 0 0.25rem 0;
    color: var(--text-primary);
  }

  .os-item-qty {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  .os-item-price {
    font-weight: 600;
    color: var(--text-primary);
  }

  .os-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }

  .os-summary p {
    margin: 0;
  }

  .os-total-label {
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .os-total-amount {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--accent);
  }

  .os-actions {
    display: flex;
    gap: 1rem;
    width: 100%;
    margin-bottom: 3rem;
  }

  .os-btn {
    flex: 1;
    padding: 1rem;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    text-align: center;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .os-btn-primary {
    background-color: var(--text-primary);
    color: var(--bg-primary);
  }

  .os-btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  .os-btn-secondary {
    background-color: transparent;
    color: var(--text-primary);
    border-color: var(--border);
  }

  .os-btn-secondary:hover {
    background-color: var(--bg-secondary);
  }

  .os-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 3rem 1.5rem;
  }

  .os-empty-card {
    width: 100%;
    max-width: 520px;
    padding: 2.5rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--bg-secondary);
    text-align: center;
  }

  .os-empty-card h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    margin: 0 0 0.75rem;
  }

  .os-empty-card p {
    margin: 0 0 1.75rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .os-trust-badges {
    display: flex;
    justify-content: center;
    gap: 3rem;
    width: 100%;
    flex-wrap: wrap;
  }

  .os-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-secondary);
  }

  .os-badge svg {
    width: 24px;
    height: 24px;
    color: var(--accent);
  }

  .os-badge span {
    font-size: 0.85rem;
    font-weight: 500;
    text-align: center;
  }

  /* Confetti Animation */
  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
    overflow: hidden;
  }

  .confetti {
    position: absolute;
    top: -10px;
    width: 8px;
    height: 16px;
    animation: fall linear forwards;
  }

  @keyframes fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`;

const confettiPieces = Array.from({ length: 50 }).map((_, i) => {
  const colors = ['#d4af37', '#b8860b', '#10b981', '#000000', '#ffffff'];

  return {
    id: i,
    left: Math.random() * 100,
    animationDuration: Math.random() * 3 + 2,
    animationDelay: Math.random() * 2,
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    transform: `rotate(${Math.random() * 360}deg)`
  };
});

const Confetti = () => {
  return (
    <div className="confetti-container">
      {confettiPieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.animationDelay}s`,
            backgroundColor: p.backgroundColor,
            transform: p.transform
          }}
        />
      ))}
    </div>
  );
}

const OrderSuccessfull = () => {
  const location = useLocation();
  const { isDark, toggleDark } = useDarkMode();

  const orderState = location.state;
  const orderId = orderState?.orderId;
  const paymentId = orderState?.paymentId;
  const items = Array.isArray(orderState?.items) ? orderState.items : [];
  const total = Number(orderState?.total || 0);
  const currency = orderState?.currency || 'INR';
  const estimatedDelivery = orderState?.estimatedDelivery || '';
  const hasOrderData = Boolean(orderState);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(Number(value || 0));

  const getItemTitle = (item) => item?.product?.title || item?.name || 'Item';
  const getItemImage = (item) => item?.variant?.images?.[0]?.url || item?.product?.images?.[0]?.url || item?.image || '';
  const getItemPrice = (item) => Number(item?.amount || item?.price?.amount || item?.price || item?.product?.price?.amount || 0);
  const getItemQty = (item) => Number(item?.quantity || 1);
  const getItemMeta = (item) => {
    const attrs = item?.variant?.attributes || {};
    return [attrs.color || attrs.Color, attrs.size || attrs.Size].filter(Boolean).join(' • ');
  };

  const themeStyles = isDark ? `
        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #141414;
            --text-primary: #ffffff;
            --text-secondary: #a3a3a3;
            --accent: #d4af37;
            --border: #262626;
            --danger: #ef4444;
            --success: #10b981;
        }
    ` : `
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --text-primary: #000000;
            --text-secondary: #525252;
            --accent: #b8860b;
            --border: #e5e5e5;
            --danger: #ef4444;
            --success: #10b981;
        }
    `;

  if (!hasOrderData) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

          ${themeStyles}

          ${styles}

        `}</style>
        <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500 os-wrapper">
          <header className="os-header glass-header ">
            <div className="os-spacer"></div>

            <Link to="/" className="os-logo">SNITCH</Link>
            <button className="os-theme-toggle" onClick={toggleDark} aria-label="Toggle Theme">
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </header>

          <main className="os-empty-state">
            <div className="os-empty-card">
              <h1>No order data found</h1>
              <p>This page only shows after a successful checkout. Go back to the home page and place an order again.</p>
              <Link to="/" className="os-btn os-btn-primary" style={{ display: 'inline-block' }}>
                Go Home
              </Link>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

          ${themeStyles}

          ${styles}
        `}</style>
      <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500 os-wrapper">
        <Confetti />

        <header className="os-header glass-header">

          <Link to="/" className="os-logo">SNITCH</Link>
          <button className="os-theme-toggle" onClick={toggleDark} aria-label="Toggle Theme">
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </header>

        <main className="os-main">
          <div className="os-checkmark-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 className="os-title">Order Confirmed</h1>
          <p className="os-subtitle">Your order has been placed. Confirmation sent to your email.</p>

          <div className="os-order-box">
            <div className="os-order-meta">
              <div className="os-meta-item">
                <p className="os-meta-label">Order ID</p>
                <span className="os-mono">{orderId}</span>
              </div>
              <div className="os-meta-item">
                <p className="os-meta-label">Payment ID</p>
                <span className="os-mono">{paymentId}</span>
              </div>
              <div className="os-meta-item">
                <p className="os-meta-label">Est. Delivery</p>
                <p className="os-highlight">{estimatedDelivery}</p>
              </div>
            </div>

            <div className="os-items-list">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="os-item">
                  {getItemImage(item) ? (
                    <img src={getItemImage(item)} alt={getItemTitle(item)} className="os-item-img" />
                  ) : (
                    <div className="os-item-img" />
                  )}
                  <div className="os-item-details">
                    <h3 className="os-item-name">{getItemTitle(item)}</h3>
                    <p className="os-item-qty">Qty: {getItemQty(item)}</p>
                    {getItemMeta(item) ? <p className="os-item-qty">{getItemMeta(item)}</p> : null}
                  </div>
                  <div className="os-item-price">
                    {formatCurrency(getItemPrice(item))}
                  </div>
                </div>
              ))}
            </div>

            <div className="os-summary">
              <p className="os-total-label">Total Amount</p>
              <p className="os-total-amount">{formatCurrency(total)}</p>
            </div>
          </div>

          <div className="os-actions">
            <Link to="/" className="os-btn os-btn-secondary">Continue Shopping</Link>
            <Link to="/cart" className="os-btn os-btn-primary">Back to Cart</Link>
          </div>

          <Link
            to="/orders"
            className="mb-8 inline-flex w-full items-center justify-center rounded-full border border-(--border) px-5 py-3 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-secondary) sm:w-auto"
          >
            My Orders
          </Link>

          <div className="os-trust-badges">
            <div className="os-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Easy Returns</span>
            </div>
            <div className="os-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="os-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>24x7 Support</span>
            </div>
          </div>
        </main>

      </div>
    </>
  );
};

export default OrderSuccessfull;
