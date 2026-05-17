import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../Hooks/UseCart.js'
import { updateItemQuantity } from '../State/cart.slice.js'
import { useRazorpay } from "react-razorpay";
import { useOrder } from '../../Orders/Hooks/useOrder.js'
import useAddress from '../../User/Hooks/useAddress.js'
import { useWallet } from '../../Wallet/Hooks/useWallet.js'

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
    const { fetchCart, removeFromCartHandler, updateCartItemHandler, clearCartHandler, handlecreateorder, handlecheckpayment } = useCart()
    const { createOrderHandler } = useOrder()
    const { fetchAddresses } = useAddress()
    const { fetchBalance, payWithWalletHandler } = useWallet()
    const items = useSelector((state) => state.cart?.items || [])
    const subtotal = useSelector((state) => state.cart?.subtotal || 0)
    const loading = useSelector((state) => state.cart?.loading)
    const error = useSelector((state) => state.cart?.error)
    const walletBalance = useSelector((state) => state.wallet?.balance || 0)
    const { Razorpay, isLoading } = useRazorpay()

    useEffect(() => {
        fetchCart().catch(() => { })
        fetchBalance().catch(() => { })
    }, [fetchCart, fetchBalance])

    const currency = items?.[0]?.currency || 'INR'
    const currencyPrefix = currency === 'INR' ? '₹' : ''
    const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79
    const total = subtotal + shipping
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
            // Refresh cart from backend so subtotal and item data are authoritative
            try {
                await fetchCart()
            } catch (fetchError) {
                console.error('Failed to refetch cart after quantity update:', fetchError)
            }
        } catch (error) {
            // Revert on failure
            dispatch(updateItemQuantity({ itemId, quantity: previousQuantity }))
            console.error('Failed to update quantity:', error)
        }
    }

    const user = useSelector((state) => state.auth?.user)
    const buildOrderItems = (cartItems) => cartItems
        .map((item) => {
            const product = item?.product || {}
            const variant = item?.variant || null
            const attrs = variant?.attributes || {}
            const size = item?.size || attrs?.size || attrs?.Size || (Array.isArray(attrs?.sizes) ? attrs.sizes[0] : null) || ''

            return {
                productId: product?._id,
                variantId: variant?._id || variant || null,
                title: product?.title || item?.title || 'Item',
                image: variant?.images?.[0]?.url || product?.images?.[0]?.url || item?.image || '',
                size,
                quantity: Number(item?.quantity || 1),
                amount: Number(item?.amount || 0),
                currency: item?.currency || currency,
            }
        })
        .filter((item) => item.productId && item.title)

    const [showAddressModal, setShowAddressModal] = React.useState(false)
    const [addressesList, setAddressesList] = React.useState([])
    const [selectedAddress, setSelectedAddress] = React.useState(null)
    const [paymentMethod, setPaymentMethod] = React.useState('razorpay') // 'razorpay' or 'wallet'

    const openAddressModal = async (method = 'razorpay') => {
        try {
            setPaymentMethod(method)
            const list = await fetchAddresses()
            setAddressesList(list)
            if (!list || list.length === 0) {
                window.alert('Please add a delivery address before checkout')
                navigate('/profile/addresses')
                return
            }
            setShowAddressModal(true)
        } catch (err) {
            console.error('Failed to fetch addresses', err)
            navigate('/profile/addresses')
        }
    }

    const handlecheckout = async (amount, currency, deliveryAddress = null) => {
        try {
            if (isLoading || !Razorpay) {
                window.alert('Payment gateway is still loading. Please try again in a moment.')
                return
            }

            if (!amount || Number(amount) <= 0) {
                window.alert('Invalid order total. Please refresh the cart and try again.')
                return
            }

            const response = await handlecreateorder(amount, currency)
            console.log('Order created successfully:', response)

            const razorpayOrder = response?.order || response
            const razorpayKey = response?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID

            if (!razorpayKey) {
                window.alert('Razorpay key is missing. Please configure VITE_RAZORPAY_KEY_ID.')
                return
            }

            if (!razorpayOrder?.id || !razorpayOrder?.amount || !razorpayOrder?.currency) {
                window.alert('Order initialization failed. Please try again.')
                return
            }

            const options = {
                key: razorpayKey,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Snitch",
                description: "Test Transaction",
                order_id: razorpayOrder.id, // Generate order_id on server
                handler: async (paymentResponse) => {
                    const isvalid = await handlecheckpayment(paymentResponse)
                    if (isvalid) {
                        try {
                            const orderItems = buildOrderItems(items)
                            const orderResponse = await createOrderHandler({
                                items: orderItems,
                                totalAmount: total,
                                currency,
                                paymentId: paymentResponse.razorpay_payment_id,
                                razorpayOrderId: paymentResponse.razorpay_order_id,
                                deliveryAddress: deliveryAddress || selectedAddress || {}
                            })
                            const createdOrder = orderResponse?.order || orderResponse?.data?.order || orderResponse?.data?.data?.order || null
                            await clearCartHandler()
                            navigate('/order-successfull', {
                                state: {
                                    orderId: createdOrder?._id || paymentResponse.razorpay_order_id,
                                    backendOrderId: createdOrder?._id || null,
                                    razorpayOrderId: paymentResponse.razorpay_order_id,
                                    paymentId: paymentResponse.razorpay_payment_id,
                                    items,
                                    total,
                                    currency,
                                    estimatedDelivery: estimatedDeliveryDate
                                }
                            })
                        } catch (clearError) {
                            console.error('Failed to clear cart after payment:', clearError)
                            window.alert('Payment was successful, but the cart could not be cleared. Please refresh the page.')
                        }
                    } else {
                        window.alert('Payment verification failed. Please contact support if your payment was deducted.')
                    }
                },
                modal: {
                    ondismiss: () => {
                        console.log('Payment popup closed by user')
                    },
                },
                prefill: {
                    name: user?.fullname || '',
                    email: user?.email || '',
                    contact: user?.contact || '',
                },
                theme: {
                    color: "#b8860b"
                },
            };

            const razorpayInstance = new Razorpay(options)
            razorpayInstance.on('payment.failed', (paymentError) => {
                const message = paymentError?.error?.description || 'Payment failed. Please try again.'
                window.alert(message)
                console.error('Payment failed:', paymentError)
            })
            razorpayInstance.open()
        }
        catch (error) {
            console.error('Failed to create order:', error)
            const errorMsg = error?.response?.data?.message || 'Failed to create order'
            window.alert(errorMsg)
        }
    }

    const handlePayWithWallet = async (deliveryAddress = null) => {
        try {
            if (total > walletBalance) {
                window.alert('Insufficient wallet balance. Please add money to your wallet.')
                return
            }

            // Deduct from wallet
            await payWithWalletHandler(total)

            // Create order with wallet payment
            const orderItems = buildOrderItems(items)
            const orderResponse = await createOrderHandler({
                items: orderItems,
                totalAmount: total,
                currency: 'INR',
                paymentMethod: 'wallet',
                deliveryAddress: deliveryAddress || selectedAddress || {}
            })

            const createdOrder = orderResponse?.order || orderResponse?.data?.order || orderResponse?.data?.data?.order || null
            await clearCartHandler()
            navigate('/order-successfull', {
                state: {
                    orderId: createdOrder?._id || null,
                    backendOrderId: createdOrder?._id || null,
                    paymentMethod: 'wallet',
                    items,
                    total,
                    currency: 'INR',
                    estimatedDelivery: estimatedDeliveryDate
                }
            })
        } catch (error) {
            console.error('Failed to process wallet payment:', error)
            const errorMsg = error?.response?.data?.message || 'Failed to process wallet payment'
            window.alert(errorMsg)
        }
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
                    className="shrink-0 text-[8px] uppercase tracking-[0.15em] whitespace-nowrap premium-text-muted hover:text-(--text-primary) transition-colors text-left"
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
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="shrink-0 text-xs uppercase tracking-widest whitespace-nowrap premium-text-muted hover:text-(--text-primary) transition-colors"
                    >
                        {isDark ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-24">
                <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3">The Collection</p>
                    <h1 className="font-playfair text-3xl sm:text-5xl md:text-6xl font-medium leading-tight mb-2">Your Selection</h1>
                </div>

                {error && (
                    <div className="mb-8 p-6 border border-(--danger) text-(--danger) text-xs uppercase tracking-widest">
                        {String(error)}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-2 border-t-transparent border-(--text-primary) rounded-full animate-spin mb-4"></div>
                        <p className="tracking-[0.2em] text-xs font-medium premium-text-muted uppercase">Curating Selection...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-start justify-center py-20 border-t border-(--border)">
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
                    <div className="grid gap-8 sm:gap-16 lg:grid-cols-[1fr_360px]">
                        <section className="flex flex-col gap-10">
                            {items.map((item) => {
                                const product = item?.product
                                const title = product?.title || 'Unknown Piece'
                                const img = item?.variant?.images?.[0]?.url || product?.images?.[0]?.url
                                const qty = Number(item?.quantity || 1)
                                const unitAmount = Number(item?.amount || 0)
                                const amount = Number(item?.lineTotal ?? unitAmount * qty)
                                const currentPrice = Number(product?.price?.amount || 0)
                                const priceDifference = amount - (currentPrice * qty)
                                const stock = Number(item?.stock ?? 0)
                                const variant = item?.variant
                                const attrs = variant?.attributes || null
                                const color = attrs?.color || attrs?.Color || null
                                const size = attrs?.size || attrs?.Size || null

                                return (
                                    <div key={item?._id} className="flex flex-col sm:flex-row gap-4 sm:gap-8 group">
                                        <div
                                            className="h-28 w-24 sm:h-40 sm:w-32 shrink-0 cursor-pointer overflow-hidden premium-surface rounded-[10px]"
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
                                                        className="font-playfair cursor-pointer text-lg sm:text-2xl transition-colors hover:text-(--accent)"
                                                    >
                                                        {title}
                                                    </h3>
                                                </div>
                                                {(color || size) && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {color && (
                                                            <span className="inline-flex items-center rounded-full border border-(--border) px-3 py-1 text-[10px] uppercase tracking-[0.2em] premium-text-muted">
                                                                {color}
                                                            </span>
                                                        )}
                                                        {size && (
                                                            <span className="inline-flex items-center rounded-full border border-(--border) px-3 py-1 text-[10px] uppercase tracking-[0.2em] premium-text-muted">
                                                                {size}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-base sm:text-lg font-light mb-1">{formatMoney(amount)}</p>
                                                <p className="text-[10px] uppercase tracking-[0.15em] premium-text-muted mb-4">
                                                    {formatMoney(unitAmount)} x {qty}
                                                </p>
                                                {currentPrice > amount ? (
                                                    <p className="text-[10px] uppercase tracking-widest text-(--danger) mb-4">Price increased</p>
                                                ) : currentPrice < amount ? (
                                                    <p className="text-[10px] uppercase tracking-widest text-(--success) mb-4">You save {formatMoney(priceDifference)}</p>
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

                                            <div className="flex items-center justify-between pt-4 border-t border-(--border) mt-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] uppercase tracking-[0.2em] premium-text-muted">Quantity</span>
                                                    <div className="flex items-center overflow-hidden rounded-full border border-(--border)">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item, Math.max(1, qty - 1))}
                                                            disabled={qty <= 1 || loading}
                                                            className="flex h-9 w-9 items-center justify-center text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:text-(--accent)"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="min-w-11 px-3 text-center text-sm font-medium tabular-nums">{qty}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item, Math.min(stock, qty + 1))}
                                                            disabled={qty >= stock || stock <= 0 || loading}
                                                            className="flex h-9 w-9 items-center justify-center text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:text-(--accent)"
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className={`text-[10px] uppercase tracking-[0.15em] ${stock === 0 ? 'text-(--danger)' : stock <= 3 ? 'text-(--accent)' : 'text-(--success)'}`}>
                                                    {stock === 0 ? 'Out of Stock' : stock <= 3 ? `Only ${stock} Left` : `${stock} In Stock`}
                                                </div>

                                                <button
                                                    onClick={() => handleRemove(item?._id)}
                                                    className="text-[10px] uppercase tracking-[0.2em] premium-text-muted hover:text-(--danger) transition-colors underline underline-offset-4"
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
                            <div className="premium-surface p-4 sm:p-8 border border-(--border)">
                                <h3 className="text-xs uppercase tracking-[0.2em] mb-8 pb-4 border-b border-(--border)">Order Summary</h3>



                                <div className="flex flex-col gap-6 text-sm font-light premium-text-muted mb-8">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="premium-text">{formatMoney(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? "text-(--accent) uppercase text-xs tracking-widest font-medium" : "premium-text"}>
                                            {shipping === 0 ? 'Complimentary' : formatMoney(shipping)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estimated Delivery</span>
                                        <span className="premium-text">{estimatedDeliveryDate}</span>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between pt-4 border-t border-(--border) mb-8">
                                    <span className="text-[10px] uppercase tracking-[0.2em] premium-text-muted">Total</span>
                                    <span className="font-playfair text-3xl">{formatMoney(total)}</span>
                                </div>

                                {walletBalance > 0 && (
                                    <div className="mb-4 p-4 border border-(--accent) rounded-lg bg-(--accent)/10">
                                        <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2">Wallet Balance</p>
                                        <p className="text-lg font-medium">{formatMoney(walletBalance)}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => openAddressModal()}
                                    className="btn-accent w-full py-3 sm:py-5 px-4 sm:px-10 text-xs uppercase tracking-[0.2em] font-medium mb-2"
                                >
                                    Proceed to Purchase
                                </button>

                                {walletBalance >= total ? (
                                    <button
                                        onClick={() => openAddressModal('wallet')}
                                        className="w-full py-3 sm:py-5 px-4 sm:px-10 text-xs uppercase tracking-[0.2em] font-medium border border-(--accent) text-(--accent) hover:bg-(--accent) hover:text-(--bg-primary) transition-colors"
                                    >
                                        Pay with Wallet
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/wallet')}
                                        className="w-full py-3 sm:py-5 px-4 sm:px-10 text-xs uppercase tracking-[0.2em] font-medium border border-(--danger) text-(--danger) hover:bg-(--danger) hover:text-white transition-colors"
                                    >
                                        Insufficient Balance — Add Money
                                    </button>
                                )}

                                <p className="mt-6 text-center text-[10px] uppercase tracking-widest premium-text-muted">
                                    Complimentary delivery on orders above ₹999
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
                {/* Address selection modal */}
                {showAddressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
                        <div className="relative z-60 w-full max-w-2xl border border-(--border) premium-surface premium-text rounded-3xl p-6 sm:p-8 shadow-2xl mx-4">
                            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-(--border)">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2">Delivery</p>
                                    <h3 className="font-playfair text-2xl">Select delivery address</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(false)}
                                    className="text-[10px] uppercase tracking-[0.2em] premium-text-muted hover:text-(--text-primary) transition-colors"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="space-y-3 max-h-72 overflow-auto mb-6 pr-1">
                                {addressesList.map((addr) => (
                                    <label
                                        key={addr._id}
                                        className={`block cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${selectedAddress && selectedAddress._id === addr._id
                                            ? 'border-(--accent) bg-(--bg-primary) shadow-md'
                                            : 'border-(--border) bg-(--bg-primary)/40 hover:border-(--text-primary)'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input type="radio" name="address" onChange={() => setSelectedAddress(addr)} checked={selectedAddress?._id === addr._id} className="mt-1 accent-(--accent)" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3 mb-1">
                                                    <span className="font-medium text-sm sm:text-base">{addr.name}</span>
                                                    {addr.isDefault && (
                                                        <span className="text-[9px] uppercase tracking-[0.15em] text-(--accent)">Default</span>
                                                    )}
                                                </div>
                                                <div className="text-sm premium-text-muted leading-6">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</div>
                                                <div className="text-sm premium-text-muted mt-1">{addr.phone}</div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                                <button className="btn-outline px-4 py-3 text-xs uppercase tracking-[0.2em]" onClick={() => setShowAddressModal(false)}>Cancel</button>
                                <button className="btn-accent px-4 py-3 text-xs uppercase tracking-[0.2em]" onClick={() => {
                                    if (!selectedAddress) { window.alert('Please select an address'); return }
                                    setShowAddressModal(false)
                                    if (paymentMethod === 'wallet') {
                                        handlePayWithWallet(selectedAddress)
                                    } else {
                                        handlecheckout(total, 'INR', selectedAddress)
                                    }
                                }}>Proceed to Payment</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Cart