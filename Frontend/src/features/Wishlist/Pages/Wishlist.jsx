import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UseWishlist from '../Hooks/UseWishlist'

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

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

const HeartIcon = ({ filled = false }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 8.6c0 5.2-8.8 11-8.8 11S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 11.5 6.2L12 6.8l.5-.6a4.6 4.6 0 0 1 8.3 2.4Z" />
    </svg>
)

const EmptyIllustration = () => (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-32 h-32 mx-auto mb-6 opacity-50">
        <rect x="30" y="30" width="140" height="140" rx="10" />
        <path d="M100 60v80M60 100h80" strokeLinecap="round" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
)

const Wishlist = () => {
    const navigate = useNavigate()
    const { wishlistItems, fetchWishlist, removeFromWishlistHandler } = UseWishlist()
    const loading = useSelector((state) => state.wishlist?.loading || false)
    const error = useSelector((state) => state.wishlist?.error || null)
    const token = getToken()
    const { isDark, toggleDark } = useDarkMode()

    useEffect(() => {
        if (token) {
            fetchWishlist().catch(() => { })
        }
    }, [token, fetchWishlist])

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await removeFromWishlistHandler(productId)
        } catch (err) {
            console.error('Failed to remove from wishlist:', err)
        }
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

                .glass-header {
                    background: color-mix(in srgb, var(--bg-primary) 88%, transparent);
                    border-bottom: 1px solid var(--border);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }

                .wishlist-card {
                    transition: all 0.3s ease;
                }
                .wishlist-card:hover {
                    transform: translateY(-4px);
                }

                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            `}</style>

            <header className="sticky top-0 z-40 glass-header flex items-center justify-between px-4 py-3 sm:px-12 sm:py-5">
                <button
                    onClick={() => navigate('/')}
                    className="shrink-0 text-[8px] uppercase tracking-widest whitespace-nowrap premium-text-muted hover:text-(--text-primary) transition-colors text-left"
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
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
                    </span>
                    <button
                        onClick={() => {
                            toggleDark()
                        }}
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

            <main className="min-h-screen">
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
                    <div className="mb-16 border-b border-[var(--border)] pb-8">
                        <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Personal Collection</p>
                        <h1 className="font-playfair text-5xl sm:text-6xl mb-4">Your Wishlist</h1>
                        <p className="text-sm font-light premium-text-muted max-w-2xl">
                            Curated pieces you've saved for later. Explore and add them to your collection whenever you're ready.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="w-12 h-12 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin mb-4"></div>
                            <p className="tracking-[0.2em] text-xs font-medium premium-text-muted uppercase">Loading Wishlist...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-40 text-center border border-[var(--border)]">
                            <p className="text-lg font-light mb-6">{error}</p>
                            <button
                                onClick={() => fetchWishlist()}
                                className="btn-outline px-8 py-3 text-xs uppercase tracking-[0.2em]"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : wishlistItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {wishlistItems.map((product) => (
                                <div key={product._id} className="wishlist-card group flex flex-col">
                                    <div className="relative aspect-[3/4] w-full bg-[var(--bg-secondary)] overflow-hidden mb-6 rounded-[10px]">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.title}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100 rounded-[10px]"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest premium-text-muted">No Media</div>
                                        )}

                                        <button
                                            onClick={() => handleRemoveFromWishlist(product._id)}
                                            className="absolute top-4 right-4 p-2 rounded-full border border-[var(--border)] bg-[var(--bg-primary)]/80 text-[var(--danger)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[var(--danger)] opacity-0 group-hover:opacity-100"
                                            aria-label="Remove from wishlist"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-playfair text-xl transition-colors group-hover:text-[var(--accent)] line-clamp-1 flex-1 pr-4">{product.title}</h3>
                                        </div>

                                        <p className="text-xs font-light premium-text-muted line-clamp-2 mb-6">
                                            {product.description}
                                        </p>

                                        <div className="mt-auto flex justify-between items-center border-t border-[var(--border)] pt-4">
                                            <span className="text-sm font-light">
                                                {product.price?.currency === 'INR' ? '₹' : ''}{product.price?.amount?.toLocaleString('en-IN') || '0'}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/product/${product._id}`)}
                                                className="text-[10px] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 text-center border border-[var(--border)]">
                            <EmptyIllustration />
                            <h2 className="font-playfair text-3xl mb-4">Your Wishlist is Empty</h2>
                            <p className="text-sm font-light premium-text-muted mb-10 max-w-md">
                                Start adding your favorite pieces to your wishlist. Explore our curated collection and save items for later.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn-accent px-10 py-4 text-xs uppercase tracking-[0.2em]"
                            >
                                Explore Collection
                            </button>
                        </div>
                    )}
                </div>
            </main >
        </div >
    )
}

export default Wishlist
