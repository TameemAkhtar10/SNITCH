import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import UseProduct from '../Hooks/UseProduct'
import UseWishlist from '../../Wishlist/Hooks/UseWishlist.js'
import { getRecentlyViewed } from '../services/recentlyViewed.service.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { setuser as setAuthUser } from '../../auth/state/auth.slice.js'
import Navbar from '../../../components/Navbar.jsx'

const LOADER_TEXT = 'SNITCH'
const LOADER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'
const HERO_VIDEO_URL = '/Dark Minimalism Fashion Editorial.mp4'
const MARQUEE_TEXT = 'SNITCH • THE NEW COLLECTION • PREMIUM FASHION • '

const getRandomLoaderChar = () => LOADER_CHARS[Math.floor(Math.random() * LOADER_CHARS.length)]

const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
};

const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return storedTheme === 'dark' || (!storedTheme && prefersDark);
    });

    const toggleDark = () => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    return { isDark, toggleDark };
};

const Home = () => {
    const dispatch = useDispatch()
    const products = useSelector((state) => state.product.products)
    const user = useSelector((state) => state.auth.user)
    const initializing = useSelector((state) => state.auth.initializing)
    const { handleGetAllProducts } = UseProduct()
    const { wishlistItems, fetchWishlist } = UseWishlist()
    const { handlerLogout } = useAuth()
    const navigate = useNavigate()
    const searchInputRef = useRef(null)
    const catalogSectionRef = useRef(null)
    const heroSectionRef = useRef(null)
    const heroTextContainerRef = useRef(null)
    const heroTitleTopRef = useRef(null)
    const heroTitleBottomRef = useRef(null)
    const heroSubtitleRef = useRef(null)
    const heroCtaRef = useRef(null)
    const marqueeTrackRef = useRef(null)
    const productGridRef = useRef(null)
    const loaderRef = useRef(null)
    const loaderTextRef = useRef(null)
    const mainContentRef = useRef(null)
    const scrambleIntervalRef = useRef(null)
    const exitTimeoutRef = useRef(null)
    const isAnimatingRef = useRef(false)
    const [loading, setLoading] = useState(true)
    const [introLoaderVisible, setIntroLoaderVisible] = useState(true)
    const [loaderText, setLoaderText] = useState(LOADER_TEXT)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchInputOpen, setSearchInputOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('All Products')
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [recentlyViewed, setRecentlyViewed] = useState([])
    const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(false)
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const token = getToken()
    const cartItems = useSelector((state) => state.cart?.items || [])
    const cartItemCount = cartItems.length
    const wishlistItemCount = wishlistItems.length

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                await handleGetAllProducts()
                console.log(user);

            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [handleGetAllProducts, user])

    // Debounced search and filter effect
    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            setLoading(true)
            try {
                const params = {}
                if (searchQuery) params.search = searchQuery
                if (selectedCategory && selectedCategory !== 'All Products') params.category = selectedCategory
                if (minPrice) params.minPrice = minPrice
                if (maxPrice) params.maxPrice = maxPrice

                await handleGetAllProducts(params)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(debounceTimer)
    }, [searchQuery, selectedCategory, minPrice, maxPrice, handleGetAllProducts])

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            if (!token) {
                setRecentlyViewed([])
                return
            }

            try {
                setRecentlyViewedLoading(true)
                const response = await getRecentlyViewed()
                setRecentlyViewed(response?.recentlyViewed || [])
            } catch {
                setRecentlyViewed([])
            } finally {
                setRecentlyViewedLoading(false)
            }
        }

        fetchRecentlyViewed()
    }, [token])

    useEffect(() => {
        if (!token) return
        fetchWishlist().catch(() => { })
    }, [token, fetchWishlist])

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [drawerOpen])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const searchParam = params.get('search')
        if (searchParam) {
            setSearchQuery(searchParam)
        }
    }, [])

    useEffect(() => {
        if (searchInputOpen) {
            searchInputRef.current?.focus()
        }
    }, [searchInputOpen])

    useEffect(() => {
        const heroSectionElement = heroSectionRef.current
        const heroTextContainerElement = heroTextContainerRef.current

        if (!heroSectionElement || !heroTextContainerElement) return

        let isActive = true
        let gsapModule = null
        let scrollTriggerModule = null

        const handleMouseMove = (event) => {
            if (!gsapModule) return

            const bounds = heroSectionElement.getBoundingClientRect()
            const deltaX = event.clientX - (bounds.left + bounds.width / 2)
            const deltaY = event.clientY - (bounds.top + bounds.height / 2)
            const rotateY = Math.max(-8, Math.min(8, (deltaX / bounds.width) * 16))
            const rotateX = Math.max(-8, Math.min(8, -(deltaY / bounds.height) * 16))

            gsapModule.to(heroTextContainerElement, {
                rotateX,
                rotateY,
                duration: 0.45,
                ease: 'power3.out',
                overwrite: true,
            })
        }

        const handleMouseLeave = () => {
            if (!gsapModule) return

            gsapModule.to(heroTextContainerElement, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: 'power3.out',
                overwrite: true,
            })
        }

        heroSectionElement.addEventListener('mousemove', handleMouseMove)
        heroSectionElement.addEventListener('mouseleave', handleMouseLeave)

        import('gsap').then(({ gsap }) => {
            if (!isActive) return
            gsapModule = gsap
        })

        return () => {
            isActive = false
            heroSectionElement.removeEventListener('mousemove', handleMouseMove)
            heroSectionElement.removeEventListener('mouseleave', handleMouseLeave)
            if (gsapModule) {
                gsapModule.killTweensOf('*')
            }
            if (scrollTriggerModule) {
                scrollTriggerModule.getAll().forEach((trigger) => trigger.kill())
            }
        }
    }, [])

    useEffect(() => {
        if (introLoaderVisible) return

        let isActive = true
        let gsapModule = null
        let scrollTriggerModule = null
        let heroTimeline = null

        import('gsap').then(({ gsap }) => {
            if (!isActive) return
            gsapModule = gsap
            return import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                if (!isActive) return
                scrollTriggerModule = ScrollTrigger
                gsapModule.registerPlugin(scrollTriggerModule)
                heroTimeline = gsapModule.timeline()

                heroTimeline
                    .fromTo(heroTitleTopRef.current, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' })
                    .fromTo(heroTitleBottomRef.current, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.5')
                    .fromTo(heroSubtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' }, '-=0.25')
                    .fromTo(heroCtaRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2')
            })
        })

        return () => {
            isActive = false
            heroTimeline?.kill()
            if (gsapModule) {
                gsapModule.killTweensOf('*')
            }
            if (scrollTriggerModule) {
                scrollTriggerModule.getAll().forEach((trigger) => trigger.kill())
            }
        }
    }, [introLoaderVisible])

    useEffect(() => {
        if (introLoaderVisible || loading || !filteredProducts.length || !productGridRef.current) return

        const productCards = productGridRef.current.querySelectorAll('.product-card')

        if (!productCards.length) return

        const scopeElement = productGridRef.current
        let isActive = true
        let gsapModule = null
        let scrollTriggerModule = null
        let ctx = null

        import('gsap').then(({ gsap }) => {
            if (!isActive) return
            gsapModule = gsap
            return import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                if (!isActive) return
                scrollTriggerModule = ScrollTrigger
                gsapModule.registerPlugin(scrollTriggerModule)

                ctx = gsapModule.context(() => {
                    gsapModule.from(productCards, {
                        scrollTrigger: {
                            trigger: scopeElement,
                            start: 'top 80%',
                        },
                        y: 60,
                        opacity: 0,
                        stagger: 0.1,
                        duration: 0.6,
                        ease: 'power2.out',
                    })
                }, scopeElement)
            })
        })

        return () => {
            isActive = false
            ctx?.revert()
            if (gsapModule) {
                gsapModule.killTweensOf('*')
            }
            if (scrollTriggerModule) {
                scrollTriggerModule.getAll().forEach((trigger) => trigger.kill())
            }
        }
    }, [introLoaderVisible, loading, filteredProducts.length])

    useEffect(() => {
        const marqueeElement = marqueeTrackRef.current

        if (!marqueeElement) return

        let isActive = true
        let gsapModule = null
        let scrollTriggerModule = null
        let tween = null

        import('gsap').then(({ gsap }) => {
            if (!isActive) return
            gsapModule = gsap
            return import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                if (!isActive) return
                scrollTriggerModule = ScrollTrigger
                gsapModule.registerPlugin(scrollTriggerModule)
                tween = gsapModule.to(marqueeElement, {
                    x: '-50%',
                    duration: 15,
                    repeat: -1,
                    ease: 'none',
                })
            })
        })

        return () => {
            isActive = false
            tween?.kill()
            if (gsapModule) {
                gsapModule.killTweensOf('*')
            }
            if (scrollTriggerModule) {
                scrollTriggerModule.getAll().forEach((trigger) => trigger.kill())
            }
        }
    }, [])

    useEffect(() => {
        const loaderElement = loaderRef.current
        const loaderTextElement = loaderTextRef.current
        const mainContentElement = mainContentRef.current

        if (!loaderElement || !loaderTextElement || !mainContentElement || isAnimatingRef.current) return

        isAnimatingRef.current = true
        setLoaderText(Array.from({ length: LOADER_TEXT.length }, () => getRandomLoaderChar()).join(''))

        let isActive = true
        let gsapModule = null
        let scrollTriggerModule = null

        import('gsap').then(({ gsap }) => {
            if (!isActive) return
            gsapModule = gsap
            return import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                if (!isActive) return
                scrollTriggerModule = ScrollTrigger
                gsapModule.registerPlugin(scrollTriggerModule)
                gsapModule.set(mainContentElement, { opacity: 0 })
            })
        })

        let resolvedCount = 0

        scrambleIntervalRef.current = window.setInterval(() => {
            resolvedCount = Math.min(resolvedCount + 1, LOADER_TEXT.length)

            const nextText = LOADER_TEXT.split('').map((character, index) => {
                if (index < resolvedCount) {
                    return character
                }

                return getRandomLoaderChar()
            }).join('')

            setLoaderText(nextText)

            if (resolvedCount >= LOADER_TEXT.length) {
                window.clearInterval(scrambleIntervalRef.current)
                scrambleIntervalRef.current = null

                exitTimeoutRef.current = window.setTimeout(() => {
                    if (!gsapModule) return

                    gsapModule.to(mainContentElement, {
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power2.out',
                    })

                    gsapModule.to(loaderElement, {
                        y: '-100%',
                        duration: 0.8,
                        ease: 'power4.inOut',
                        onComplete: () => {
                            setIntroLoaderVisible(false)
                            gsapModule.set(loaderElement, { display: 'none' })
                        },
                    })
                }, 800)
            }
        }, 80)

        return () => {
            isActive = false
            if (scrambleIntervalRef.current) {
                window.clearInterval(scrambleIntervalRef.current)
                scrambleIntervalRef.current = null
            }

            if (exitTimeoutRef.current) {
                window.clearTimeout(exitTimeoutRef.current)
                exitTimeoutRef.current = null
            }

            isAnimatingRef.current = false
            if (gsapModule) {
                gsapModule.killTweensOf('*')
            }
            if (scrollTriggerModule) {
                scrollTriggerModule.getAll().forEach((trigger) => trigger.kill())
            }
        }
    }, [])

    const handleSearchFocus = () => {
        setSearchInputOpen(true)
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        const query = searchQuery.trim()
        if (query) {
            navigate(`/?search=${encodeURIComponent(query)}`)
            setSearchInputOpen(false)
            goToSection(catalogSectionRef)
        }
    }

    const closeDrawer = () => setDrawerOpen(false)

    const goToSection = (sectionRef) => {
        closeDrawer()
        sectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const handleProfileClick = () => {
        closeDrawer()
        if (token && !initializing) {
            setProfileMenuOpen((prev) => !prev)
            return
        }
        navigate('/login')
    }

    const drawerLinks = [
        { label: 'Home', action: () => { closeDrawer(); window.scrollTo({ top: 0, behavior: 'smooth' }) } },
        { label: 'Collection', action: () => goToSection(catalogSectionRef) },
        { label: 'Search', action: () => { closeDrawer(); handleSearchFocus() } },
        { label: 'Cart', action: () => { closeDrawer(); navigate('/cart') } },
        ...(token && user?.role !== 'seller' ? [{ label: 'Wishlist', action: () => { closeDrawer(); navigate('/wishlist') } }] : []),
        ...(token && user?.role !== 'seller' ? [{ label: 'Wallet', action: () => { closeDrawer(); navigate('/wallet') } }] : []),
        { label: user?.role === 'seller' ? 'Seller Studio' : 'Create Account', action: () => { closeDrawer(); navigate(user?.role === 'seller' ? '/seller' : '/register') } },
    ]

    const handleBuyClick = (productId) => {
        if (user?.role === 'seller') {
            navigate(`/seller/edit-product/${productId}`)
        } else {
            navigate(`/product/${productId}`)
        }
    }

    const handleLogout = async () => {
        try {
            await handlerLogout()
            dispatch(setAuthUser(null))
            setProfileMenuOpen(false)
            closeDrawer()
            navigate('/login')
        } catch (error) {
            console.log(error)
        }
    }

    const filteredProducts = products || []

    const categories = ['All Products', 'Men', 'Women', 'Kids', 'Accessories', 'Seasonal']

    const { isDark, toggleDark } = useDarkMode()
    const skeletonCards = Array.from({ length: 7 })

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
            {introLoaderVisible && (
                <div
                    ref={loaderRef}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
                >
                    <div
                        ref={loaderTextRef}
                        className="flex items-center gap-[0.35em] font-playfair text-[clamp(4rem,8vw,8rem)] tracking-[0.35em] text-white"
                    >
                        {loaderText}
                    </div>
                </div>
            )}
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
                    background: color-mix(in srgb, var(--bg-primary) 78%, transparent);
                    border-bottom: 1px solid var(--border);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                }

                .nav-icon-button svg,
                .drawer-icon-button svg {
                    width: 1.375rem;
                    height: 1.375rem;
                    stroke: currentColor;
                }

                @media (max-width: 640px) {
                    .nav-icon-button svg,
                    .drawer-icon-button svg {
                        width: 1.375rem;
                        height: 1.375rem;
                    }
                }

                .drawer-panel {
                    background: color-mix(in srgb, var(--bg-primary) 92%, transparent);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                }

                .drawer-link {
                    transition: transform 0.3s ease, color 0.3s ease, border-color 0.3s ease;
                }
                .drawer-link:hover {
                    transform: translateX(4px);
                }

                .hero-bg {
                    background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
                }

                .input-premium {
                    background-color: transparent;
                    border-bottom: 1px solid var(--border);
                    color: var(--text-primary);
                    transition: border-color 0.3s ease;
                }
                .input-premium:focus {
                    outline: none;
                    border-bottom-color: var(--text-primary);
                }

                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

                @keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

