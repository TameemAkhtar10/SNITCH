import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

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

const Login = () => {
    const { handlerlogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { isDark, toggleDark } = useDarkMode();

    const handleGoogleAuth = () => {
        setError("");
        const redirectTo = encodeURIComponent(location.state?.from?.pathname || '/home')
        window.location.href = `http://localhost:3000/api/auth/google?redirectTo=${redirectTo}`
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError("Please enter both email and password");
            setLoading(false);
            return;
        }

        try {
            const response = await handlerlogin({ email: formData.email, password: formData.password });
            const fallback = response?.role === "seller" ? "/seller" : "/home";
            navigate(location.state?.from?.pathname || fallback, { replace: true });
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err?.message || "Unable to sign in right now.";
            console.log("Login error details:", errorMsg);
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

            <div className="flex w-full justify-center items-center p-8 md:w-7/12 mt-16 md:mt-0">
                <div className="w-full max-w-md">
                    <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Authentication</p>
                    <h2 className="font-playfair text-4xl mb-12">Sign In</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="input-premium w-full py-3 text-sm font-light placeholder:text-[var(--text-secondary)]"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.15em] premium-text-muted">Password</label>
                                <button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent)] hover:underline underline-offset-4">Forgot?</button>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="input-premium w-full py-3 text-sm font-light placeholder:text-[var(--text-secondary)]"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-accent mt-6 w-full py-4 text-xs uppercase tracking-[0.2em] font-medium" disabled={loading}>
                            {loading ? "Authenticating..." : "Sign In"}
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
                        New to the gallery?{' '}
                        <Link to="/register" className="text-[var(--text-primary)] border-b border-[var(--text-primary)] pb-0.5 ml-2 uppercase tracking-widest font-medium hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
                            Apply for Access
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

export default Login;