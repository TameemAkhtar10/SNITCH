import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setuser as setAuthUser } from '../features/auth/state/auth.slice.js'
import { useAuth } from '../features/auth/hooks/useAuth.js'

const HamburgerIcon = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6h16" />
        <path d="M7 12h13" />
        <path d="M4 18h16" />
    </svg>
)

const SearchIcon = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="M20 20l-3.5-3.5" />
    </svg>
)

const HeartIcon = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 8.6c0 5.2-8.8 11-8.8 11S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 11.5 6.2L12 6.8l.5-.6a4.6 4.6 0 0 1 8.3 2.4Z" />
    </svg>
)

const BagIcon = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
)

const UserIcon = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
    </svg>
)

const ThemeIcon = ({ isDark, className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {isDark ? (
            <>
                <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
            </>
        ) : (
            <>
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.5v2.2" />
                <path d="M12 19.3v2.2" />
                <path d="M4.9 4.9l1.6 1.6" />
                <path d="M17.5 17.5l1.6 1.6" />
                <path d="M2.5 12h2.2" />
                <path d="M19.3 12h2.2" />
                <path d="M4.9 19.1l1.6-1.6" />
                <path d="M17.5 6.5l1.6-1.6" />
            </>
        )}
    </svg>
)

const Navbar = ({
    searchInputOpen,
    setSearchInputOpen,
    searchQuery,
    setSearchQuery,
    drawerOpen,
    setDrawerOpen,
    profileMenuOpen,
    setProfileMenuOpen,
    isDark,
    toggleDark,
    catalogSectionRef,
    handleSearchFocus,
    handleSearchSubmit,
    handleProfileClick,
    handleLogout,
    user,
    initializing,
    cartItemCount,
    wishlistItemCount,
    drawerLinks,
    token
}) => {
    const navigate = useNavigate()
    const searchInputRef = useRef(null)

    const badgeClass = "absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-[var(--bg-primary)] bg-[var(--accent)] px-1 text-[8px] font-semibold leading-none text-white md:-right-1 md:-top-1 md:h-5 md:min-w-5 md:text-[9px]"

    const closeSearchInput = () => setSearchInputOpen(false)
    const closeDrawer = () => setDrawerOpen(false)

    useEffect(() => {
        if (searchInputOpen) {
            searchInputRef.current?.focus()
        }
    }, [searchInputOpen])

    return (
        <>
            <header className="sticky top-0 z-50 glass-header overflow-x-clip">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-4 py-3 md:gap-4 md:px-8 md:py-4">
                    {/* Left side: Hamburger on mobile, brand wordmark on desktop */}
                    <div className="flex items-center justify-start">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="group flex h-6 w-6 items-center justify-center text-[var(--text-primary)] transition-all duration-300 hover:text-[var(--accent)] md:hidden"
                            aria-label="Open navigation drawer"
                        >
                            <HamburgerIcon className="h-6 w-6" />
                        </button>

                        <button
                            type="button"
                          onClick={() => {
                            if (catalogSectionRef.current) {
                                catalogSectionRef.current.scrollIntoView({ behavior: 'smooth' })
                            }   
                            }}
                            className="hidden items-center justify-start text-[var(--text-primary)] transition-all duration-300 hover:text-[var(--accent)] md:inline-flex"
                            aria-label="Open navigation drawer"
                        >
                            <span className="font-playfair whitespace-nowrap text-sm sm:text-2xl tracking-widest cursor-pointer font-semibold">SNITCH</span>
                        </button>
                    </div>

                    <div className="flex min-w-[68px] items-center justify-end gap-3 md:min-w-0 md:gap-3">
                        {/* Search - Desktop only */}
                        <div className="relative hidden h-10 w-10 shrink-0 overflow-visible md:inline-flex">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="absolute right-0 top-0 z-20 flex h-10 items-center overflow-hidden rounded-full bg-[#1a1a1a]"
                                style={{
                                    width: searchInputOpen ? '200px' : '0px',
                                    transition: 'width 0.3s ease',
                                }}
                            >
                                {searchInputOpen && (
                                    <>
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onBlur={(e) => {
                                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                                    closeSearchInput()
                                                }
                                            }}
                                            className="h-full w-full border-0 bg-transparent px-3 py-2 pr-10 text-[#F5F5F5] outline-none focus:outline-none placeholder:text-[#888888]"
                                            placeholder="Search..."
                                            aria-label="Search the collection"
                                        />
                                        <button
                                            type="button"
                                            onClick={closeSearchInput}
                                            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#F5F5F5] transition-colors hover:text-[var(--text-secondary)]"
                                            aria-label="Close search"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5">
                                                <path d="M6 6l12 12" />
                                                <path d="M18 6L6 18" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </form>

                            {!searchInputOpen && (
                                <button type="button" onClick={handleSearchFocus} className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)]/60 p-2 text-[var(--text-secondary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]" aria-label="Search the collection">
                                    <SearchIcon className="h-6 w-6 md:h-[1.375rem] md:w-[1.375rem]" />
                                </button>
                            )}
                        </div>

                        {/* Cart - Mobile and Desktop */}
                        <button type="button" onClick={() => { closeDrawer(); navigate('/cart') }} className="group relative inline-flex h-6 w-6 items-center justify-center text-[var(--text-secondary)] transition-all duration-300 hover:text-[var(--text-primary)] md:h-10 md:w-10 md:rounded-full md:border md:border-[var(--border)] md:bg-[var(--bg-primary)]/60 md:p-2 md:backdrop-blur-md md:hover:scale-105 md:hover:border-[var(--text-primary)]" aria-label="Open cart">
                            <BagIcon className="h-6 w-6 md:h-[1.375rem] md:w-[1.375rem]" />
                            {cartItemCount > 0 && <span className={badgeClass}>{cartItemCount}</span>}
                        </button>

                        {/* Wishlist - Mobile and Desktop */}
                        <button type="button" onClick={() => navigate('/wishlist')}
                            className="group relative inline-flex h-6 w-6 items-center justify-center text-[var(--text-secondary)] transition-all duration-300 hover:text-[var(--text-primary)] md:h-10 md:w-10 md:rounded-full md:border md:border-[var(--border)] md:bg-[var(--bg-primary)]/60 md:p-2 md:backdrop-blur-md md:hover:scale-105 md:hover:border-[var(--text-primary)]" aria-label="View wishlist">
                            <HeartIcon className="h-6 w-6 md:h-[1.375rem] md:w-[1.375rem]" />
                            {wishlistItemCount > 0 && <span className={badgeClass}>{wishlistItemCount}</span>}
                        </button>

                        {/* Profile - Desktop only */}
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleProfileClick();
                            }}
                            className="group relative hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)]/60 p-2 text-[var(--text-secondary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] md:inline-flex"
                            aria-label="Account menu"
                            aria-expanded={profileMenuOpen}
                        >
                            <UserIcon className="h-[1.375rem] w-[1.375rem]" />
                        </button>

                        {/* Theme Toggle - Desktop only */}
                        <button type="button" onClick={toggleDark} className="group relative hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)]/60 p-2 text-[var(--text-secondary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] md:inline-flex" aria-label="Toggle theme">
                            <ThemeIcon isDark={isDark} className="h-[1.375rem] w-[1.375rem]" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-[60]">
                    <button
                        type="button"
                        aria-label="Close navigation drawer"
                        className="absolute inset-0 bg-[var(--bg-primary)]/65 backdrop-blur-sm"
                        onClick={closeDrawer}
                    />
                    <aside className="drawer-panel absolute inset-y-0 left-0 flex h-full w-full flex-col border-r border-[var(--border)] px-5 py-5 sm:max-w-3xl sm:px-10 sm:py-6">
                        <div className="flex items-center justify-between pb-8">
                            <span className="text-[9px] uppercase tracking-[0.3em] premium-text-muted sm:text-[10px]">Navigation</span>
                            <button
                                type="button"
                                onClick={closeDrawer}
                                className="drawer-icon-button group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition-all duration-300 hover:scale-105 hover:border-[var(--accent)] hover:text-[var(--accent)] sm:h-11 sm:w-11"
                                aria-label="Close drawer"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 sm:h-5 sm:w-5">
                                    <path d="M6 6l12 12" />
                                    <path d="M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col justify-between gap-10 overflow-y-auto pb-4">
                            <div className="space-y-4 pt-6">
                                {drawerLinks.map((item) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={item.action}
                                        className="drawer-link flex w-full items-center justify-between border-b border-[var(--border)] py-4 text-left text-xl font-light tracking-[0.14em] text-[var(--text-primary)] sm:py-5 sm:text-4xl sm:tracking-[0.18em]"
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-[9px] uppercase tracking-[0.3em] premium-text-muted sm:text-[10px]">Open</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-2 sm:pt-8">
                                <div className="premium-surface border border-[var(--border)] p-6">
                                    <p className="text-[10px] uppercase tracking-[0.25em] premium-text-muted mb-3">Account</p>
                                    <p className="font-playfair text-2xl mb-2">{token && !initializing ? (user?.fullname || 'Client') : 'Guest Visitor'}</p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted truncate">{token && !initializing ? (user?.email || 'Sign in for a private view') : 'Sign in to unlock curated access'}</p>
                                </div>

                                <div className="premium-surface border border-[var(--border)] p-6">
                                    <p className="text-[10px] uppercase tracking-[0.25em] premium-text-muted mb-3">Quick Stats</p>
                                    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em]">
                                        <span className="premium-text-muted">Wishlist</span>
                                        <span>{wishlistItemCount}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-sm uppercase tracking-[0.2em]">
                                        <span className="premium-text-muted">Bag</span>
                                        <span>{cartItemCount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap">
                                {token && !initializing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => { closeDrawer(); navigate('/seller') }}
                                            className="rounded-full border border-[var(--border)] px-5 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] sm:flex-1 sm:px-6"
                                        >
                                            Seller Dashboard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { closeDrawer(); navigate('/profile') }}
                                            className="rounded-full border border-[var(--border)] px-5 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] sm:flex-1 sm:px-6"
                                        >
                                            Profile
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="rounded-full border border-[var(--border)] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[var(--danger)] transition-colors hover:border-[var(--danger)] sm:flex-1 sm:px-6"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { closeDrawer(); navigate('/login') }}
                                        className="rounded-full border border-[var(--border)] px-5 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] sm:flex-1 sm:px-6"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </>
    )
}

export default Navbar
