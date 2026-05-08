import React, { useEffect, useState } from 'react'
import { useAddress } from '../Hooks/useAddress.js'
import { useNavigate } from 'react-router-dom'

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

const AddressPage = () => {
  const { fetchAddresses, addAddress, deleteAddress, setDefault, loading } = useAddress()
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India' })
  const navigate = useNavigate()
  const { isDark, toggleDark } = useDarkMode()

  useEffect(() => {
    fetchAddresses().then((list) => setAddresses(list)).catch(() => setAddresses([]))
  }, [fetchAddresses])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const list = await addAddress(form)
      setAddresses(list)
      setForm({ name: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India' })
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to add address')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return
    try {
      const list = await deleteAddress(id)
      setAddresses(list)
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to delete address')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      const list = await setDefault(id)
      setAddresses(list)
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to set default')
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
  `

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

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12">
          <h1 className="font-playfair text-5xl mb-2">Saved Addresses</h1>
          <p className="text-xs uppercase tracking-[0.2em] premium-text-muted">Manage your delivery locations</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 premium-surface p-10 border border-[var(--border)]">
            <h3 className="font-playfair text-xl mb-6">Your Addresses</h3>
            {loading ? <p className="premium-text-muted">Loading...</p> : (
              <div className="space-y-4">
                {addresses.length === 0 && <p className="text-sm premium-text-muted">No saved addresses yet.</p>}
                {addresses.map(addr => (
                  <div key={addr._id} className="border border-[var(--border)] bg-[var(--bg-primary)] p-6 rounded-lg hover:border-[var(--accent)] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-playfair text-lg mb-1">{addr.name}</p>
                        {addr.isDefault && <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium">Default</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                        {!addr.isDefault && <button onClick={() => handleSetDefault(addr._id)} className="text-xs uppercase tracking-widest text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">Set Default</button>}
                        <button onClick={() => handleDelete(addr._id)} className="text-xs uppercase tracking-widest text-[var(--danger)] hover:text-[var(--accent)] transition-colors">Delete</button>
                      </div>
                    </div>
                    <div className="text-sm space-y-1 premium-text-muted">
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p>{addr.country}</p>
                      <p className="mt-2">📞 {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAdd} className="premium-surface p-10 border border-[var(--border)] h-fit">
            <h3 className="font-playfair text-xl mb-6">Add New Address</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="input-premium w-full py-2 text-sm font-light" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" required className="input-premium w-full py-2 text-sm font-light" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Street</label>
                <input name="street" value={form.street} onChange={handleChange} placeholder="Street address" required className="input-premium w-full py-2 text-sm font-light" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">City</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" required className="input-premium w-full py-2 text-sm font-light" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">State</label>
                  <input name="state" value={form.state} onChange={handleChange} placeholder="State" required className="input-premium w-full py-2 text-sm font-light" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" required className="input-premium w-full py-2 text-sm font-light" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="input-premium w-full py-2 text-sm font-light" />
                </div>
              </div>
              <button type="submit" className="btn-accent w-full py-3 text-xs uppercase tracking-[0.2em] font-medium mt-2">Add Address</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AddressPage
