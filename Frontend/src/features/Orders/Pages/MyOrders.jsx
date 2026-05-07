import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useDarkMode from '../Hooks/useDarkMode.js';
import { useOrder } from '../Hooks/useOrder.js';

const formatMoney = (amount, currency = 'INR') =>
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

const truncateId = (value) => {
    if (!value) return '—';
    const text = String(value);
    return text.length > 18 ? `${text.slice(0, 8)}...${text.slice(-6)}` : text;
};

const statusClasses = {
    placed: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/25',
    confirmed: 'bg-blue-500/15 text-blue-600 border-blue-500/25',
    shipped: 'bg-purple-500/15 text-purple-600 border-purple-500/25',
    delivered: 'bg-green-500/15 text-green-600 border-green-500/25',
    cancelled: 'bg-red-500/15 text-red-600 border-red-500/25',
};

const MyOrders = () => {
    const navigate = useNavigate();
    const { isDark, toggleDark, themeVars } = useDarkMode();
    const { fetchUserOrders } = useOrder();
    const orders = useSelector((state) => state.order?.orders || []);
    const loading = useSelector((state) => state.order?.loading || false);
    const error = useSelector((state) => state.order?.error || null);

    useEffect(() => {
        fetchUserOrders().catch(() => { });
    }, [fetchUserOrders]);

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
                    onClick={() => navigate('/')}
                    className="shrink-0 text-[8px] uppercase tracking-[0.15em] whitespace-nowrap text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                    Keep Browsing
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
                    <span className="hidden whitespace-nowrap text-xs uppercase tracking-[0.15em] text-(--text-secondary) sm:inline-block">
                        My Orders
                    </span>
                    <button
                        onClick={toggleDark}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) hover:text-(--text-primary)"
                    >
                        {themeToggleIcon}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-16">
                <div className="mb-8 flex flex-col gap-2 sm:mb-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-(--text-secondary)">Orders</p>
                    <h1 className="text-3xl font-medium leading-tight sm:text-5xl">Your Order History</h1>
                </div>

                {loading ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-2 border-(--border) border-t-(--text-primary)" />
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-secondary)">Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 text-sm text-(--danger)">
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <div className="w-full max-w-md rounded-3xl border border-(--border) bg-(--bg-secondary) p-8 text-center shadow-sm sm:p-10">
                            <h2 className="text-2xl font-medium">No orders yet</h2>
                            <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                                You will see your purchases here once you place your first order.
                            </p>
                            <Link
                                to="/"
                                className="mt-6 inline-flex items-center justify-center rounded-full bg-(--text-primary) px-6 py-3 text-sm font-medium text-(--bg-primary) transition-transform hover:-translate-y-0.5 hover:bg-(--accent) hover:text-white"
                            >
                                Shop Now
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                        {orders.map((order) => {
                            const firstItem = Array.isArray(order?.items) ? order.items[0] : null;
                            const itemsCount = Array.isArray(order?.items)
                                ? order.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
                                : 0;
                            const badgeClass = statusClasses[order?.status] || 'bg-gray-500/15 text-gray-600 border-gray-500/25';
                            const imageSrc = firstItem?.image || '';

                            return (
                                <button
                                    key={order?._id}
                                    type="button"
                                    onClick={() => navigate(`/orders/${order?._id}`)}
                                    className="group flex w-full items-stretch gap-4 rounded-3xl border border-(--border) bg-(--bg-secondary) p-4 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
                                >
                                    <div className="shrink-0">
                                        {imageSrc ? (
                                            <img
                                                src={imageSrc}
                                                alt={firstItem?.title || 'Order item'}
                                                className="h-24 w-20 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-24 w-20 items-center justify-center rounded-lg border border-dashed border-(--border) bg-(--bg-primary) text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-xs uppercase tracking-[0.18em] text-(--text-secondary)">
                                                    #{truncateId(order?._id)}
                                                </p>
                                                <h2 className="mt-2 truncate text-base font-medium sm:text-lg">
                                                    {firstItem?.title || 'Order'}
                                                </h2>
                                            </div>
                                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${badgeClass}`}>
                                                {order?.status || 'placed'}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-(--text-secondary) sm:grid-cols-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.16em]">Date</p>
                                                <p className="mt-1 text-(--text-primary)">{formatDate(order?.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.16em]">Items</p>
                                                <p className="mt-1 text-(--text-primary)">{itemsCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.16em]">Total</p>
                                                <p className="mt-1 text-(--text-primary)">{formatMoney(order?.totalAmount, order?.currency)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrders;