.skeleton {
    background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--bg-secondary) 85%, transparent) 25%,
        color-mix(in srgb, var(--text-primary) 12%, var(--bg-secondary)) 50%,
        color-mix(in srgb, var(--bg-secondary) 85%, transparent) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
}
            `}</style>

            <div ref={mainContentRef} style={{ opacity: 0 }}>
                <Navbar
                    searchInputOpen={searchInputOpen}
                    setSearchInputOpen={setSearchInputOpen}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    profileMenuOpen={profileMenuOpen}
                    setProfileMenuOpen={setProfileMenuOpen}
                    isDark={isDark}
                    toggleDark={toggleDark}
                    catalogSectionRef={catalogSectionRef}
                    handleSearchFocus={handleSearchFocus}
                    handleSearchSubmit={handleSearchSubmit}
                    handleProfileClick={handleProfileClick}
                    handleLogout={handleLogout}
                    user={user}
                    initializing={initializing}
                    cartItemCount={cartItemCount}
                    wishlistItemCount={wishlistItemCount}
                    drawerLinks={drawerLinks}
                    token={token}
                />

                {token && !initializing && profileMenuOpen && (
                    <div className="absolute right-6 top-24 z-[55] w-64 premium-surface border border-[var(--border)] p-4 shadow-2xl">
                        <div className="px-4 py-4 border-b border-[var(--border)]">
                            <p className="font-playfair text-xl mb-1">{user?.fullname || 'Client'}</p>
                            <p className="text-[10px] tracking-widest uppercase premium-text-muted truncate">{user?.email}</p>
                            {user?.role === 'seller' && <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[var(--accent)]">Curator Account</p>}
                        </div>

                        <div className="flex flex-col gap-2 py-4">
                            {user?.role === 'seller' ? (
                                <>
                                    <button onClick={() => { setProfileMenuOpen(false); navigate('/seller'); }} className="px-4 py-2 text-xs uppercase tracking-widest premium-text-muted hover:text-[var(--text-primary)] text-left transition-colors">
                                        Dashboard
                                    </button>
                                    <button onClick={() => { setProfileMenuOpen(false); navigate('/seller/create-product'); }} className="px-4 py-2 text-xs uppercase tracking-widest premium-text-muted hover:text-[var(--text-primary)] text-left transition-colors">
                                        Add Piece
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }} className="px-4 py-2 text-xs uppercase tracking-widest premium-text-muted hover:text-[var(--text-primary)] text-left transition-colors">
                                        Profile
                                    </button>
                                    <button onClick={() => {
                                        navigate('/orders'); setProfileMenuOpen(false);
                                    }} className="px-4 py-2 text-xs uppercase tracking-widest premium-text-muted hover:text-[var(--text-primary)] text-left transition-colors">
                                        Purchase History
                                    </button>
                                    <button onClick={() => {
                                        navigate('/wallet'); setProfileMenuOpen(false);
                                    }} className="px-4 py-2 text-xs uppercase tracking-widest premium-text-muted hover:text-[var(--text-primary)] text-left transition-colors">
                                        Wallet
                                    </button>
                                </>
                            )}

                            <button onClick={handleLogout} className="mt-4 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--danger)] text-left transition-colors">
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}

                <main>
                    <section ref={heroSectionRef} className="relative h-screen w-full overflow-hidden bg-black" style={{ perspective: '1000px' }}>
                        <video
                            className="absolute inset-0 h-full w-full object-cover"
                            src={HERO_VIDEO_URL}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            aria-hidden="true"
                            style={{ filter: 'grayscale(1) contrast(1.15) brightness(0.55)' }}
                        />
                        <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />

                        <div
                            ref={heroTextContainerRef}
                            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <h1 className="flex flex-col items-center gap-2 leading-none text-white">
                                <span ref={heroTitleTopRef} className="font-playfair text-[clamp(3.5rem,8vw,7rem)] uppercase tracking-[0.22em] opacity-0">
                                    THE NEW
                                </span>
                                <span ref={heroTitleBottomRef} className="font-playfair text-[clamp(3.5rem,8vw,7rem)] uppercase tracking-[0.22em] opacity-0">
                                    COLLECTION
                                </span>
                            </h1>
                            <p ref={heroSubtitleRef} className="mt-6 max-w-xl text-sm font-light leading-relaxed text-white/80 opacity-0 sm:text-base">
                                Slow-motion editorial energy with a refined, cinematic fashion mood.
                            </p>
                            <button
                                ref={heroCtaRef}
                                onClick={() => goToSection(catalogSectionRef)}
                                className="mt-10 border border-white px-8 py-3 text-[10px] uppercase tracking-[0.3em] text-white transition-colors duration-300 hover:bg-white hover:text-black opacity-0"
                            >
                                Shop Now
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 z-10 w-full overflow-hidden border-t border-white/10 bg-black/25 py-4 backdrop-blur-sm">
                            <div ref={marqueeTrackRef} className="flex w-max items-center gap-10 whitespace-nowrap text-[10px] uppercase tracking-[0.35em] text-white/85">
                                <span>{MARQUEE_TEXT}</span>
                                <span>{MARQUEE_TEXT}</span>
                            </div>
                        </div>
                    </section>

                    <div className="mx-auto max-w-[1600px] px-6 sm:px-12 py-16">
                        <div className="border border-[var(--border)]  rounded-[12px] p-8 sm:p-10 mb-16 shadow-lg transition-all duration-500">
                            <div className="flex flex-col gap-4">
                                {/* Filter Header */}
                                <div className="flex items-center justify-between">
                                    <div>

                                        <h3 className="font-playfair text-lg font-medium">Filter Pieces</h3>
                                    </div>
                                    {(minPrice || maxPrice || selectedCategory !== 'All Products') && (
                                        <button
                                            onClick={() => {
                                                setMinPrice('');
                                                setMaxPrice('');
                                                setSelectedCategory('All Products');
                                            }}
                                            className="text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors border border-[var(--accent)] px-3 py-1.5 rounded-[6px] hover:border-[var(--text-primary)]"
                                        >
                                            Reset All
                                        </button>
                                    )}
                                </div>

                                {/* Category Filter */}
                                <div className="flex flex-col gap-3">

                                    <div className="flex flex-wrap gap-3">

                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-[9px] uppercase tracking-[0.2em] premium-text-muted font-medium">Price Range</label>
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        <div className="flex-1 flex flex-col gap-2">
                                            <span className="text-[8px] uppercase tracking-[0.15em] premium-text-muted">From</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    placeholder="₹0"
                                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-sm font-light premium-text placeholder-[var(--text-secondary)] transition-all duration-300 focus:outline-none focus:border-[var(--accent)] focus:shadow-md"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <span className="text-[8px] uppercase tracking-[0.15em] premium-text-muted">To</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    placeholder="₹999999"
                                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-sm font-light premium-text placeholder-[var(--text-secondary)] transition-all duration-300 focus:outline-none focus:border-[var(--accent)] focus:shadow-md"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div ref={catalogSectionRef} className="mx-auto max-w-[1600px] px-6 sm:px-12 py-20">
                        <div className="flex items-end justify-between mb-16 border-b border-[var(--border)] pb-8">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Edition</p>
                                <h2 className="font-playfair text-4xl">
                                    {searchQuery ? `Results for "${searchQuery}"` : 'Featured Assortment'}
                                </h2>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] premium-text-muted">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {skeletonCards.map((_, index) => (
                                    <div key={index} className="flex flex-col">
                                        <div className="relative aspect-[3/4] w-full rounded-[10px] skeleton" />

                                        <div className="mt-6 flex flex-col flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="h-4 w-3/4 rounded skeleton" />
                                                <div className="h-4 w-1/4 rounded skeleton" />
                                            </div>

                                            <div className="h-4 w-full rounded skeleton mt-2" />
                                            <div className="h-4 w-5/6 rounded skeleton mt-2" />

                                            <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4 opacity-0">
                                                <div className="h-3 w-24 rounded skeleton" />
                                                <div className="h-3 w-20 rounded skeleton" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div ref={productGridRef} className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="product-card group cursor-pointer flex flex-col" onClick={() => navigate(`/product/${product._id}`), console.log(product)}>
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
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-playfair text-xl transition-colors group-hover:text-[var(--accent)] line-clamp-1 flex-1 pr-4">{product.title}</h3>
                                                <span className="text-sm font-light">
                                                    {product.price?.currency === 'INR' ? '₹' : ''}{product.price?.amount?.toLocaleString('en-IN') || '0'}
                                                </span>
                                            </div>

                                            <p className="text-xs font-light premium-text-muted line-clamp-2 mb-6">
                                                {product.description}
                                            </p>

                                            <div className="mt-auto flex justify-between items-center border-t border-[var(--border)] pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">

                                                <button
                                                    className="text-[10px] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBuyClick(product._id);
                                                    }}
                                                >
                                                    {user?.role === 'seller' ? 'Modify' : 'View Details'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 text-center border border-[var(--border)]">
                                <h2 className="font-playfair text-3xl mb-4">No pieces match your criteria</h2>
                                <p className="text-sm font-light premium-text-muted mb-10">Refine your search to explore the collection.</p>
                                <button
                                    className="btn-outline px-10 py-4 text-xs uppercase tracking-[0.2em]"
                                    onClick={() => setSearchQuery('')}
                                >
                                    Reset Search
                                </button>
                            </div>
                        )}
                    </div>

                    {!!token && (
                        <section className="mx-auto max-w-[1600px] px-6 sm:px-12 pb-32">
                            <div className="flex items-end justify-between mb-12 border-b border-[var(--border)] pb-8">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Personal Archive</p>
                                    <h2 className="font-playfair text-4xl">Recently Viewed</h2>
                                </div>
                            </div>

                            {recentlyViewedLoading ? (
                                <div className="py-20 flex justify-center border border-[var(--border)]">
                                    <div className="w-8 h-8 border border-t-transparent border-[var(--text-primary)] rounded-full animate-spin"></div>
                                </div>
                            ) : recentlyViewed?.length > 0 ? (
                                <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
                                    {recentlyViewed.map((item) => (
                                        <div
                                            key={item?._id}
                                            className="shrink-0 w-72 group cursor-pointer snap-start"
                                            onClick={() => navigate(`/product/${item?._id}`)}
                                        >
                                            <div className="h-[360px] w-full bg-[var(--bg-secondary)] overflow-hidden mb-6 rounded-[10px]">
                                                {item?.images?.[0]?.url ? (
                                                    <img src={item.images[0].url} alt={item?.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100 rounded-[10px]" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-widest premium-text-muted">No Media</div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-playfair text-lg group-hover:text-[var(--accent)] transition-colors line-clamp-1">{item?.title}</h3>
                                                <p className="text-sm font-light mt-2">₹{item?.price?.amount?.toLocaleString('en-IN') || 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-[var(--border)] py-20 flex justify-center">
                                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted">Your archive is empty.</p>
                                </div>
                            )}
                        </section>
                    )}

                    <div className="border-t border-[var(--border)] py-24 sm:py-32 text-center">
                        <h3 className="font-playfair text-4xl sm:text-5xl mb-6">Join The Obsidian Gallery</h3>
                        <p className="text-sm font-light premium-text-muted mb-12 max-w-lg mx-auto">
                            Unlock an elevated experience. Gain early access to the newest curations and exclusive pieces.
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn-accent px-12 py-5 text-xs uppercase tracking-[0.2em]"
                        >
                            Register
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Home
