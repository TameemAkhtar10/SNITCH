import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "./Auth.css";

const Login = () => {
    const { handlerlogin } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleAuth = () => {
        setError("");
        window.location.href = "http://localhost:3000/api/auth/google"
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await handlerlogin({ email: formData.email, password: formData.password });

            // Check if user is a seller and redirect accordingly
            if (response?.role === "seller") {
                navigate("/seller");
            } else {
                navigate("/home");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to sign in right now.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-root md:flex md:min-h-screen">
            <aside className="auth-brand hidden md:flex md:w-1/2 md:items-center md:justify-center md:px-16">
                <div className="relative z-10 text-center">
                    <h1 className="auth-brand-name">SNITCH</h1>
                    <div className="auth-brand-line" />
                    <p className="auth-tagline">Wear the difference</p>
                </div>
            </aside>

            <div className="auth-form-shell flex w-full items-center px-7 py-12 sm:px-10 md:w-1/2 md:px-16">
                <div className="auth-form-container mx-auto">
                    <p className="auth-overline">Snitch Members</p>
                    <h2 className="auth-title">Sign In</h2>

                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="auth-field">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="auth-input"
                                placeholder=" "
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="email" className="auth-label">
                                Email
                            </label>
                        </div>

                        <div className="auth-field">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="auth-input"
                                placeholder=" "
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="password" className="auth-label">
                                Password
                            </label>
                        </div>

                        {error ? <p className="auth-error">{error}</p> : null}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? "..." : "Sign In"}
                        </button>

                        <p className="auth-divider">Or</p>

                        <button type="button" className="auth-google-button" onClick={handleGoogleAuth} disabled={loading}>
                            <span className="auth-google-g">G</span>
                            Continue with Google
                        </button>
                    </form>

                    <p className="auth-link-row">
                        New to Snitch?
                        <Link className="auth-link" to="/register">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Login;