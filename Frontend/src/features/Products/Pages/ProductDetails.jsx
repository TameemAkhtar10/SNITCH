import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UseProduct from '../Hooks/UseProduct'
import './ProductDetails.css'

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const ProductDetails = () => {
    const { productId } = useParams()
    const navigate = useNavigate()
    const token = getToken()

    const { currentProduct: product, loading, error } = useSelector((state) => state.product)

    // Debug: log variants structure
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

    const getVariantAttr = (variant, key) => {
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
    }

    const variants = Array.isArray(product?.variants) ? product.variants : []
    const selectedVariant = selectedVariantIndex !== null ? variants?.[selectedVariantIndex] : null

    const displayedPrice = selectedVariant?.price?.amount ?? product?.price?.amount
    const displayedCurrency = selectedVariant?.price?.currency ?? product?.price?.currency
    const displayedStock = selectedVariant?.stock ?? product?.stock

    const availableColors = Array.from(
        new Set(variants.map(v => getVariantAttr(v, 'color')).filter(Boolean))
    )

    const availableSizes = Array.from(
        new Set(variants.map(v => getVariantAttr(v, 'size')).filter(Boolean))
    )

    const selectedColor = selectedVariant ? getVariantAttr(selectedVariant, 'color') : null
    const selectedSize = selectedVariant ? getVariantAttr(selectedVariant, 'size') : null

    const chooseVariantIndex = ({ color, size }) => {
        if (!variants.length) return null

        const exact = variants.findIndex(v => {
            const vColor = getVariantAttr(v, 'color')
            const vSize = getVariantAttr(v, 'size')
            return (color ? vColor === color : true) && (size ? vSize === size : true)
        })
        if (exact !== -1) return exact

        if (color) {
            const byColor = variants.findIndex(v => getVariantAttr(v, 'color') === color)
            if (byColor !== -1) return byColor
        }

        if (size) {
            const bySize = variants.findIndex(v => getVariantAttr(v, 'size') === size)
            if (bySize !== -1) return bySize
        }

        return 0
    }

    const handleSelectColor = (color) => {
        const nextIndex = chooseVariantIndex({ color, size: selectedSize })
        if (nextIndex === null) return
        setSelectedVariantIndex(nextIndex)
        setVariantImageIndex(prev => ({ ...prev, [nextIndex]: 0 }))
    }

    const handleSelectSize = (size) => {
        const nextIndex = chooseVariantIndex({ color: selectedColor, size })
        if (nextIndex === null) return
        setSelectedVariantIndex(nextIndex)
        setVariantImageIndex(prev => ({ ...prev, [nextIndex]: 0 }))
    }

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
        setCurrentImageIndex(0)
        setVariantImageIndex({})
        return () => {
            handleClearCurrentProduct()
        }
    }, [productId, handleClearCurrentProduct, handleGetProductById])

    // Removed auto-selection of first variant to show base product by default
    // Users can manually select variants using color/size filters

    const handleBuy = () => {
        if (!token) {
            navigate('/login', { state: { from: `/product/${productId}` } })
        } else {
            navigate(`/checkout/${productId}`, {
                state: {
                    quantity,
                    variantId: selectedVariant?._id,
                    variantIndex: selectedVariantIndex,
                    color: selectedColor,
                    size: selectedSize
                }
            })
        }
    }

    if (loading) {
        return (
            <div className='product-details-root'>
                <div className='loading-state'>
                    <div className='loader'></div>
                    <p>Loading product...</p>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className='product-details-root'>
                <div className='error-state'>
                    <p>{error || 'Product not found'}</p>
                    <button onClick={() => navigate('/')} className='back-btn'>Back to Products</button>
                </div>
            </div>
        )
    }

    return (
        <div className='product-details-root'>
            <button onClick={() => navigate('/')} className='product-details-back'>
                ← Back to Products
            </button>

            <div className='product-details-container'>
                {/* Product Image Carousel */}
                <div className='product-details-image-section'>
                    {activeImages && activeImages.length > 0 ? (
                        <div className='image-carousel-wrapper'>
                            <div className='image-carousel-container'>
                                <img
                                    src={activeImages[activeImageIndex].url}
                                    alt={`${product.title} - Image ${activeImageIndex + 1}`}
                                    className='product-details-image'
                                />

                                {/* Navigation Buttons */}
                                {activeImages.length > 1 && (
                                    <>
                                        <button
                                            className='carousel-nav-btn carousel-prev'
                                            onClick={handlePrevImage}
                                            aria-label='Previous image'
                                        >
                                            ‹
                                        </button>
                                        <button
                                            className='carousel-nav-btn carousel-next'
                                            onClick={handleNextImage}
                                            aria-label='Next image'
                                        >
                                            ›
                                        </button>

                                        <div className='image-counter'>
                                            {activeImageIndex + 1} / {activeImages.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Images */}
                            {activeImages.length > 1 && (
                                <div className='image-thumbnails'>
                                    {activeImages.map((img, idx) => (
                                        <button
                                            key={img.url + idx}
                                            type="button"
                                            className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                                            onClick={() => {
                                                if (selectedVariantIndex !== null) {
                                                    setVariantImageIndex(prev => ({ ...prev, [selectedVariantIndex]: idx }))
                                                    return
                                                }
                                                setCurrentImageIndex(idx)
                                            }}
                                            aria-label={`View image ${idx + 1}`}
                                        >
                                            <img src={img.url} alt={`${product.title} thumbnail ${idx + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='product-details-image-placeholder'>
                            No Image
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className='product-details-info'>
                    <h1 className='product-details-title'>{product.title}</h1>

                    <div className='product-details-price-section'>
                        <span className='product-details-price'>₹{displayedPrice}</span>
                        {displayedCurrency && (
                            <span className='product-details-currency'>{displayedCurrency}</span>
                        )}
                    </div>

                    <div className='product-details-divider'></div>

                    <div className='product-details-description-section'>
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    {/* Product Details */}
                    <div className='product-details-specs'>
                        {product.category && (
                            <div className='spec-row'>
                                <span className='spec-label'>Category:</span>
                                <span className='spec-value'>{product.category}</span>
                            </div>
                        )}
                       
                        {product.createdAt && (
                            <div className='spec-row'>
                                <span className='spec-label'>Listed:</span>
                                <span className='spec-value'>{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    <div className='product-details-divider'></div>

                    {variants.length > 0 && (
                        <div className="pd-options">
                            {availableColors.length > 0 && (
                                <div className="pd-option-group">
                                    <div className="pd-option-label">COLOR</div>
                                    <div className="pd-option-buttons">
                                        {availableColors.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                className={`pd-option-btn ${selectedColor === c ? 'pd-option-btn-active' : ''}`}
                                                onClick={() => handleSelectColor(c)}
                                            >
                                                {String(c).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {availableSizes.length > 0 && (
                                <div className="pd-option-group">
                                    <div className="pd-option-label">SIZE</div>
                                    <div className="pd-option-buttons">
                                        {availableSizes.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                className={`pd-option-btn ${selectedSize === s ? 'pd-option-btn-active' : ''}`}
                                                onClick={() => handleSelectSize(s)}
                                            >
                                                {String(s).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            
                        </div>
                    )}

                    {variants.length > 0 && availableColors.length === 0 && availableSizes.length === 0 && (
                        <div className="pd-variants-fallback">
                            <div className="pd-variant-label">CHOOSE YOUR VARIANT</div>
                            <div className="pd-variant-thumbnails">
                                {variants.map((variant, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`pd-variant-thumb ${selectedVariantIndex === idx ? 'pd-variant-thumb-active' : ''}`}
                                        onClick={() => {
                                            setSelectedVariantIndex(idx)
                                            setVariantImageIndex(prev => ({ ...prev, [idx]: 0 }))
                                        }}
                                        title={`Variant ${idx + 1}`}
                                    >
                                        {variant.images && variant.images.length > 0 ? (
                                            <>
                                                <img src={variant.images[0].url} alt={`Variant ${idx + 1}`} />
                                                <div className="pd-variant-badge">{idx + 1}</div>
                                            </>
                                        ) : (
                                            <div className="pd-variant-thumb-placeholder">V{idx + 1}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {displayedStock !== undefined && (
                                <div className="pd-stock-row">
                                    <span className="pd-stock-label">{displayedStock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                                    {displayedStock > 0 && (
                                        <span className="pd-stock-value">{displayedStock} available</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className='product-details-divider'></div>
                    <div className='product-details-buy-section'>
                        <div className='quantity-control'>
                            <label>Quantity:</label>
                            <input
                                type='number'
                                min='1'
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className='quantity-input'
                            />
                        </div>

                        <div className='pd-buy-actions'>
                            <button
                                className='pd-add-to-cart-btn'
                                onClick={handleBuy}
                                disabled={displayedStock === 0}
                            >
                                ADD TO CART
                            </button>
                            <button
                                className='pd-buy-now-btn'
                                onClick={handleBuy}
                                disabled={displayedStock === 0}
                            >
                                {token ? 'BUY NOW' : 'LOGIN TO BUY'}
                            </button>
                        </div>

                        {!token && (
                            <p className='login-hint'>Please login to make a purchase</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

export default ProductDetails
