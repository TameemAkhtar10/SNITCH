import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UseProduct from "../Hooks/UseProduct.js";
import "./CreateProduct.css";

const CreateProduct = () => {
    const { handleCreateProduct } = UseProduct();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priceAmount: "",
        priceCurrency: "INR",
    });
    const [variants, setVariants] = useState([]);
    const [newVariant, setNewVariant] = useState({
        color: "",
        size: "",
        stock: "",
        priceAmount: "",
        priceCurrency: "INR",
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (event) => {
        const { name, value } = event.target;
        setNewVariant((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddVariant = () => {
        if (!newVariant.color || !newVariant.size || !newVariant.stock || !newVariant.priceAmount) {
            setError("Please fill all variant fields");
            return;
        }
        setVariants([...variants, { ...newVariant, id: Date.now() }]);
        setNewVariant({
            color: "",
            size: "",
            stock: "",
            priceAmount: "",
            priceCurrency: "INR",
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
        setLoading(true);
        try {
            const form = new FormData();
            form.append("title", formData.title);
            form.append("description", formData.description);
            form.append("priceAmount", formData.priceAmount);
            form.append("priceCurrency", formData.priceCurrency);

            // Send variants as structured data instead of JSON
            if (variants.length > 0) {
                const variantsData = variants.map(v => ({
                    color: v.color,
                    size: v.size,
                    stock: v.stock,
                    priceAmount: v.priceAmount,
                    priceCurrency: v.priceCurrency,
                }));
                form.append("variants", JSON.stringify(variantsData));
            }

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
    return (
        <section className="product-root flex min-h-screen items-center justify-center px-7 py-12 sm:px-10">
            <div className="product-form-container mx-auto w-full">
                <p className="product-overline">Create New</p>
                <h2 className="product-title">Add Product</h2>

                <form onSubmit={handleSubmit} className="mt-8">
                    <div className="product-field">
                        <input id="title" name="title" type="text" className="product-input" placeholder=" " value={formData.title} onChange={handleChange} required />
                        <label htmlFor="title" className="product-label">Product Title</label>
                    </div>

                    <div className="product-field">
                        <textarea id="description" name="description" className="product-textarea" placeholder=" " value={formData.description} onChange={handleChange} required />
                        <label htmlFor="description" className="product-label">Description</label>
                    </div>

                    <div className="product-row">
                        <div className="product-field">
                            <input id="priceAmount" name="priceAmount" type="number" className="product-input" placeholder=" " value={formData.priceAmount} onChange={handleChange} step="0.01" required />
                            <label htmlFor="priceAmount" className="product-label">Price</label>
                        </div>
                        <div className="product-field" style={{ width: "130px" }}>
                            <select id="priceCurrency" name="priceCurrency" className="product-select" value={formData.priceCurrency} onChange={handleChange}>
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                            <label htmlFor="priceCurrency" className="product-label product-label--active">Currency</label>
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div style={{ marginTop: "2rem", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600", color: "#111827" }}>
                                Product Variants {variants.length > 0 && `(${variants.length})`}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowVariantForm(!showVariantForm)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    backgroundColor: showVariantForm ? "#ef4444" : "#c9a84c",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                }}
                            >
                                {showVariantForm ? "✕ Close" : "+ Add Variant"}
                            </button>
                        </div>

                        {/* Add Variant Form */}
                        {showVariantForm && (
                            <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "1.5rem" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                    <div className="product-field">
                                        <input
                                            type="text"
                                            name="color"
                                            value={newVariant.color}
                                            onChange={handleVariantChange}
                                            className="product-input"
                                            placeholder=" "
                                            required
                                        />
                                        <label className="product-label">Color</label>
                                    </div>
                                    <div className="product-field">
                                        <input
                                            type="text"
                                            name="size"
                                            value={newVariant.size}
                                            onChange={handleVariantChange}
                                            className="product-input"
                                            placeholder=" "
                                            required
                                        />
                                        <label className="product-label">Size</label>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 130px", gap: "1rem", marginBottom: "1rem" }}>
                                    <div className="product-field">
                                        <input
                                            type="number"
                                            name="stock"
                                            value={newVariant.stock}
                                            onChange={handleVariantChange}
                                            className="product-input"
                                            placeholder=" "
                                            required
                                        />
                                        <label className="product-label">Stock</label>
                                    </div>
                                    <div className="product-field">
                                        <input
                                            type="number"
                                            name="priceAmount"
                                            value={newVariant.priceAmount}
                                            onChange={handleVariantChange}
                                            className="product-input"
                                            placeholder=" "
                                            step="0.01"
                                            required
                                        />
                                        <label className="product-label">Price</label>
                                    </div>
                                    <div className="product-field">
                                        <select
                                            name="priceCurrency"
                                            value={newVariant.priceCurrency}
                                            onChange={handleVariantChange}
                                            className="product-select"
                                        >
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                        <label className="product-label product-label--active">Currency</label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddVariant}
                                    style={{
                                        padding: "0.75rem 1.5rem",
                                        backgroundColor: "#c9a84c",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                    }}
                                >
                                    Add Variant
                                </button>
                            </div>
                        )}

                        {/* Display Added Variants */}
                        {variants.length > 0 && (
                            <div style={{ marginBottom: "1rem" }}>
                                {variants.map((variant, index) => (
                                    <div
                                        key={variant.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "1rem",
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "6px",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        <div>
                                            <p style={{ margin: "0 0 0.25rem 0", fontWeight: "600", color: "#111827" }}>
                                                {variant.color} - {variant.size}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                                                Stock: {variant.stock} | Price: {variant.priceCurrency} {variant.priceAmount}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariant(variant.id)}
                                            style={{
                                                padding: "0.5rem 1rem",
                                                backgroundColor: "#fee2e2",
                                                color: "#dc2626",
                                                border: "1px solid #fecaca",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-upload-zone" onClick={() => document.getElementById("images").click()}>
                        <input id="images" name="images" type="file" multiple accept="image/*" className="product-file-input" onChange={handleImageChange} />
                        <div className="product-upload-icon">↑</div>
                        <p className="product-upload-text">
                            {images.length === 0 ? "Click to upload images" : `${images.length} image(s) selected`}
                        </p>
                        <p className="product-upload-sub">Max 7 images · 5MB each</p>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="product-preview-grid">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="product-preview-item">
                                    <img src={preview} alt={`Preview ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    {error ? <p className="product-error">{error}</p> : null}
                    {success ? <p className="product-success">{success}</p> : null}

                    <button type="submit" className="product-button" disabled={loading}>
                        {loading ? "Publishing..." : "Publish Product"}
                    </button>

                    <button type="button" className="product-back" onClick={() => navigate("/home")}>
                        ← Back to Home
                    </button>
                </form>
            </div>
        </section>
    );
};

export default CreateProduct;