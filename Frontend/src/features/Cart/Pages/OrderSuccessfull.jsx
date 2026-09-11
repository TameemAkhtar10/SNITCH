import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { API_URL } from '../../../config/api.js';

const orderApi = axios.create({
  baseURL: `${API_URL}/api/orders`,
  withCredentials: true,
});

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return storedTheme === 'dark' || (!storedTheme && prefersDark);
  });

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return { isDark, toggleDark };
};

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

  .bill-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .bill-modal {
    width: min(100%, 340px);
    background: #ffffff;
    color: #000000;
    border-radius: 0;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-height: 90vh;
    overflow: auto;
  }

  .bill-paper {
    padding: 24px;
    font-family: 'Courier New', 'Courier', monospace;
    font-size: 13px;
  }

  .bill-title {
    text-align: center;
    font-weight: 700;
    font-size: 22px;
    margin: 0 0 4px 0;
    letter-spacing: 0.15em;
    font-family: 'Courier New', 'Courier', monospace;
  }

  .bill-subtitle {
    text-align: center;
    margin: 0;
    font-size: 13px;
    color: #777;
    font-family: 'Courier New', 'Courier', monospace;
  }

  .bill-divider {
    border-top: 1px dashed #999;
    margin: 12px 0;
    height: 0;
    padding: 0;
  }

  .bill-meta-grid {
    display: block;
    margin: 0;
  }

  .bill-meta-label {
    font-size: 11px;
    color: #555;
    margin: 0;
    display: inline;
    font-weight: normal;
  }

  .bill-meta-value {
    margin: 0;
    font-weight: normal;
    display: inline;
    font-size: 13px;
  }

  .bill-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
    margin: 0;
  }

  .bill-row:last-child {
    border-bottom: none;
  }

  .bill-item-title {
    font-weight: normal;
    margin: 0;
    font-size: 13px;
  }

  .bill-item-sub {
    margin: 0;
    font-size: 11px;
    color: #555;
    display: inline;
  }

  .bill-totals {
    display: block;
  }

  .bill-total-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    margin: 0;
    font-size: 13px;
  }

  .bill-total-label {
    text-align: left;
    font-size: 13px;
    color: #555;
    font-weight: normal;
  }

  .bill-total-value {
    text-align: right;
    font-size: 13px;
    font-weight: normal;
  }

  .bill-grand-total {
    font-weight: 700;
    font-size: 16px;
    font-family: 'Courier New', 'Courier', monospace;
  }

  .bill-status {
    text-align: center;
    text-transform: capitalize;
    font-weight: normal;
    margin: 8px 0 0 0;
    font-size: 13px;
    color: #10b981;
  }

  .bill-thanks {
    text-align: center;
    font-size: 12px;
    font-style: italic;
    color: #777;
    margin: 4px 0 0 0;
  }

  .bill-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 16px;
  }

  .bill-btn {
    border: none;
    border-radius: 6px;
    padding: 10px 16px;
    font-size: 12px;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 600;
    background: #999;
    color: #fff;
    cursor: pointer;
    font-family: 'Courier New', 'Courier', monospace;
  }

  .bill-btn-primary {
    background: #10b981;
    color: #fff;
  }

  .bill-btn-primary:hover {
    background: #059669;
  }

  .bill-btn:hover {
    opacity: 0.9;
  }

  .bill-saved {
    color: #10b981;
    font-weight: 700;
  }

  @media print {
    body * {
      visibility: hidden;
    }

    .bill-overlay,
    .bill-overlay * {
      visibility: visible;
    }

    .bill-overlay {
      position: fixed;
      inset: 0;
      background: #fff;
      padding: 0;
    }

    .bill-modal {
      width: 100%;
      max-height: none;
      border-radius: 0;
      box-shadow: none;
    }

    .no-print {
      display: none !important;
    }
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

const Confetti = () => (
  <div className="confetti-container">
    {confettiPieces.map((piece) => (
      <div
        key={piece.id}
        className="confetti"
        style={{
          left: `${piece.left}%`,
          animationDuration: `${piece.animationDuration}s`,
          animationDelay: `${piece.animationDelay}s`,
          backgroundColor: piece.backgroundColor,
          transform: piece.transform,
        }}
      />
    ))}
  </div>
);

const OrderSuccessfull = () => {
  const location = useLocation();
  const { isDark, toggleDark } = useDarkMode();
  const billRef = useRef(null);

  const orderState = location.state;
  const orderId = orderState?.backendOrderId || orderState?.orderId;
  const paymentId = orderState?.paymentId;
  const items = Array.isArray(orderState?.items) ? orderState.items : [];
  const total = Number(orderState?.total || 0);
  const currency = orderState?.currency || 'INR';
  const estimatedDelivery = orderState?.estimatedDelivery || '';
  const hasOrderData = Boolean(orderState);

  const [billData, setBillData] = useState(null);
  const [billOpen, setBillOpen] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState(null);

  const formatCurrency = (value, activeCurrency = currency) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: activeCurrency,
    }).format(Number(value || 0));

  const getItemTitle = (item) => item?.product?.title || item?.name || 'Item';
  const getItemImage = (item) => item?.variant?.images?.[0]?.url || item?.product?.images?.[0]?.url || item?.image || '';
  const getItemPrice = (item) => Number(item?.lineTotal ?? (Number(item?.amount || item?.price?.amount || item?.price || item?.product?.price?.amount || 0) * Number(item?.quantity || 1)));
  const getItemQty = (item) => Number(item?.quantity || 1);
  const getItemSize = (item) => item?.size || item?.variant?.attributes?.size || item?.variant?.attributes?.Size || (Array.isArray(item?.variant?.attributes?.sizes) ? item.variant.attributes.sizes[0] : '') || '';
  const getItemMeta = (item) => {
    const attrs = item?.variant?.attributes || {};
    const size = getItemSize(item);
    return [attrs.color || attrs.Color, size].filter(Boolean).join(' • ');
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

  const generateBill = async () => {
    if (!orderId) {
      window.alert('Order reference is missing. Please return and try again.');
      return;
    }

    try {
      setBillLoading(true);
      setBillError(null);
      const response = await orderApi.post(`/${orderId}/bill`);
      const bill = response?.data?.bill || response?.data?.data?.bill || null;
      setBillData(bill);
      setBillOpen(true);
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to generate bill';
      setBillError(message);
      window.alert(message);
    } finally {
      setBillLoading(false);
    }
  };

  const downloadBillImage = async () => {
    if (!billRef.current) {
      return;
    }

    const canvas = await html2canvas(billRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = `${billData?.billNumber || 'snitch-bill'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const printBill = () => {
    window.print();
  };

  if (!hasOrderData) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

          ${themeStyles}
          ${styles}
        `}</style>
        <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--bg-primary) px-4 py-3 sm:px-12 sm:py-5">
            <div className="w-10" />
            <Link to="/" className="font-playfair text-sm font-semibold tracking-[0.5em] text-(--text-primary) sm:text-2xl">
              SNITCH
            </Link>
            <button
              className="rounded-full p-2 text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) hover:text-(--text-primary)"
              onClick={toggleDark}
              aria-label="Toggle Theme"
            >
              {isDark ? '☼' : '☾'}
            </button>
          </header>
          <main className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="max-w-xl rounded-3xl border border-(--border) bg-(--bg-secondary) p-8 text-center sm:p-10">
              <h1 className="font-playfair text-3xl font-semibold sm:text-4xl">No order data found</h1>
              <p className="mt-4 text-sm leading-6 text-(--text-secondary)">This page only shows after a successful checkout. Go back and place an order again.</p>
              <Link to="/" className="btn-accent mt-8 inline-flex rounded-full px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium">
                Go Home
              </Link>
            </div>
          </main>
        </div>
      </>
    );
  }

  const billCurrency = billData?.items?.[0]?.currency || currency;
  const billFormatMoney = (value) => formatCurrency(value, billCurrency);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        ${themeStyles}
        ${styles}
      `}</style>

      <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500">
        <Confetti />

        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--bg-primary) px-4 py-3 sm:px-12 sm:py-5">
          <button
            onClick={() => window.history.back()}
            className="text-[8px] uppercase tracking-[0.15em] text-(--text-secondary) transition-colors hover:text-(--text-primary) no-print"
          >
            Back
          </button>
          <Link to="/" className="font-playfair text-sm font-semibold tracking-[0.5em] text-(--text-primary) sm:text-2xl">
            SNITCH
          </Link>
          <button
            onClick={toggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full p-2 text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) hover:text-(--text-primary) no-print"
          >
            {isDark ? '☼' : '☾'}
          </button>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-24">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-(--border) bg-(--bg-secondary)">
              ✓
            </div>
            <h1 className="font-playfair text-3xl font-semibold sm:text-5xl">Order Confirmed</h1>
            <p className="mt-3 text-sm text-(--text-secondary)">Your order has been placed. Confirmation sent to your email.</p>
          </div>

          <div className="rounded-3xl border border-(--border) bg-(--bg-secondary) p-5 sm:p-7">
            <div className="grid gap-4 border-b border-dashed border-(--border) pb-5 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)">Order ID</p>
                <p className="mt-2 break-all text-sm font-medium">{orderId}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)">Payment ID</p>
                <p className="mt-2 break-all text-sm font-medium">{paymentId}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)">Est. Delivery</p>
                <p className="mt-2 text-sm font-medium">{estimatedDelivery}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="flex gap-4 rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                  {getItemImage(item) ? (
                    <img src={getItemImage(item)} alt={getItemTitle(item)} className="h-24 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="h-24 w-20 rounded-lg border border-dashed border-(--border)" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-medium sm:text-lg">{getItemTitle(item)}</h2>
                        <p className="mt-1 text-sm text-(--text-secondary)">Qty: {getItemQty(item)}</p>
                        {getItemMeta(item) ? <p className="mt-1 text-sm text-(--text-secondary)">{getItemMeta(item)}</p> : null}
                      </div>
                      <p className="text-sm font-medium">{formatCurrency(getItemPrice(item), billCurrency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-dashed border-(--border) pt-5">
              <p className="text-sm uppercase tracking-[0.16em] text-(--text-secondary)">Total</p>
              <p className="font-playfair text-3xl font-semibold">{formatCurrency(total, currency)}</p>
            </div>
          </div>

          <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={generateBill} disabled={billLoading} className="btn-accent rounded-full px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium">
              {billLoading ? 'Generating Bill...' : 'Generate Bill'}
            </button>
            <Link to="/orders" className="inline-flex items-center justify-center rounded-full border border-(--border) px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium text-(--text-primary) transition-colors hover:bg-(--bg-secondary)">
              My Orders
            </Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-full border border-(--border) px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium text-(--text-primary) transition-colors hover:bg-(--bg-secondary)">
              Continue Shopping
            </Link>
          </div>
        </main>

        {billOpen && billData ? (
          <div className="bill-overlay no-print">
            <div className="bill-modal">
              <div ref={billRef} style={{ padding: '24px', fontFamily: "'Courier New', 'Courier', monospace", fontSize: '13px', background: '#ffffff', color: '#000000' }}>
                <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '22px', margin: '0 0 4px 0', letterSpacing: '0.15em' }}>
                  SNITCH
                </div>
                <div style={{ textAlign: 'center', margin: '0', fontSize: '13px', color: '#777' }}>
                  Purchase Invoice
                </div>

                <div style={{ borderTop: '1px dashed #999', margin: '12px 0', height: 0, padding: 0 }} />

                <div style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#555', fontWeight: 'normal' }}>Bill No: </span>
                    <span style={{ fontSize: '13px', fontWeight: 'normal' }}>{billData.billNumber}</span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#555', fontWeight: 'normal' }}>Date: </span>
                    <span style={{ fontSize: '13px', fontWeight: 'normal' }}>{new Date(billData.billDate).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div style={{ marginBottom: '0' }}>
                    <span style={{ fontSize: '11px', color: '#555', fontWeight: 'normal' }}>Customer: </span>
                    <span style={{ fontSize: '13px', fontWeight: 'normal' }}>{billData.customerName}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #999', margin: '12px 0', height: 0, padding: 0 }} />

                <div style={{ marginBottom: '0' }}>
                  {billData.items.map((item, index) => (
                    <div key={`${item.title}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', margin: '0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'normal', margin: '0', fontSize: '13px' }}>Item: {item.title}</div>
                        <div style={{ margin: '0', fontSize: '11px', color: '#555' }}>Qty: {item.quantity}</div>
                        {item.size ? <div style={{ margin: '0', fontSize: '11px', color: '#555' }}>Size: {item.size}</div> : null}
                      </div>
                      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 'normal', margin: '0', fontSize: '13px' }}>{billFormatMoney(item.lineTotal ?? item.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #999', margin: '12px 0', height: 0, padding: 0 }} />

                <div style={{ marginBottom: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 0', margin: '0', fontSize: '13px' }}>
                    <span style={{ textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: 'normal' }}>Subtotal</span>
                    <span style={{ textAlign: 'right', fontSize: '13px', fontWeight: 'normal' }}>{billFormatMoney(billData.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 0', margin: '0', fontSize: '13px' }}>
                    <span style={{ textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: 'normal' }}>Shipping</span>
                    <span style={{ textAlign: 'right', fontSize: '13px', fontWeight: 'normal' }}>{billData.shipping === 0 ? 'FREE' : billFormatMoney(billData.shipping)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 0', margin: '0', fontSize: '13px' }}>
                    <span style={{ textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: 'normal' }}>GST (18%)</span>
                    <span style={{ textAlign: 'right', fontSize: '13px', fontWeight: 'normal' }}>{billFormatMoney(billData.subtotal * 0.18)}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #999', margin: '12px 0', height: 0, padding: 0 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', margin: '0' }}>
                  <span style={{ fontSize: '13px', color: '#555', fontWeight: 'normal' }}>TOTAL</span>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{billFormatMoney(billData.total)}</span>
                </div>

                <div style={{ borderTop: '1px dashed #999', margin: '12px 0', height: 0, padding: 0 }} />

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 'normal', textTransform: 'capitalize', margin: '4px 0' }}>
                    Status: {billData.status}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '12px', fontStyle: 'italic', color: '#777', margin: '4px 0 0 0' }}>
                    Thank you for shopping with Snitch
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }} className="no-print">
                  <button
                    type="button"
                    onClick={() => setBillOpen(false)}
                    style={{
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#999',
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: "'Courier New', 'Courier', monospace"
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={downloadBillImage}
                    style={{
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#10b981',
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: "'Courier New', 'Courier', monospace"
                    }}
                  >
                    Download Bill Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default OrderSuccessfull;
