import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../Hooks/UseCart.js'
import { updateItemQuantity } from '../State/cart.slice.js'

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

const Cart = () => {
    const navigate = useNavigate()
    const { fetchCart, removeFromCartHandler, updateCartItemHandler } = useCart()
    const items = useSelector((state) => state.cart?.items || [])
    const loading = useSelector((state) => state.cart?.loading)
    const error = useSelector((state) => state.cart?.error)
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponMessage, setCouponMessage] = useState('')
    const [couponMessageType, setCouponMessageType] = useState('')

    useEffect(() => {
        fetchCart().catch(() => { })
    }, [])

    const subtotal = items.reduce((sum, item) => {
        const amount = Number(item?.amount || 0)
        const qty = Number(item?.quantity || 0)
        return sum + amount * qty
    }, 0)

    const currency = items?.[0]?.currency || 'INR'
    const currencyPrefix = currency === 'INR' ? '₹' : ''
    const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79
    const couponDiscount = appliedCoupon?.code === 'SNITCH10' ? subtotal * 0.1 : 0
    const total = subtotal - couponDiscount + shipping
    const estimatedDeliveryDate = (() => {
        const deliveryDate = new Date()
        deliveryDate.setDate(deliveryDate.getDate() + 5)
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(deliveryDate)
    })()

    const formatMoney = (value) =>
        `${currencyPrefix}${Number(value || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`

    const dispatch = useDispatch()

    const handleQuantityChange = async (item, nextQuantity) => {
        const previousQuantity = item?.quantity
        const itemId = item?._id

        // Optimistically update Redux state
        dispatch(updateItemQuantity({ itemId, quantity: nextQuantity }))

        // Call API in background
        try {
            await updateCartItemHandler(itemId, nextQuantity)
        } catch (error) {
            // Revert on failure
            dispatch(updateItemQuantity({ itemId, quantity: previousQuantity }))
            console.error('Failed to update quantity:', error)
        }
    }

    const handleApplyCoupon = (event) => {
        event.preventDefault()

        const normalizedCode = couponCode.trim().toUpperCase()
        if (normalizedCode === 'SNITCH10') {
            setAppliedCoupon({ code: 'SNITCH10', discountPercent: 10 })
            setCouponMessage('Coupon applied successfully. 10% discount unlocked.')
            setCouponMessageType('success')
            return
        }

        setAppliedCoupon(null)
        setCouponMessage('Invalid coupon code.')
        setCouponMessageType('error')
    }

    const handleRemove = async (cartItemId) => {
        const ok = window.confirm('Remove this item from cart?')
        if (!ok) return
        try {
            await removeFromCartHandler(cartItemId)
        } catch (error) {
            console.error(error)
        }
    }

    const { isDark, toggleDark } = useDarkMode()

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

    return (
        <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
                
                ${themeStyles}

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
                
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            `}</style>

            <header className="sticky top-0 z-40 glass-header flex items-center justify-between px-4 py-3 sm:px-12 sm:py-5">
                <button
                    onClick={() => navigate('/')}
                    className="shrink-0 text-xs uppercase tracking-[0.15em] whitespace-nowrap premium-text-muted hover:text-[var(--text-primary)] transition-colors text-left"
                >
                    Keep Browsing
                </button>
                <div className="flex-1 text-center">
                    <span className="font-playfair whitespace-nowrap text-sm sm:text-2xl tracking-widest cursor-pointer font-semibold" onClick={() => navigate('/')}>
                        S N I T C H
                    </span>
                </div>
                <div className="shrink-0 flex justify-end items-center gap-4">
                    <span className="hidden sm:inline-block shrink-0 text-xs uppercase tracking-[0.15em] whitespace-nowrap premium-text-muted">
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                    </span>
                    <button
                        onClick={toggleDark}
                        className="shrink-0 text-xs uppercase tracking-[0.1em] whitespace-nowrap premium-text-muted hover:text-[var(--text-primary)] transition-colors"
                    >
                        {isDark ? 'Light' : 'Dark'}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-12 lg:py-24">
                <div className="mb-16">
                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">The Collection</p>
                    <h1 className="font-playfair text-5xl sm:text-6xl font-medium leading-tight mb-4">Your Selection</h1>
                </div>

                {error && (
                    <div className="mb-8 p-6 border border-[var(--danger)] text-[var(--danger)] text-xs uppercase tracking-widest">
                        {String(error)}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin mb-4"></div>
                        <p className="tracking-[0.2em] text-xs font-medium premium-text-muted uppercase">Curating Selection...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-start justify-center py-20 border-t border-[var(--border)]">
                        <h2 className="font-playfair text-3xl mb-4">Your selection is empty.</h2>
                        <p className="text-sm premium-text-muted mb-10 font-light">Add pieces from our collection to begin.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-accent px-10 py-5 text-xs uppercase tracking-[0.2em] font-medium"
                        >
                            Explore Collection
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
                        <section className="flex flex-col gap-10">
                            {items.map((item) => {
                                const product = item?.product
                                const title = product?.title || 'Unknown Piece'
                                const img = item?.variant?.images?.[0]?.url || product?.images?.[0]?.url
                                const qty = Number(item?.quantity || 1)
                                const amount = Number(item?.amount || 0)
                                const currentPrice = Number(product?.price?.amount || 0)
                                const priceDifference = amount - currentPrice
                                const stock = Number(item?.stock ?? item?.variant?.stock ?? 0)
                                const variant = item?.variant
                                const attrs = variant?.attributes || null
                                const color = attrs?.color || attrs?.Color || null
                                const size = attrs?.size || attrs?.Size || null

                                return (
                                    <div key={item?._id} className="flex gap-8 group">
                                        <div
                                            className="h-40 w-32 shrink-0 cursor-pointer overflow-hidden premium-surface rounded-[10px]"
                                            onClick={() => product?._id && navigate(`/product/${product._id}`)}
                                        >
                                            {img ? (
                                                <img src={img} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-[10px]" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest premium-text-muted">No Media</div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                    <h3
                                                        onClick={() => product?._id && navigate(`/product/${product._id}`)}
                                                        className="font-playfair cursor-pointer text-2xl transition-colors hover:text-[var(--accent)]"
                                                    >
                                                        {title}
                                                    </h3>
                                                </div>
                                                {(color || size) && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {color && (
                                                            <span className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] premium-text-muted">
                                                                {color}
                                                            </span>
                                                        )}
                                                        {size && (
                                                            <span className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] premium-text-muted">
                                                                {size}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-lg font-light mb-1">{formatMoney(amount)}</p>
                                                {currentPrice > amount ? (
                                                    <p className="text-[10px] uppercase tracking-widest text-[var(--danger)] mb-4">Price increased</p>
                                                ) : currentPrice < amount ? (
                                                    <p className="text-[10px] uppercase tracking-widest text-[var(--success)] mb-4">You save {formatMoney(priceDifference)}</p>
                                                ) : null}

                                                <div className="flex flex-wrap gap-6">
                                                    {size && (
                                                        <div>
                                                            <p className="text-[9px] uppercase tracking-[0.2em] premium-text-muted mb-1">Size</p>
                                                            <p className="text-xs uppercase tracking-widest">{size}</p>
                                                        </div>
                                                    )}
                                                    {color && (
                                                        <div>
                                                            <p className="text-[9px] uppercase tracking-[0.2em] premium-text-muted mb-1">Color</p>
                                                            <p className="text-xs uppercase tracking-widest">{color}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] uppercase tracking-[0.2em] premium-text-muted">Quantity</span>
                                                    <div className="flex items-center overflow-hidden rounded-full border border-[var(--border)]">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item, Math.max(1, qty - 1))}
                                                            disabled={qty <= 1 || loading}
                                                            className="flex h-9 w-9 items-center justify-center text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:text-[var(--accent)]"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="min-w-11 px-3 text-center text-sm font-medium tabular-nums">{qty}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item, Math.min(stock, qty + 1))}
                                                            disabled={qty >= stock || stock <= 0 || loading}
                                                            className="flex h-9 w-9 items-center justify-center text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:text-[var(--accent)]"
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className={`text-[10px] uppercase tracking-[0.15em] ${stock === 0 ? 'text-[var(--danger)]' : stock <= 3 ? 'text-[var(--accent)]' : 'text-[var(--success)]'}`}>
                                                    {stock === 0 ? 'Out of Stock' : stock <= 3 ? `Only ${stock} Left` : `${stock} In Stock`}
                                                </div>

                                                <button
                                                    onClick={() => handleRemove(item?._id)}
                                                    className="text-[10px] uppercase tracking-[0.2em] premium-text-muted hover:text-[var(--danger)] transition-colors underline underline-offset-4"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </section>

                        <aside className="lg:sticky lg:top-32 h-fit">
                            <div className="premium-surface p-8 sm:p-10 border border-[var(--border)]">
                                <h3 className="text-xs uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--border)]">Order Summary</h3>



                                <div className="flex flex-col gap-6 text-sm font-light premium-text-muted mb-8">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="premium-text">{formatMoney(subtotal)}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Discount (SNITCH10)</span>
                                            <span className="text-[var(--success)]">- {formatMoney(couponDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? "text-[var(--accent)] uppercase text-xs tracking-widest font-medium" : "premium-text"}>
                                            {shipping === 0 ? 'Complimentary' : formatMoney(shipping)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estimated Delivery</span>
                                        <span className="premium-text">{estimatedDeliveryDate}</span>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between pt-6 border-t border-[var(--border)] mb-10">
                                    <span className="text-[10px] uppercase tracking-[0.2em] premium-text-muted">Total</span>
                                    <span className="font-playfair text-3xl">{formatMoney(total)}</span>
                                </div>

                                <button
                                    onClick={() => window.alert('Checkout not implemented yet')}
                                    className="btn-accent w-full py-5 text-xs uppercase tracking-[0.2em] font-medium"
                                >
                                    Proceed to Purchase
                                </button>

                                <p className="mt-6 text-center text-[10px] uppercase tracking-widest premium-text-muted">
                                    Complimentary delivery on orders above ₹999
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Cart