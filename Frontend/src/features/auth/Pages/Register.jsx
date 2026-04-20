import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "./Auth.css";

const Register = () => {
    const { handlerregister } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        contact: "",
        password: "",
        isSeller: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleAuth = () => {
        setError("");

        window.location.href = "http://localhost:3000/api/auth/google";
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
        try {
            const response = await handlerregister({
                fullname: formData.fullname,
                email: formData.email,
                contact: formData.contact,
                password: formData.password,
                isSeller: formData.isSeller,
            });

            // Check if user is a seller and redirect accordingly
            if (response?.role === "seller" || formData.isSeller) {
                navigate("/seller");
            } else {
                navigate("/home");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to create your account.");
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
                    <h2 className="auth-title">Create Account</h2>

                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="auth-field">
                            <input id="fullname" name="fullname" type="text" className="auth-input" placeholder=" " value={formData.fullname} onChange={handleChange} required />
                            <label htmlFor="fullname" className="auth-label">Full Name</label>
                        </div>

                        <div className="auth-field">
                            <input id="email" name="email" type="email" className="auth-input" placeholder=" " value={formData.email} onChange={handleChange} required />
                            <label htmlFor="email" className="auth-label">Email</label>
                        </div>

                        <div className="auth-field">
                            <input id="contact" name="contact" type="number" className="auth-input" placeholder=" " value={formData.contact} onChange={handleChange} required />
                            <label htmlFor="contact" className="auth-label">Contact</label>
                        </div>

                        <div className="auth-field">
                            <input id="password" name="password" type="password" className="auth-input" placeholder=" " value={formData.password} onChange={handleChange} required />
                            <label htmlFor="password" className="auth-label">Password</label>
                        </div>

                        <div className="auth-toggle-row">
                            <span className="auth-toggle-text">Register as Seller</span>
                            <button type="button" className={`auth-switch ${formData.isSeller ? "active" : ""}`} onClick={toggleSeller} aria-label="Register as seller" aria-pressed={formData.isSeller}>
                                <span className="auth-switch-dot" />
                            </button>
                        </div>

                        {error ? <p className="auth-error">{error}</p> : null}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? "..." : "Register"}
                        </button>

                        <p className="auth-divider">Or</p>

                        <button type="button" className="auth-google-button" onClick={handleGoogleAuth} disabled={loading}>
                            <span className="auth-google-g">G</span>
                            Continue with Google
                        </button>
                    </form>

                    <p className="auth-link-row">
                        Already a member?
                        <Link className="auth-link" to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Register;