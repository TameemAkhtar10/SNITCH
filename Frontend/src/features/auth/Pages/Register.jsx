import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { API_URL } from "../../../config/api.js";

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

const Register = () => {
    const { handlerregister } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        contact: "",
        password: "",
        isSeller: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { isDark, toggleDark } = useDarkMode();

    const handleGoogleAuth = () => {
        setError("");
        const redirectTo = encodeURIComponent(location.state?.from?.pathname || '/home')
        window.location.href = `${API_URL}/api/auth/google?redirectTo=${redirectTo}`;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleSeller = () => {
        setFormData((prev) => ({ ...prev, isSeller: !prev.isSeller }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        if (!formData.fullname || !formData.email || !formData.contact || !formData.password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const response = await handlerregister({
                fullname: formData.fullname,
                email: formData.email,
                contact: formData.contact,
                password: formData.password,
                isSeller: formData.isSeller,
            });

            const fallback = response?.role === "seller" || formData.isSeller ? "/seller" : "/home";
            navigate(location.state?.from?.pathname || fallback, { replace: true });
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err?.message || "Unable to create your account.";
            console.log("Register error details:", errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

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
        <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500 flex flex-col md:flex-row relative">
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

                .toggle-premium {
                    width: 32px;
                    height: 16px;
                    background-color: var(--border);
                    border-radius: 16px;
                    position: relative;
                    transition: all 0.3s ease;
                }
                .toggle-premium.active {
                    background-color: var(--text-primary);
                }
                .toggle-dot {
                    width: 12px;
                    height: 12px;
                    background-color: var(--bg-primary);
                    border-radius: 50%;
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                }
                .toggle-dot.active {
                    transform: translateX(16px);
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            `}</style>

            <button
                onClick={toggleDark}
                className="absolute top-6 right-6 text-xs uppercase tracking-[0.1em] premium-text-muted hover:text-[var(--text-primary)] transition-colors z-50"
            >
                {isDark ? 'Light' : 'Dark'}
            </button>
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-xs uppercase tracking-[0.1em] premium-text-muted hover:text-[var(--text-primary)] transition-colors z-50"
            >
                Return
            </button>

            <aside className="hidden md:flex md:w-5/12 flex-col justify-between p-16 border-r border-[var(--border)] relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80"
                    alt="Premium fashion store interior with apparel racks"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />

                <div className="relative z-10">
                    <h1 className="font-playfair text-2xl font-semibold tracking-[0.2em] uppercase text-white drop-shadow-lg">S N I T C H</h1>
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-widest text-white/80 drop-shadow-md">© 2026 SNITCH</p>
                </div>
            </aside>

            <div className="flex w-full justify-center items-center p-8 md:w-7/12 mt-16 md:mt-0 overflow-y-auto">
                <div className="w-full max-w-md my-8">
                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Registration</p>
                    <h2 className="font-playfair text-4xl mb-10">Apply for Access</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="fullname" className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Full Name</label>
                            <input id="fullname" name="fullname" type="text" className="input-premium w-full py-3 text-sm font-light placeholder:text-[var(--text-secondary)]" placeholder="Enter your full name" value={formData.fullname} onChange={handleChange} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Email Address</label>
                            <input id="email" name="email" type="email" className="input-premium w-full py-3 text-sm font-light placeholder:text-[var(--text-secondary)]" placeholder="Enter your email address" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="contact" className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Contact Number</label>
                            <input id="contact" name="contact" type="number" className="input-premium w-full py-3 text-sm font-light placeholder:text-[var(--text-secondary)]" placeholder="Enter your mobile number" value={formData.contact} onChange={handleChange} required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Password</label>
                            <input id="password" name="password" type="password" className="input-premium w-full py-3 text-sm font-light placeholder:text-[var(--text-secondary)]" placeholder="Create a secure password" value={formData.password} onChange={handleChange} required />
                        </div>

                        <div className="flex items-center justify-between mt-4 border border-[var(--border)] p-5">
                            <span className="text-[10px] uppercase tracking-[0.2em]">Register as Curator (Seller)</span>
                            <button type="button" onClick={toggleSeller} aria-label="Register as seller" className={`toggle-premium ${formData.isSeller ? "active" : ""}`}>
                                <div className={`toggle-dot ${formData.isSeller ? "active" : ""}`} />
                            </button>
                        </div>

                        <button type="submit" className="btn-accent mt-4 w-full py-4 text-xs uppercase tracking-[0.2em] font-medium" disabled={loading}>
                            {loading ? "Processing..." : "Submit Application"}
                        </button>

                        <div className="flex items-center gap-4 my-2">
                            <div className="flex-1 h-px premium-border border-t" />
                            <span className="text-[10px] uppercase tracking-widest premium-text-muted">Or</span>
                            <div className="flex-1 h-px premium-border border-t" />
                        </div>

                        <button type="button" onClick={handleGoogleAuth} disabled={loading} className="btn-outline w-full py-4 text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-3">
                            <span className="font-playfair font-bold text-[var(--text-primary)] text-lg leading-none pt-0.5">G</span>
                            Continue with Google
                        </button>
                    </form>

                    <p className="mt-12 text-center text-xs font-light premium-text-muted">
                        Already a member?{' '}
                        <Link to="/login" className="text-[var(--text-primary)] border-b border-[var(--text-primary)] pb-0.5 ml-2 uppercase tracking-widest font-medium hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-6 right-6 p-4 text-xs uppercase tracking-widest border border-[var(--danger)] text-[var(--danger)] bg-[var(--bg-primary)] z-50 flex items-center gap-6 shadow-2xl">
                    {error}
                    <button onClick={() => setError("")} className="font-bold underline underline-offset-4">Close</button>
                </div>
            )}
        </div>
    );
};

export default Register;