import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import UseProduct from '../Hooks/UseProduct'
import { useCart } from '../../Cart/Hooks/UseCart.js'
import UseWishlist from '../../Wishlist/Hooks/UseWishlist.js'
import UseReview from '../../Reviews/Hooks/UseReview.js'
import { addRecentlyViewed } from '../services/recentlyViewed.service.js'

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const renderStars = (rating = 0) => {
    const rounded = Math.round(Number(rating) || 0)
    return '★★★★★'.split('').map((star, idx) => (idx < rounded ? '★' : '☆')).join('')
}

const useDarkMode = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
        setIsDark(initialDark);
    }, []);

    const toggleDark = () => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    return { isDark, toggleDark };
};

const ProductDetails = () => {
    const { productId } = useParams()
    const navigate = useNavigate()
    const token = getToken()

    const { addToCarthandler } = useCart()
    const { currentProduct: product, loading, error } = useSelector((state) => state.product)
    const authUser = useSelector((state) => state.auth?.user)
    const {
        fetchWishlist,
        addToWishlistHandler,
        removeFromWishlistHandler,
        isWishlisted
    } = UseWishlist()
    const {
        reviews,
        averageRating,
        totalReviews,
        fetchReviewsByProductId,
        submitReviewHandler,
        deleteReviewHandler,
        loading: reviewLoading
    } = UseReview()

    React.useEffect(() => {
        if (product?.variants?.length > 0) {
            console.log('Variants data:', product.variants)
            console.log('Variant 0:', product.variants[0])
            console.log('Variant 0 attributes:', product.variants[0].attributes)
        }
    }, [product])

    const { handleGetProductById, handleClearCurrentProduct } = UseProduct()

    const [quantity, setQuantity] = React.useState(1)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
    const [variantImageIndex, setVariantImageIndex] = React.useState({})
    const [selectedVariantIndex, setSelectedVariantIndex] = React.useState(null)
    const [selectedSizeOption, setSelectedSizeOption] = React.useState(null)
    const [cartLoading, setCartLoading] = React.useState(false)
    const [cartMessage, setCartMessage] = React.useState("")
    const [wishlistLoading, setWishlistLoading] = React.useState(false)
    const [reviewRating, setReviewRating] = React.useState(5)
    const [reviewComment, setReviewComment] = React.useState('')
    const [reviewMessage, setReviewMessage] = React.useState('')
    const [reviewSubmitting, setReviewSubmitting] = React.useState(false)
    const [pincode, setPincode] = React.useState('')
    const [deliveryInfo, setDeliveryInfo] = React.useState(null)
    const [deliveryLoading, setDeliveryLoading] = React.useState(false)
    const [deliveryError, setDeliveryError] = React.useState('')

    const { isDark, toggleDark } = useDarkMode()

    const getVariantAttr = useCallback((variant, key) => {
        const attributes = variant?.attributes
        if (!attributes) return undefined

        const keyLower = String(key || '').toLowerCase()

        if (typeof attributes.get === 'function') {
            const direct = attributes.get(key) || attributes.get(key?.toLowerCase?.()) || attributes.get(key?.toUpperCase?.())
            if (direct !== undefined) return direct

            if (typeof attributes.entries === 'function') {
                for (const [k, v] of attributes.entries()) {
                    const kLower = String(k || '').toLowerCase()
                    if (kLower === keyLower || (keyLower && kLower.includes(keyLower))) return v
                }
            }
            return undefined
        }

        const direct = attributes[key] ?? attributes?.[key?.toLowerCase?.()] ?? attributes?.[key?.toUpperCase?.()]
        if (direct !== undefined) return direct

        const matchKey = Object.keys(attributes).find((k) => {
            const kLower = String(k || '').toLowerCase()
            return kLower === keyLower || (keyLower && kLower.includes(keyLower))
        })
        return matchKey ? attributes[matchKey] : undefined
    }, [])

    const getVariantSizes = useCallback((variant) => {
        const rawSizes = getVariantAttr(variant, 'sizes')
        const fallbackSize = getVariantAttr(variant, 'size')

        if (Array.isArray(rawSizes)) {
            return [...new Set(rawSizes.map((s) => String(s || '').trim()).filter(Boolean))]
        }

        if (typeof rawSizes === 'string' && rawSizes.trim()) {
            try {
                const parsed = JSON.parse(rawSizes)
                if (Array.isArray(parsed)) {
                    return [...new Set(parsed.map((s) => String(s || '').trim()).filter(Boolean))]
                }
            } catch {
                return [...new Set(rawSizes.split(',').map((s) => s.trim()).filter(Boolean))]
            }
        }

        if (fallbackSize !== undefined && fallbackSize !== null && String(fallbackSize).trim()) {
            return [String(fallbackSize).trim()]
        }

        return []
    }, [getVariantAttr])

    const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product?.variants])
    const selectedVariant = selectedVariantIndex !== null ? variants?.[selectedVariantIndex] : null

    const displayedPrice = selectedVariant?.price?.amount ?? product?.price?.amount
    const displayedCurrency = selectedVariant?.price?.currency ?? product?.price?.currency
    const displayedStock = selectedVariant?.stock ?? product?.stock

    const availableColors = Array.from(
        new Set(variants.map(v => getVariantAttr(v, 'color')).filter(Boolean))
    )

    const availableSizes = Array.from(
        new Set(variants.flatMap((v) => getVariantSizes(v)).filter(Boolean))
    )

    const selectedColor = selectedVariant ? getVariantAttr(selectedVariant, 'color') : null
    const selectedSize = selectedSizeOption || (selectedVariant ? getVariantSizes(selectedVariant)[0] : null)

    const chooseVariantIndex = ({ color, size }) => {
        if (!variants.length) return null

        const exact = variants.findIndex(v => {
            const vColor = getVariantAttr(v, 'color')
            const vSizes = getVariantSizes(v)
            return (color ? vColor === color : true) && (size ? vSizes.includes(size) : true)
        })
        if (exact !== -1) return exact

        if (color) {
            const byColor = variants.findIndex(v => getVariantAttr(v, 'color') === color)
            if (byColor !== -1) return byColor
        }

        if (size) {
            const bySize = variants.findIndex(v => getVariantSizes(v).includes(size))
            if (bySize !== -1) return bySize
        }

        return 0
    }

    const handleSelectColor = (color) => {
        const nextIndex = chooseVariantIndex({ color, size: selectedSizeOption || selectedSize })
        if (nextIndex === null) return
        setSelectedVariantIndex(nextIndex)
        setVariantImageIndex(prev => ({ ...prev, [nextIndex]: 0 }))
    }

    const handleSelectSize = (size) => {
        const nextIndex = chooseVariantIndex({ color: selectedColor, size })
        if (nextIndex === null) return
        setSelectedSizeOption(size)
        setSelectedVariantIndex(nextIndex)
        setVariantImageIndex(prev => ({ ...prev, [nextIndex]: 0 }))
    }

    const handleClearSelection = () => {
        setSelectedVariantIndex(null)
        setSelectedSizeOption(null)
        setCurrentImageIndex(0)
    }

    useEffect(() => {
        if (selectedVariantIndex === null) {
            if (selectedSizeOption !== null) setSelectedSizeOption(null)
            return
        }

        const sizesForSelectedVariant = getVariantSizes(selectedVariant)
        if (sizesForSelectedVariant.length === 0) {
            if (selectedSizeOption !== null) setSelectedSizeOption(null)
            return
        }

        if (!selectedSizeOption || !sizesForSelectedVariant.includes(selectedSizeOption)) {
            setSelectedSizeOption(sizesForSelectedVariant[0])
        }
    }, [selectedVariantIndex, selectedVariant, selectedSizeOption, variants, getVariantSizes])

    const activeImages = (selectedVariant?.images?.length ? selectedVariant.images : product?.images) || []
    const activeImageIndex = selectedVariantIndex !== null
        ? (variantImageIndex[selectedVariantIndex] || 0)
        : currentImageIndex

    const handleNextImage = () => {
        if (!activeImages.length) return

        if (selectedVariantIndex !== null) {
            setVariantImageIndex((prev) => ({
                ...prev,
                [selectedVariantIndex]: ((prev[selectedVariantIndex] || 0) + 1) % activeImages.length
            }))
            return
        }

        setCurrentImageIndex((prev) => (prev + 1) % activeImages.length)
    }

    const handlePrevImage = () => {
        if (!activeImages.length) return

        if (selectedVariantIndex !== null) {
            setVariantImageIndex((prev) => ({
                ...prev,
                [selectedVariantIndex]: (prev[selectedVariantIndex] || 0) === 0
                    ? activeImages.length - 1
                    : (prev[selectedVariantIndex] || 0) - 1
            }))
            return
        }

        setCurrentImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length)
    }

    useEffect(() => {
        handleGetProductById(productId)
        setSelectedVariantIndex(null)
        setSelectedSizeOption(null)
        setCurrentImageIndex(0)
        setVariantImageIndex({})
        return () => {
            handleClearCurrentProduct()
        }
    }, [productId, handleClearCurrentProduct, handleGetProductById])

    useEffect(() => {
        fetchReviewsByProductId(productId).catch(() => { })
    }, [productId, fetchReviewsByProductId])

    useEffect(() => {
        if (!token) return
        fetchWishlist().catch(() => { })
    }, [token, fetchWishlist])

    useEffect(() => {
        if (!token || !productId) return
        addRecentlyViewed(productId).catch(() => { })
    }, [token, productId])

    const getCurrentUserId = () => {
        return authUser?.id || authUser?._id || authUser?.user?._id || null
    }

    const handleWishlistToggle = async () => {
        if (!token) {
            navigate('/login', { state: { from: `/product/${productId}` } })
            return
        }

        try {
            setWishlistLoading(true)
            if (isWishlisted(productId)) {
                await removeFromWishlistHandler(productId)
            } else {
                await addToWishlistHandler(productId)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setWishlistLoading(false)
        }
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (!token) {
            navigate('/login', { state: { from: `/product/${productId}` } })
            return
        }

        try {
            setReviewSubmitting(true)
            await submitReviewHandler(productId, {
                rating: reviewRating,
                comment: reviewComment
            })
            setReviewMessage('Review submitted successfully')
            setReviewComment('')
        } catch (error) {
            setReviewMessage(error?.response?.data?.message || 'Failed to submit review')
        } finally {
            setReviewSubmitting(false)
        }
    }

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReviewHandler(reviewId)
        } catch (error) {
            console.log(error)
        }
    }

    const handleCheckPincode = async () => {
        if (!pincode) {
            setDeliveryError('Please enter a pincode')
            setDeliveryInfo(null)
            return
        }

        try {
            setDeliveryLoading(true)
            setDeliveryError('')
            const response = await axios.get(`hhttps://snitch-aukv.onrender.com/api/delivery/check/${pincode}`, { withCredentials: true })
            const data = response?.data
            const maxDays = Number(String(data?.estimatedDeliveryDays || '').split('-')?.[1]?.replace(' days', '')) || 5
            const estimatedDate = new Date()
            estimatedDate.setDate(estimatedDate.getDate() + maxDays)
            setDeliveryInfo({
                ...data,
                estimatedDeliveryDate: estimatedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            })
        } catch (error) {
            setDeliveryInfo(null)
            setDeliveryError(error?.response?.data?.message || 'Unable to check delivery for this pincode')
        } finally {
            setDeliveryLoading(false)
        }
    }

    const handleBuy = () => {
        if (!token) {
            navigate('/login', { state: { from: `/product/${productId}` } })
        } else {
            const variantId = selectedVariant?._id || null
            const variantIndex = selectedVariantIndex ?? null

            navigate(`/checkout/${productId}`, {
                state: {
                    quantity,
                    variantId,
                    variantIndex,
                    color: selectedColor,
                    size: selectedSize
                }
            })
        }
    }

    const handleAddToCart = async () => {
        if (displayedStock === 0) {
            setCartMessage("❌ Out of stock!")

            setTimeout(() => setCartMessage(""), 3000)

            return
        }

        if (!token) {
            navigate('/login', { state: { from: `/product/${productId}` } })
            return
        }

        setCartLoading(true)
        try {
            const variantId = selectedVariant ? selectedVariant._id : productId
            console.log('Final variantId sent to API:', variantId)

            const cartData = {
                quantity: quantity,
                amount: displayedPrice,
                currency: displayedCurrency
            }
            console.log('productId:', productId)
            console.log('variantId:', variantId)
            await addToCarthandler(productId, variantId, cartData)
            setCartMessage("✅ Added to cart!")
            setTimeout(() => setCartMessage(""), 3000)

        } catch {
            setCartMessage("❌ Failed to add to cart")
            setTimeout(() => setCartMessage(""), 3000)
        } finally {
            setCartLoading(false)
        }
    }

    const handleBuyNow = () => {
        handleBuy()
    }

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

    if (loading) {
        return (
            <div className="min-h-screen font-outfit flex flex-col items-center justify-center premium-bg premium-text">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
                    ${themeStyles}
                    .premium-bg { background-color: var(--bg-primary); transition: background-color 0.5s ease; }
                    .premium-text { color: var(--text-primary); transition: color 0.5s ease; }
                    .premium-text-muted { color: var(--text-secondary); transition: color 0.5s ease; }
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                `}</style>
                <div className="w-12 h-12 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin mb-4"></div>
                <p className="tracking-[0.2em] text-xs font-medium premium-text-muted uppercase">Curating Details...</p>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen font-outfit flex flex-col items-center justify-center gap-8 premium-bg premium-text">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
                    ${themeStyles}
                    .premium-bg { background-color: var(--bg-primary); transition: background-color 0.5s ease; }
                    .premium-text { color: var(--text-primary); transition: color 0.5s ease; }
                    .premium-text-muted { color: var(--text-secondary); transition: color 0.5s ease; }
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                    .font-playfair { font-family: 'Playfair Display', serif; }
                `}</style>
                <p className="font-playfair text-3xl italic">{error || 'Piece not found'}</p>
                <button onClick={() => navigate('/')} className="tracking-[0.1em] text-sm uppercase premium-text-muted hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-1">
                    Return to Collection
                </button>
            </div>
        )
    }

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
                
                .btn-outline {
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    transition: all 0.3s ease;
                }
                .btn-outline:hover {
                    border-color: var(--text-primary);
                }
                
                .variant-ring.active {
                    box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--text-primary);
                }
                
                .glass-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border);
                }
                
                .image-container:hover .image-controls {
                    opacity: 1;
                }
                
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            `}</style>

            <header className="sticky top-0 z-40 glass-header flex items-center justify-between px-4 py-3 sm:px-12 sm:py-5">
                <button
                    onClick={() => navigate(-1)}
                    className="shrink-0 text-xs uppercase tracking-[0.15em] whitespace-nowrap premium-text-muted hover:text-[var(--text-primary)] transition-colors text-left"
                >
                    Back
                </button>
                <div className="flex-1 text-center">
                    <span className="font-playfair whitespace-nowrap text-sm sm:text-2xl tracking-widest cursor-pointer font-semibold" onClick={() => navigate('/')}>
                        S N I T C H
                    </span>
                </div>
                <div className="shrink-0 text-right">
                    <button
                        onClick={toggleDark}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="shrink-0 text-xs uppercase tracking-[0.1em] whitespace-nowrap premium-text-muted hover:text-[var(--text-primary)] transition-colors"
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

            <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-24">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-24">
                    <div className="flex-1 flex gap-4 sm:gap-6 lg:gap-8 lg:sticky lg:top-32 h-fit">
                        {activeImages && activeImages.length > 1 && (
                            <div className="hidden lg:flex flex-col gap-4 w-20 shrink-0">
                                {activeImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={`w-full aspect-[3/4] relative overflow-hidden transition-all duration-300 rounded-[10px] ${idx === activeImageIndex ? 'opacity-100 ring-1 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--bg-primary)]' : 'opacity-40 hover:opacity-100'}`}
                                        onClick={() => {
                                            if (selectedVariantIndex !== null) {
                                                setVariantImageIndex(prev => ({ ...prev, [selectedVariantIndex]: idx }))
                                            } else {
                                                setCurrentImageIndex(idx)
                                            }
                                        }}
                                    >
                                        <img src={img.url} alt="thumbnail" className="w-full h-full object-cover rounded-[10px]" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex-1 relative aspect-[3/4] image-container overflow-hidden premium-surface rounded-[10px]">
                            {activeImages && activeImages.length > 0 ? (
                                <>
                                    <img
                                        src={activeImages[activeImageIndex].url}
                                        alt={product.title}
                                        className="w-full h-full object-cover rounded-[10px]"
                                    />
                                    {activeImages.length > 1 && (
                                        <div className="image-controls opacity-0 transition-opacity duration-300 absolute inset-0 flex items-center justify-between p-4">
                                            <button onClick={handlePrevImage} className="w-10 h-10 rounded-full bg-[var(--bg-primary)]/80 backdrop-blur flex items-center justify-center hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all">
                                                ←
                                            </button>
                                            <button onClick={handleNextImage} className="w-10 h-10 rounded-full bg-[var(--bg-primary)]/80 backdrop-blur flex items-center justify-center hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all">
                                                →
                                            </button>
                                        </div>
                                    )}
                                    {activeImages.length > 1 && (
                                        <div className="lg:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                            {activeImages.map((_, idx) => (
                                                <div key={idx} className={`h-1 rounded-full transition-all ${idx === activeImageIndex ? 'w-6 bg-[var(--text-primary)]' : 'w-2 bg-[var(--text-primary)]/40'}`} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-widest premium-text-muted">No Media Available</div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col w-full max-w-xl">
                        <div className="mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">{product.category || 'Collection'}</p>
                                    <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight mb-4">{product.title}</h1>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleWishlistToggle}
                                    disabled={wishlistLoading}
                                    className="text-2xl mt-2 hover:scale-110 transition-transform disabled:opacity-50"
                                >
                                    {isWishlisted(productId) ? '♥' : '♡'}
                                </button>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-light">{displayedCurrency === 'INR' ? '₹' : displayedCurrency}{displayedPrice}</span>
                                <span className="text-xs uppercase tracking-widest premium-text-muted">Taxes Included</span>
                            </div>
                        </div>

                        <div className="h-px w-full premium-border border-t mb-8" />

                        <div className="text-sm leading-relaxed premium-text-muted mb-10 font-light">
                            {product.description}
                        </div>

                        {variants.length > 0 && (
                            <div className="flex flex-col gap-8 mb-10">
                                {availableColors.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Color</p>
                                                {selectedVariantIndex !== null && (
                                                    <button
                                                        type="button"
                                                        onClick={handleClearSelection}
                                                        className="text-[9px] uppercase tracking-[0.18em] premium-text-muted hover:text-[var(--text-primary)] transition-colors"
                                                    >
                                                        × Clear
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-[0.1em]">{selectedColor}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {availableColors.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => handleSelectColor(c)}
                                                    className={`px-6 py-3 text-xs uppercase tracking-wider transition-all border ${selectedColor === c ? 'border-[var(--text-primary)] premium-text bg-[var(--text-primary)]/5' : 'border-[var(--border)] premium-text-muted hover:border-[var(--text-primary)]'}`}
                                                >
                                                    {String(c)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {availableSizes.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Size</p>
                                                {selectedVariantIndex !== null && (
                                                    <button
                                                        type="button"
                                                        onClick={handleClearSelection}
                                                        className="text-[9px] uppercase tracking-[0.18em] premium-text-muted hover:text-[var(--text-primary)] transition-colors"
                                                    >
                                                        × Clear
                                                    </button>
                                                )}
                                            </div>
                                            <button type="button" className="text-[10px] uppercase tracking-[0.1em] underline underline-offset-4 premium-text-muted hover:text-[var(--text-primary)]">Size Guide</button>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {availableSizes.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleSelectSize(s)}
                                                    className={`w-14 h-14 flex items-center justify-center text-xs uppercase transition-all border ${selectedSize === s ? 'border-[var(--text-primary)] premium-text bg-[var(--text-primary)]/5' : 'border-[var(--border)] premium-text-muted hover:border-[var(--text-primary)]'}`}
                                                >
                                                    {String(s)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {availableColors.length === 0 && availableSizes.length === 0 && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.15em] premium-text-muted mb-4">Select Style</p>
                                        <div className="flex flex-wrap gap-4">
                                            {variants.map((v, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedVariantIndex(idx);
                                                        setVariantImageIndex(prev => ({ ...prev, [idx]: 0 }));
                                                    }}
                                                    className={`w-16 h-20 overflow-hidden transition-all variant-ring rounded-[10px] ${selectedVariantIndex === idx ? 'active' : 'opacity-60 hover:opacity-100'}`}
                                                >
                                                    {v.images?.length > 0 ? (
                                                        <img src={v.images[0].url} alt={`V${idx}`} className="w-full h-full object-cover rounded-[10px]" />
                                                    ) : (
                                                        <div className="w-full h-full premium-surface flex items-center justify-center text-[10px]">V{idx + 1}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                            <div className="flex items-center border border-[var(--border)] px-2 w-fit">
                                <button className="px-4 py-3 premium-text-muted hover:text-[var(--text-primary)] transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                                <button className="px-4 py-3 premium-text-muted hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setQuantity(Math.min(displayedStock || 99, quantity + 1))} disabled={quantity >= (displayedStock || 99)}>+</button>
                            </div>

                            {displayedStock !== undefined && (
                                <span className={`text-[10px] uppercase tracking-[0.15em] ${displayedStock === 0 ? 'text-[var(--danger)]' : displayedStock <= 3 ? 'text-[var(--accent)]' : 'text-[var(--success)]'}`}>
                                    {displayedStock === 0 ? 'Out of Stock' : displayedStock <= 3 ? `Only ${displayedStock} Left` : `${displayedStock} In Stock`}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 mt-auto">
                            <button
                                onClick={handleAddToCart}
                                disabled={displayedStock === 0 || cartLoading}
                                className="btn-accent w-full py-5 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cartLoading ? 'Processing...' : 'Add to Bag'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={displayedStock === 0}
                                className="btn-outline w-full py-5 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {token ? 'Purchase Now' : 'Login to Purchase'}
                            </button>
                        </div>

                        {cartMessage && (
                            <div className={`mt-6 py-4 text-center text-xs tracking-widest uppercase border ${cartMessage.includes('✅') ? 'border-[var(--success)] text-[var(--success)]' : 'border-[var(--danger)] text-[var(--danger)]'}`}>
                                <div className="flex flex-col items-center gap-2">
                                    <span>{cartMessage.replace('✅', '').replace('❌', '').trim()}</span>
                                    {cartMessage.includes('Added to cart') && (
                                        <button
                                            onClick={() => navigate('/cart')}
                                            className="btn-outline px-3 py-1 text-[10px] uppercase tracking-widest"
                                        >
                                            View Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!token && (
                            <p className="mt-6 text-center text-[10px] uppercase tracking-widest premium-text-muted">Account required for purchase</p>
                        )}

                        <div className="mt-12 pt-8 border-t border-[var(--border)]">
                            <p className="text-[10px] uppercase tracking-[0.15em] premium-text-muted mb-4">Shipping & Returns</p>
                            <div className="flex flex-col sm:flex-row gap-0 border border-[var(--border)] p-1">
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="Enter Postal Code"
                                    className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-[var(--text-secondary)]"
                                />
                                <button
                                    type="button"
                                    onClick={handleCheckPincode}
                                    disabled={deliveryLoading}
                                    className="px-6 py-3 text-[10px] uppercase tracking-widest bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
                                >
                                    {deliveryLoading ? 'Checking...' : 'Check'}
                                </button>
                            </div>
                            {deliveryError && <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--danger)]">{deliveryError}</p>}
                            {deliveryInfo && (
                                <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--success)]">
                                    {deliveryInfo?.message} • By {deliveryInfo?.estimatedDeliveryDate}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <section className="mt-20 sm:mt-32 pt-12 sm:pt-16 border-t border-[var(--border)]">
                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="w-full lg:w-1/3">
                            <h2 className="font-playfair text-3xl mb-2">Reflections</h2>
                            <p className="text-xs uppercase tracking-widest premium-text-muted mb-8">Client Experiences</p>

                            <div className="flex items-end gap-4 mb-10">
                                <span className="font-playfair text-6xl">{Number(averageRating || 0).toFixed(1)}</span>
                                <div className="pb-2">
                                    <p className="text-lg tracking-[0.2em] text-[var(--accent)]">{renderStars(averageRating)}</p>
                                    <p className="text-[10px] uppercase tracking-widest premium-text-muted mt-1">Based on {totalReviews || 0} reviews</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitReview} className="premium-surface p-8">
                                <p className="text-xs uppercase tracking-widest mb-6">Leave a reflection</p>
                                <div className="flex gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className={`text-xl transition-colors ${reviewRating >= star ? 'text-[var(--text-primary)]' : 'text-[var(--border)]'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Detail your experience..."
                                    className="w-full bg-transparent border-b border-[var(--border)] focus:border-[var(--text-primary)] transition-colors py-3 min-h-[100px] text-sm focus:outline-none resize-none mb-6 placeholder:text-[var(--text-secondary)]"
                                />
                                <button
                                    type="submit"
                                    disabled={reviewSubmitting}
                                    className="btn-accent w-full py-4 text-[10px] uppercase tracking-[0.2em]"
                                >
                                    {reviewSubmitting ? 'Submitting...' : 'Submit Reflection'}
                                </button>
                                {reviewMessage && <p className="mt-4 text-[10px] uppercase tracking-wider text-center">{reviewMessage}</p>}
                            </form>
                        </div>

                        <div className="w-full lg:w-2/3">
                            {reviewLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-8 h-8 border border-t-transparent border-[var(--text-primary)] rounded-full animate-spin"></div>
                                </div>
                            ) : reviews?.length > 0 ? (
                                <div className="grid gap-8 sm:grid-cols-2">
                                    {reviews.map((review) => {
                                        const currentUserId = getCurrentUserId()
                                        const reviewUserId = review?.user?._id
                                        const canDelete = token && currentUserId && reviewUserId && String(currentUserId) === String(reviewUserId)

                                        return (
                                            <div key={review?._id} className="p-8 border border-[var(--border)]">
                                                <div className="flex justify-between items-start mb-4">
                                                    <p className="text-sm font-medium tracking-wide">{review?.user?.fullname || 'Anonymous'}</p>
                                                    <p className="text-sm text-[var(--accent)] tracking-[0.1em]">{renderStars(review?.rating)}</p>
                                                </div>
                                                <p className="text-sm font-light leading-relaxed premium-text-muted mb-4">"{review?.comment || 'No comment provided.'}"</p>
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteReview(review?._id)}
                                                        className="text-[10px] uppercase tracking-widest text-[var(--danger)] hover:underline underline-offset-4"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center border border-[var(--border)] p-12">
                                    <p className="text-xs uppercase tracking-widest premium-text-muted">No reflections yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default ProductDetails
