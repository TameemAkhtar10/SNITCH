import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useDarkMode from '../Hooks/useDarkMode.js';
import { useOrder } from '../Hooks/useOrder.js';

const statusStyles = {
    placed: 'border-yellow-500/25 bg-yellow-500/15 text-yellow-400',
    confirmed: 'border-blue-500/25 bg-blue-500/15 text-blue-400',
    shipped: 'border-purple-500/25 bg-purple-500/15 text-purple-400',
    out_for_delivery: 'border-cyan-500/25 bg-cyan-500/15 text-cyan-400',
    delivered: 'border-green-500/25 bg-green-500/15 text-green-400',
    cancelled: 'border-red-500/25 bg-red-500/15 text-red-400',
};

const nextActionMap = {
    placed: { label: 'Confirm', status: 'confirmed' },
    confirmed: { label: 'Ship', status: 'shipped' },
    shipped: { label: 'Mark Out for Delivery', status: 'out_for_delivery' },
    out_for_delivery: { label: 'Mark Delivered', status: 'delivered' },
};

const moneyFormatter = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));

const truncateId = (value) => {
    if (!value) return '—';
    const text = String(value);
    return text.length > 18 ? `${text.slice(0, 8)}...${text.slice(-6)}` : text;
};

const getCustomerName = (order) => {
    const user = order?.userId;
    if (!user) return 'Customer';
    if (typeof user === 'string') return `Customer ${truncateId(user)}`;
    return user?.fullname || user?.name || user?.email || 'Customer';
};

const SellerOrders = () => {
    const navigate = useNavigate();
    const { isDark, toggleDark, themeVars } = useDarkMode();
    const { fetchSellerOrders, updateOrderStatusHandler } = useOrder();
    const orders = useSelector((state) => state.order?.orders || []);
    const loading = useSelector((state) => state.order?.loading || false);
    const error = useSelector((state) => state.order?.error || null);
    const [localOrders, setLocalOrders] = useState([]);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        fetchSellerOrders().catch(() => { });
    }, [fetchSellerOrders]);

    useEffect(() => {
        setLocalOrders(orders);
    }, [orders]);

    const visibleOrders = useMemo(() => localOrders, [localOrders]);

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

    const handleStatusUpdate = async (orderId, nextStatus) => {
        const previousOrders = localOrders;
        setLocalOrders((currentOrders) => currentOrders.map((order) => (
            String(order?._id) === String(orderId)
                ? { ...order, status: nextStatus }
                : order
        )));

        try {
            setUpdatingOrderId(orderId);
            await updateOrderStatusHandler(orderId, nextStatus);
        } catch (err) {
            setLocalOrders(previousOrders);
            window.alert(err?.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) transition-colors duration-500" style={themeVars}>
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--bg-primary) px-4 py-3 sm:px-12 sm:py-5">
                <button
                    onClick={() => navigate('/seller')}
                    className="shrink-0 text-[8px] uppercase tracking-[0.15em] whitespace-nowrap text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                    Back to Dashboard
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
                        Seller Orders
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

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-16">
                <div className="mb-8 flex flex-col gap-2 sm:mb-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-(--text-secondary)">Seller Console</p>
                    <h1 className="text-3xl font-medium leading-tight sm:text-5xl">Order Management</h1>
                    <p className="text-sm text-(--text-secondary)">Track buyer orders that include your products and move them through the fulfillment flow.</p>
                </div>

                {loading && visibleOrders.length === 0 ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-2 border-(--border) border-t-(--text-primary)" />
                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-secondary)">Loading seller orders...</p>
                    </div>
                ) : error && visibleOrders.length === 0 ? (
                    <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 text-sm text-(--danger)">
                        {error}
                    </div>
                ) : visibleOrders.length === 0 ? (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <div className="w-full max-w-md rounded-3xl border border-(--border) bg-(--bg-secondary) p-8 text-center shadow-sm sm:p-10">
                            <h2 className="text-2xl font-medium">No seller orders yet</h2>
                            <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                                Orders that contain your products will appear here.
                            </p>
                            <button
                                type="button"
                                onClick={() => fetchSellerOrders().catch(() => { })}
                                className="mt-6 inline-flex items-center justify-center rounded-full bg-(--text-primary) px-6 py-3 text-sm font-medium text-(--bg-primary) transition-transform hover:-translate-y-0.5 hover:bg-(--accent) hover:text-white"
                            >
                                Refresh Orders
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:gap-6">
                        {visibleOrders.map((order) => {
                            const customerName = getCustomerName(order);
                            const items = Array.isArray(order?.items) ? order.items : [];
                            const itemCount = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
                            const nextAction = nextActionMap[order?.status];
                            const badgeClass = statusStyles[order?.status] || statusStyles.placed;

                            return (
                                <article key={order?._id} className="rounded-3xl border border-(--border) bg-(--bg-secondary) p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 sm:p-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1 space-y-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)">Order ID</p>
                                                    <h2 className="mt-1 break-all text-lg font-medium sm:text-xl">#{truncateId(order?._id)}</h2>
                                                </div>
                                                <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] ${badgeClass}`}>
                                                    {order?.status || 'placed'}
                                                </span>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Customer</p>
                                                    <p className="mt-2 truncate text-sm font-medium">{customerName}</p>
                                                </div>
                                                <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Items</p>
                                                    <p className="mt-2 text-sm font-medium">{itemCount}</p>
                                                </div>
                                                <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Total</p>
                                                    <p className="mt-2 text-sm font-medium">{moneyFormatter(order?.totalAmount, order?.currency)}</p>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Items in order</p>
                                                    <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">{items.length} line items</p>
                                                </div>
                                                <div className="grid gap-3">
                                                    {items.map((item, index) => (
                                                        <div key={`${item?.productId || index}-${index}`} className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--bg-secondary) p-3">
                                                            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-(--bg-primary)">
                                                                {item?.image ? (
                                                                    <img src={item.image} alt={item?.title || 'Order item'} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">
                                                                        No image
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium">{item?.title || 'Item'}</p>
                                                                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-(--text-secondary)">Qty {item?.quantity || 0}</p>
                                                            </div>
                                                            <p className="shrink-0 text-sm font-medium">{moneyFormatter(item?.amount, item?.currency)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:w-64 lg:pl-2">
                                            <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-4">
                                                <p className="text-[10px] uppercase tracking-[0.16em] text-(--text-secondary)">Status action</p>
                                                <p className="mt-2 text-sm text-(--text-secondary)">
                                                    {nextAction ? `Next: ${nextAction.label}` : 'Fulfillment complete'}
                                                </p>
                                                {nextAction ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusUpdate(order?._id, nextAction.status)}
                                                        disabled={updatingOrderId === order?._id}
                                                        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-(--text-primary) px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-(--bg-primary) transition-colors hover:bg-(--accent) hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {updatingOrderId === order?._id ? 'Updating...' : nextAction.label}
                                                    </button>
                                                ) : (
                                                    <div className="mt-4 rounded-full border border-(--border) px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-(--text-secondary)">
                                                        No further action
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SellerOrders;