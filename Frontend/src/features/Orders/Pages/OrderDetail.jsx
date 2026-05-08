import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useDarkMode from '../Hooks/useDarkMode.js';
import { useOrder } from '../Hooks/useOrder.js';

const currencyFormatter = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));

const formatDate = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
};

const addDays = (value, days) => {
    if (!value) return '—';
    const next = new Date(value);
    next.setDate(next.getDate() + days);
    return formatDate(next);
};

const steps = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
const statusIndexMap = {
    placed: 0,
    confirmed: 1,
    shipped: 2,
    delivered: 3,
};

const statusBadgeClasses = {
    placed: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/25',
    confirmed: 'bg-blue-500/15 text-blue-600 border-blue-500/25',
    shipped: 'bg-purple-500/15 text-purple-600 border-purple-500/25',
    delivered: 'bg-green-500/15 text-green-600 border-green-500/25',
    cancelled: 'bg-red-500/15 text-red-600 border-red-500/25',
};

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isDark, toggleDark, themeVars } = useDarkMode();
    const { fetchOrderById, cancelOrderHandler } = useOrder();
    const order = useSelector((state) => state.order?.currentOrder || null);
    const loading = useSelector((state) => state.order?.loading || false);
    const error = useSelector((state) => state.order?.error || null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderById(orderId).catch(() => { });
        }
    }, [fetchOrderById, orderId]);

    const activeStep = useMemo(() => {
        if (!order?.status) return 0;
        return statusIndexMap[order.status] ?? 0;
    }, [order?.status]);

    const getItemSize = (item) => item?.size || item?.variant?.attributes?.size || item?.variant?.attributes?.Size || (Array.isArray(item?.variant?.attributes?.sizes) ? item.variant.attributes.sizes[0] : '') || '';

    const handleCancel = async () => {
        if (!order?._id) return;
        const ok = window.confirm('Cancel this order?');
        if (!ok) return;

        try {
            setCancelling(true);
            await cancelOrderHandler(order._id);
        } catch (err) {
            window.alert(err?.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const themeToggleIcon = isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) transition-colors duration-500" style={themeVars}>
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--bg-primary) px-4 py-3 sm:px-12 sm:py-5">
                <button
                    onClick={() => navigate('/orders')}
                    className="shrink-0 text-[8px] uppercase tracking-[0.15em] whitespace-nowrap text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                    My Orders
                </button>
                <div className="flex-1 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="font-serif whitespace-nowrap text-sm font-semibold tracking-widest text-(--text-primary) sm:text-2xl"
                    >
                        S N I T C H
                    </button>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-4">
                    <button
                        onClick={toggleDark}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) hover:text-(--text-primary)"
                    >
                        {themeToggleIcon}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-16">
                {loading ? (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-2 border-(--border) border-t-(--text-primary)" />
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-secondary)">Loading order...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 text-sm text-(--danger)">
                        {error}
                    </div>
                ) : order ? (
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-(--border) bg-(--bg-secondary) p-5 sm:p-7">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-(--text-secondary)">Order detail</p>
                                    <h1 className="mt-2 text-2xl font-medium sm:text-4xl">#{String(order?._id || '').slice(-8)}</h1>
                                    <p className="mt-2 text-sm text-(--text-secondary)">Order date: {formatDate(order?.createdAt)}</p>
                                </div>
                                <div className="flex flex-col items-start gap-3 sm:items-end">
                                    <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] ${statusBadgeClasses[order?.status] || statusBadgeClasses.placed}`}>
                                        {order?.status || 'placed'}
                                    </span>
                                    <p className="text-sm text-(--text-secondary)">Estimated delivery: {addDays(order?.createdAt, 5)}</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="mb-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-(--text-secondary) sm:text-xs">
                                    {steps.map((step, index) => (
                                        <span key={step} className={index <= activeStep ? 'text-(--text-primary)' : ''}>
                                            {step}
                                        </span>
                                    ))}
                                </div>
                                <div className="relative h-2 overflow-hidden rounded-full bg-(--border)">
                                    <div
                                        className="h-full rounded-full bg-(--accent) transition-all duration-500"
                                        style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step}
                                            className={`rounded-2xl border px-2 py-3 text-center text-[10px] uppercase tracking-[0.14em] sm:text-xs ${index <= activeStep
                                                ? 'border-(--accent) bg-(--accent)/10 text-(--text-primary)'
                                                : 'border-(--border) text-(--text-secondary)'
                                                }`}
                                        >
                                            {step}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-(--border) bg-(--bg-secondary) p-5 sm:p-7">
                            <div className="flex items-center justify-between gap-3 border-b border-(--border) pb-4">
                                <h2 className="text-lg font-medium sm:text-xl">Items</h2>
                                <p className="text-sm text-(--text-secondary)">{Array.isArray(order?.items) ? order.items.length : 0} items</p>
                            </div>

                            <div className="mt-5 space-y-4">
                                {(order?.items || []).map((item, index) => (
                                    <div key={`${item?.productId || index}-${index}`} className="flex gap-4 rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                        <img
                                            src={item?.image || ''}
                                            alt={item?.title || 'Order item'}
                                            className="h-24 w-20 rounded-lg object-cover bg-(--bg-secondary)"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-base font-medium sm:text-lg">{item?.title || 'Item'}</h3>
                                                    <p className="mt-1 text-sm text-(--text-secondary)">
                                                        Qty: {item?.quantity || 0}
                                                    </p>
                                                    {getItemSize(item) && (
                                                        <p className="mt-1 text-sm text-(--text-secondary)">
                                                            Size: {getItemSize(item)}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-(--text-primary)">
                                                    {currencyFormatter(item?.amount, item?.currency)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 grid gap-3 border-t border-(--border) pt-5 text-sm sm:grid-cols-3">
                                <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Total amount</p>
                                    <p className="mt-2 text-lg font-medium">{currencyFormatter(order?.totalAmount, order?.currency)}</p>
                                </div>
                                <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Payment ID</p>
                                    <p className="mt-2 break-all text-sm font-medium">{order?.paymentId || '—'}</p>
                                </div>
                                <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Order date</p>
                                    <p className="mt-2 text-sm font-medium">{formatDate(order?.createdAt)}</p>
                                </div>
                            </div>

                            {(order?.status === 'placed' || order?.status === 'paid') && (
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="inline-flex items-center justify-center rounded-full border border-(--danger) px-5 py-3 text-sm font-medium text-(--danger) transition-colors hover:bg-(--danger) hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                    <Link
                                        to="/orders"
                                        className="inline-flex items-center justify-center rounded-full border border-(--border) px-5 py-3 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-primary)"
                                    >
                                        Back to Orders
                                    </Link>
                                </div>
                            )}
                            {order?.refundStatus && order.refundStatus !== 'none' && (
                                <div className="mt-4 text-sm text-(--text-secondary)">
                                    Refund status: <span className="font-medium">{order.refundStatus}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 text-sm text-(--text-secondary)">
                        Order not found.
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderDetail;
