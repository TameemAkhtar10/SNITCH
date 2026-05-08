import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate()

    return (
        <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-12 sm:py-16">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4">SNITCH</p>
                        <h2 className="font-playfair text-3xl sm:text-4xl leading-tight mb-4">Curated fashion, delivered with a sharper point of view.</h2>
                        <p className="max-w-xl text-sm sm:text-base leading-7 text-[var(--text-secondary)]">
                            Explore premium pieces, keep track of your orders, and manage your profile and delivery details in one place.
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4">Explore</p>
                        <div className="flex flex-col gap-3 text-sm">
                            <Link to="/" className="transition-colors hover:text-[var(--accent)]">Home</Link>
                            <Link to="/wishlist" className="transition-colors hover:text-[var(--accent)]">Wishlist</Link>
                            <Link to="/cart" className="transition-colors hover:text-[var(--accent)]">Cart</Link>
                            <Link to="/orders" className="transition-colors hover:text-[var(--accent)]">Orders</Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4">Account</p>
                        <div className="flex flex-col gap-3 text-sm">
                            <button onClick={() => navigate('/profile')} className="text-left transition-colors hover:text-[var(--accent)]">Profile</button>
                            <button onClick={() => navigate('/profile/addresses')} className="text-left transition-colors hover:text-[var(--accent)]">Addresses</button>
                            <button onClick={() => navigate('/login')} className="text-left transition-colors hover:text-[var(--accent)]">Sign in</button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">© {new Date().getFullYear()} Snitch. All rights reserved.</p>
                    <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                        <button onClick={() => navigate('/')} className="transition-colors hover:text-[var(--text-primary)]">Back to top</button>
                        <span>Premium streetwear</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
