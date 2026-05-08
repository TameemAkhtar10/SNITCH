import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UseProduct from "../Hooks/UseProduct.js";

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

const CreateProduct = () => {
    const { handleCreateProduct } = UseProduct();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priceAmount: "",
        priceCurrency: "INR",
        stock: "",
    });
    const [variants, setVariants] = useState([]);
    const [newVariant, setNewVariant] = useState({
        color: "",
        sizesInput: "",
        stock: "",
        priceAmount: "",
        priceCurrency: "INR",
        images: [],
        imagePreviews: [],
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { isDark, toggleDark } = useDarkMode();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (event) => {
        const { name, value } = event.target;
        setNewVariant((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariantImageChange = (event) => {
        const files = Array.from(event.target.files);
        const previews = files.map((file) => URL.createObjectURL(file));
        setNewVariant((prev) => ({
            ...prev,
            images: files,
            imagePreviews: previews
        }));
    };

    const handleAddVariant = () => {
        const normalizedSizes = [...new Set(
            String(newVariant.sizesInput || '')
                .split(',')
                .map((size) => size.trim())
                .filter(Boolean)
        )]

        if (!newVariant.color || normalizedSizes.length === 0 || !newVariant.stock || !newVariant.priceAmount) {
            setError("Please fill all variant fields");
            return;
        }

        // Validate that variant has at least one image
        if (newVariant.images.length === 0) {
            setError("Please upload at least one image for this variant");
            return;
        }

        setVariants([...variants, { ...newVariant, sizes: normalizedSizes, id: Date.now() }]);
        setNewVariant({
            color: "",
            sizesInput: "",
            stock: "",
            priceAmount: "",
            priceCurrency: "INR",
            images: [],
            imagePreviews: [],
        });
        setShowVariantForm(false);
        setError("");
    };

    const handleRemoveVariant = (variantId) => {
        setVariants(variants.filter((v) => v.id !== variantId));
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        setImages(files);
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        // Validate that at least one image is uploaded
        if (images.length === 0) {
            setError("Please upload at least one image of the product.");
            return;
        }

        setLoading(true);
        try {
            const form = new FormData();
            form.append("title", formData.title);
            form.append("description", formData.description);
            form.append("priceAmount", formData.priceAmount);
            form.append("priceCurrency", formData.priceCurrency);
            form.append("stock", formData.stock);

            if (variants.length > 0) {
                const variantsData = variants.map((v, index) => {
                    // Append images for each variant using a field that includes the variant index
                    v.images.forEach((file) => {
                        form.append(`variantFiles_${index}`, file);
                    });

                    return {
                        color: v.color,
                        size: v.sizes?.[0] || '',
                        sizes: Array.isArray(v.sizes) ? v.sizes : [],
                        stock: parseInt(v.stock, 10),
                        priceAmount: parseFloat(v.priceAmount),
                        priceCurrency: v.priceCurrency,
                        imageCount: v.images.length,
                    };
                });
                form.append("variants", JSON.stringify(variantsData));
            }

            // Append all product images to FormData
            images.forEach((file) => form.append("files", file));
            await handleCreateProduct(form);
            setSuccess("Product listed successfully.");
            setTimeout(() => navigate("/home"), 2000);
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to create product.");
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
        <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500 pb-24">
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
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border);
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

                .upload-zone {
                    border: 1px dashed var(--border);
                    transition: border-color 0.3s ease;
                }
                .upload-zone:hover {
                    border-color: var(--text-primary);
                }

                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
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

            <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
                <div className="mb-16 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] premium-text-muted mb-4">Curator Studio</p>
                    <h1 className="font-playfair text-5xl lg:text-6xl font-medium leading-tight mb-4">
                        Add New Piece
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8 sm:gap-12">
                    <section className="premium-surface p-6 sm:p-10 border border-[var(--border)]">
                        <h3 className="font-playfair text-2xl mb-8 border-b border-[var(--border)] pb-4">Essential Details</h3>

                        <div className="flex flex-col gap-8">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Title</label>
                                <input id="title" name="title" type="text" className="input-premium w-full py-3 text-sm font-light placeholder:text-[var(--text-secondary)]" placeholder="Name of the piece" value={formData.title} onChange={handleChange} required />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Description</label>
                                <textarea id="description" name="description" className="input-premium w-full py-3 text-sm font-light min-h-[120px] resize-y placeholder:text-[var(--text-secondary)]" placeholder="Provide a detailed description" value={formData.description} onChange={handleChange} required />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-8">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Base Price</label>
                                    <input id="priceAmount" name="priceAmount" type="number" className="input-premium w-full py-3 text-sm font-light" placeholder="0.00" value={formData.priceAmount} onChange={handleChange} step="0.01" required />
                                </div>
                                <div className="w-full sm:w-48">
                                    <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Currency</label>
                                    <select id="priceCurrency" name="priceCurrency" className="input-premium w-full py-3 text-sm font-light appearance-none" value={formData.priceCurrency} onChange={handleChange}>
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Stock Quantity</label>
                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    className="input-premium w-full py-3 text-sm font-light"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <section className="premium-surface p-6 sm:p-10 border border-[var(--border)]">
                        <div className="flex justify-between items-center mb-8 border-b border-[var(--border)] pb-4">
                            <h3 className="font-playfair text-2xl">
                                Variants <span className="text-sm font-light premium-text-muted ml-2">({variants.length})</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowVariantForm(!showVariantForm)}
                                className="text-[10px] uppercase tracking-widest text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                {showVariantForm ? "[- Close]" : "[+ Add Variant]"}
                            </button>
                        </div>

                        {showVariantForm && (
                            <div className="border border-[var(--border)] p-8 mb-8 bg-[var(--bg-primary)]">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Color</label>
                                        <input type="text" name="color" value={newVariant.color} onChange={handleVariantChange} className="input-premium w-full py-2 text-sm font-light" placeholder="e.g. Obsidian" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Sizes</label>
                                        <input type="text" name="sizesInput" value={newVariant.sizesInput} onChange={handleVariantChange} className="input-premium w-full py-2 text-sm font-light" placeholder="e.g. S, M, L, XL" required />
                                        <p className="mt-2 text-[9px] uppercase tracking-[0.15em] premium-text-muted">Use comma to add multiple sizes</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Stock Quantity</label>
                                        <input type="number" name="stock" value={newVariant.stock} onChange={handleVariantChange} className="input-premium w-full py-2 text-sm font-light" placeholder="0" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Price Overwrite</label>
                                        <input type="number" name="priceAmount" value={newVariant.priceAmount} onChange={handleVariantChange} className="input-premium w-full py-2 text-sm font-light" placeholder="0.00" step="0.01" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2 block">Currency</label>
                                        <select name="priceCurrency" value={newVariant.priceCurrency} onChange={handleVariantChange} className="input-premium w-full py-2 text-sm font-light appearance-none">
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-[var(--border)] pt-8 mb-8">
                                    <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4 block">Variant Images <span className="text-[var(--danger)]">*Required</span></label>
                                    <div className="upload-zone p-8 cursor-pointer flex flex-col items-center justify-center text-center bg-[var(--bg-primary)]" onClick={() => document.getElementById("variant-images").click()}>
                                        <input
                                            id="variant-images"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleVariantImageChange}
                                        />
                                        <div className="text-xl mb-2 font-light premium-text-muted">↓</div>
                                        <p className="font-outfit text-sm mb-1">
                                            {newVariant.images.length === 0 ? "Upload variant images" : `${newVariant.images.length} image(s) selected`}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-widest premium-text-muted">Max 5 images · 5MB each</p>
                                    </div>

                                    {newVariant.imagePreviews.length > 0 && (
                                        <div className="flex flex-wrap gap-4 mt-4">
                                            {newVariant.imagePreviews.map((preview, index) => (
                                                <div key={index} className="w-16 aspect-square border border-[var(--border)] bg-[var(--bg-primary)] p-1 rounded-lg">
                                                    <img src={preview} alt={`Variant ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button type="button" onClick={handleAddVariant} className="btn-outline w-full py-4 text-xs uppercase tracking-[0.2em] font-medium">
                                    Confirm Variant
                                </button>
                            </div>
                        )}

                        {variants.length > 0 && (
                            <div className="flex flex-col gap-4">
                                {variants.map((variant) => (
                                    <div key={variant.id} className="border border-[var(--border)] bg-[var(--bg-primary)] p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-playfair text-lg mb-1">{variant.color} — {(variant.sizes || []).join(', ')}</p>
                                                <p className="text-[10px] uppercase tracking-widest premium-text-muted">Stock: {variant.stock} | Price: {variant.priceCurrency} {variant.priceAmount}</p>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveVariant(variant.id)} className="text-[10px] uppercase tracking-widest text-[var(--danger)] hover:underline underline-offset-4 transition-colors">
                                                Remove
                                            </button>
                                        </div>

                                        {variant.imagePreviews && variant.imagePreviews.length > 0 && (
                                            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                                                {variant.imagePreviews.map((preview, index) => (
                                                    <div key={index} className="w-14 aspect-square border border-[var(--border)] bg-[var(--bg-primary)] p-1 rounded-lg">
                                                        <img src={preview} alt={`${variant.color} ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="premium-surface p-6 sm:p-10 border border-[var(--border)]">
                        <h3 className="font-playfair text-2xl mb-8 border-b border-[var(--border)] pb-4">
                            Media <span className="text-xs font-light premium-text-muted">*Required</span>
                        </h3>

                        <div className="upload-zone p-16 cursor-pointer flex flex-col items-center justify-center text-center bg-[var(--bg-primary)]" onClick={() => document.getElementById("images").click()}>
                            <input id="images" name="images" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            <div className="text-2xl mb-4 font-light premium-text-muted">↓</div>
                            <p className="font-playfair text-xl mb-2">
                                {images.length === 0 ? "Select imagery" : `${images.length} files attached`}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest premium-text-muted">Max 7 assets · 5MB each</p>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-6 mt-8">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="w-24 aspect-[3/4] border border-[var(--border)] bg-[var(--bg-primary)] p-1 rounded-[10px]">
                                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-[10px]" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length > 0 && (
                            <p className="mt-4 text-xs text-[var(--success)] tracking-widest">✓ {images.length} image(s) selected</p>
                        )}
                    </section>

                    {error && <div className="p-6 border border-[var(--danger)] text-[var(--danger)] text-xs uppercase tracking-widest text-center">{error}</div>}
                    {success && <div className="p-6 border border-[var(--success)] text-[var(--success)] text-xs uppercase tracking-widest text-center">{success}</div>}

                    <div className="flex flex-col sm:flex-row gap-6 mt-8">
                        <button type="button" className="flex-1 btn-outline py-5 text-xs uppercase tracking-[0.2em] font-medium" onClick={() => navigate("/seller")}>
                            Cancel
                        </button>
                        <button type="submit" className="flex-[2] btn-accent py-5 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-50" disabled={loading}>
                            {loading ? "Publishing..." : "Publish to Gallery"}
                        </button>
                    </div>
                </form>
            </main>

        </div>
    );
};

export default CreateProduct;