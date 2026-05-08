import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateProfileApi } from '../services/user.api.js'
import { setuser } from '../../auth/state/auth.slice.js'

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

const Profile = () => {
    const user = useSelector(s => s.auth.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isDark, toggleDark } = useDarkMode()
    const [form, setForm] = useState({ fullname: user?.fullname || '', email: user?.email || '', contact: user?.contact || '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await updateProfileApi(form)
            const updatedUser = res.user || res.data?.user || null
            if (updatedUser) dispatch(setuser(updatedUser))
            window.alert('Profile updated')
        } catch (err) {
            window.alert(err?.response?.data?.message || 'Failed to update profile')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
                
                ${isDark ? `
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
                `}

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

                .glass-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border);
                }
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
                <div className="shrink-0 flex justify-end items-center">
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

            <main className="mx-auto max-w-3xl px-6 py-12">
                <div className="mb-12">
                    <h1 className="font-playfair text-5xl mb-2">Profile</h1>
                    <p className="text-xs uppercase tracking-[0.2em] premium-text-muted">Manage your account</p>
                </div>

                <div className="premium-surface p-10 border border-[var(--border)]">
                    <form onSubmit={handleSave} className="grid gap-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Full Name</label>
                            <input name="fullname" value={form.fullname} onChange={handleChange} placeholder="Enter full name" className="input-premium w-full py-3 text-sm font-light" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Email</label>
                            <input name="email" value={form.email} onChange={handleChange} placeholder="Enter email" className="input-premium w-full py-3 text-sm font-light" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Contact</label>
                            <input name="contact" value={form.contact} onChange={handleChange} placeholder="Enter contact number" className="input-premium w-full py-3 text-sm font-light" required />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="btn-accent py-3 px-6 text-xs uppercase tracking-[0.2em] font-medium flex-1" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                            <button type="button" onClick={() => navigate('/profile/addresses')} className="btn-outline py-3 px-6 text-xs uppercase tracking-[0.2em] font-medium flex-1">Manage Addresses</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default Profile
