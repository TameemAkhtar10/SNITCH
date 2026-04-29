import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import UseProduct from '../Hooks/UseProduct'
import './Home.css'

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const Home = () => {
    const products = useSelector((state) => state.product.products)
    const user = useSelector((state) => state.auth.user)
    const initializing = useSelector((state) => state.auth.initializing)
    const { handleGetAllProducts } = UseProduct()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const token = getToken()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                await handleGetAllProducts()
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const handleBuyClick = (productId) => {
        if (user?.role === 'seller') {
            navigate(`/seller/edit-product/${productId}`)
        } else {
            navigate(`/product/${productId}`)
        }
    }

    const filteredProducts = products?.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const categories = ['All Products', 'Electronics', 'Fashion', 'Books', 'Home & Garden']

    return (
        <div className='home-root'>
            {/* Navigation Bar */}
            <nav className='home-navbar'>
                <div className='navbar-content'>
                    <div className='navbar-logo'>
                        <h2>SNITCH</h2>
                    </div>
                    <div className='navbar-right'>
                        {token && !initializing ? (
                            <div className='profile-menu-wrapper'>
                                <button
                                    className='profile-icon-btn'
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                >
                                    👤
                                </button>
                                {profileMenuOpen && (
                                    <div className='profile-dropdown'>
                                        <div className='profile-header'>
                                            <p className='profile-name'>{user?.name || 'User'}</p>
                                            <p className='profile-email'>{user?.email}</p>
                                            {user?.role === 'seller' && <p style={{ fontSize: '12px', color: '#888' }}>👑 Seller</p>}
                                        </div>
                                        <hr className='profile-divider' />

                                        {user?.role === 'seller' ? (
                                            <>
                                                <button
                                                    className='profile-menu-item'
                                                    onClick={() => {
                                                        setProfileMenuOpen(false)
                                                        navigate('/seller')
                                                    }}
                                                >
                                                    📊 Seller Dashboard
                                                </button>
                                                <button
                                                    className='profile-menu-item'
                                                    onClick={() => {
                                                        setProfileMenuOpen(false)
                                                        navigate('/seller/create-product')
                                                    }}
                                                >
                                                    ➕ Add Product
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className='profile-menu-item'
                                                onClick={() => {
                                                    setProfileMenuOpen(false)
                                                }}
                                            >
                                                ❤️ My Orders
                                            </button>
                                        )}

                                        <hr className='profile-divider' />
                                        <button
                                            className='profile-menu-item logout'
                                            onClick={() => {
                                                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
                                                setProfileMenuOpen(false)
                                                navigate('/login')
                                            }}
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : initializing ? (
                            <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
                        ) : (
                            <button className='navbar-login-btn' onClick={() => navigate('/login')}>
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section with Search */}
            <section className='hero-section'>
                <div className='hero-overlay'></div>
                <div className='hero-content'>
                    <h1 className='hero-title'>Discover Premium Products</h1>
                    <p className='hero-subtitle'>Shop from the finest sellers worldwide</p>

                    {/* Search Bar */}
                    <div className='search-container'>
                        <input
                            type='text'
                            className='search-input'
                            placeholder='Search products, categories...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className='search-btn'>
                            <span>🔍</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <section className='category-section'>
                <div className='category-container'>
                    <h3 className='category-title'>Browse Categories</h3>
                    <div className='category-list'>
                        {categories.map((category, idx) => (
                            <button
                                key={idx}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Products Section */}
            <section className='products-section'>
                <div className='products-container'>
                    {/* Header */}
                    <div className='products-header'>
                        <div>
                            <p className='products-overline'>AVAILABLE NOW</p>
                            <h2 className='products-title'>
                                {searchQuery ? `Results for "${searchQuery}"` : 'Featured Collection'}
                            </h2>
                            <p className='products-subtitle'>
                                {filteredProducts.length} amazing products to discover
                            </p>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className='loading-container'>
                            <div className='loader'></div>
                            <p>Loading premium products...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className='products-grid'>
                            {filteredProducts.map((product, idx) => (
                                <div key={product._id} className='product-card' style={{ animationDelay: `${idx * 0.05}s` }}>
                                    {/* Image Container */}
                                    <div className='product-image-wrapper'>
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.title}
                                                className='product-image'
                                            />
                                        ) : (
                                            <div className='product-image-placeholder'>
                                                <span>No Image</span>
                                            </div>
                                        )}
                                        <div className='product-overlay'>
                                            <button
                                                className='product-view-details-btn'
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                        <span className='product-badge'>New</span>
                                    </div>

                                    {/* Product Info */}
                                    <div className='product-info'>
                                        <h3 className='product-title'>{product.title}</h3>
                                        <p className='product-description'>
                                            {product.description.length > 60
                                                ? product.description.substring(0, 60) + '...'
                                                : product.description}
                                        </p>

                                        {/* Price and Action */}
                                        <div className='product-footer'>
                                            <div className='product-price-section'>
                                                <span className='product-price'>₹{product.price?.amount}</span>
                                                {product.price?.currency && (
                                                    <span className='product-currency'>{product.price.currency}</span>
                                                )}
                                            </div>
                                            <button
                                                className='add-to-cart-btn'
                                                onClick={() => handleBuyClick(product._id)}
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='empty-state'>
                            <p className='empty-icon'>🔍</p>
                            <p className='empty-title'>No products found</p>
                            <p className='empty-subtitle'>Try adjusting your search or filters</p>
                            <button
                                className='empty-reset-btn'
                                onClick={() => setSearchQuery('')}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer CTA */}
            <section className='footer-cta'>
                <div className='cta-content'>
                    <h3>Join Our Community</h3>
                    <p>Get exclusive deals and early access to new products</p>
                    <button className='cta-button' onClick={() => navigate('/register')}>
                        Sign Up Today
                    </button>
                </div>
            </section>
        </div>
    )
}

export default Home
