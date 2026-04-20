import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UseProduct from "../Hooks/UseProduct.js";
import "./Dashboard.css";

const Dashboard = () => {
    const { handleGetSellerProducts } = UseProduct();
    const navigate = useNavigate();
    const sellerProducts = useSelector((state) => state.product.sellerProducts);
    console.log("Seller Products:", sellerProducts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setError("");
            setLoading(true);
            await handleGetSellerProducts();
        } catch (err) {
            setError("Failed to load products. Please try again.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (productId) => {
        console.log("Delete product:", productId);
        // Add delete functionality 
    };

    const handleEdit = (productId) => {
        navigate(`/seller/edit-product/${productId}`);
    };

    const filteredProducts = filter === "all" ? sellerProducts : sellerProducts;

    return (
        <section className="dashboard-root">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <p className="dashboard-overline">Your Store</p>
                        <h1 className="dashboard-title">Manage Products</h1>
                        <p className="dashboard-subtitle">
                            {sellerProducts?.length || 0} products listed
                        </p>
                    </div>
                    <button
                        className="dashboard-create-btn"
                        onClick={() => navigate("/seller/create-product")}
                    >
                        <span className="btn-icon">+</span>
                        <span>Add New Product</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-container">
                {/* Filter Bar */}
                <div className="dashboard-filter">
                    <div className="filter-group">
                        <button
                            className={`filter-btn ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All Products
                        </button>
                        <button
                            className={`filter-btn ${filter === "active" ? "active" : ""}`}
                            onClick={() => setFilter("active")}
                        >
                            Active
                        </button>
                        <button
                            className={`filter-btn ${filter === "inactive" ? "active" : ""}`}
                            onClick={() => setFilter("inactive")}
                        >
                            Inactive
                        </button>
                    </div>
                    <button
                        className="filter-refresh"
                        onClick={fetchProducts}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="dashboard-error">
                        <p>{error}</p>
                        <button onClick={fetchProducts}>Retry</button>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="dashboard-loading">
                        <div className="loader"></div>
                        <p>Loading your products...</p>
                    </div>
                ) : sellerProducts && sellerProducts.length > 0 ? (
                    <>
                        {/* Stats Bar */}
                        <div className="dashboard-stats">
                            <div className="stat-card">
                                <span className="stat-label">Total Products</span>
                                <span className="stat-value">{sellerProducts.length}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Active</span>
                                <span className="stat-value">
                                    {sellerProducts.filter(
                                        (p) => p.status !== "inactive"
                                    ).length}
                                </span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Total Value</span>
                                <span className="stat-value">
                                    ₹
                                    {sellerProducts
                                        .reduce(
                                            (sum, p) =>
                                                sum + (parseInt(p.price?.amount) || 0),
                                            0
                                        )
                                        .toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="dashboard-grid">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="product-card">
                                    {/* Product Image */}
                                    <div className="product-card-image">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.title}
                                                className="product-img"
                                            />
                                        ) : (
                                            <div className="product-img-placeholder">
                                                No Image
                                            </div>
                                        )}
                                        <div className="product-overlay">
                                            <div className="overlay-actions">
                                              
                                               
                                            </div>
                                        </div>
                                        {product.status === "featured" && (
                                            <span className="product-badge">Featured</span>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="product-card-content">
                                        <h3 className="product-card-title">
                                            {product.title}
                                        </h3>
                                        <p className="product-card-description">
                                            {product.description.length > 60
                                                ? product.description.substring(0, 60) +
                                                "..."
                                                : product.description}
                                        </p>

                                        {/* Product Details */}
                                        <div className="product-card-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Price</span>
                                                <span className="detail-value">
                                                    ₹{product.price?.amount}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Currency</span>
                                                <span className="detail-value">
                                                    {product.price?.currency}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Variants Info */}
                                        {product.variants && (
                                            <div className="product-variants">
                                                <span className="variant-label">
                                                    Variants: {product.variants}
                                                </span>
                                            </div>
                                        )}

                                        {/* Card Actions */}
                                        <div className="product-card-actions">
                                            <button
                                                className="action-link view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/product/${product._id}`
                                                    )
                                                }
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="dashboard-empty">
                        <div className="empty-icon">📦</div>
                        <h3 className="empty-title">No Products Yet</h3>
                        <p className="empty-text">
                            Start selling by creating your first product
                        </p>
                        <button
                            className="empty-cta"
                            onClick={() => navigate("/seller/create-product")}
                        >
                            Create Your First Product
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Dashboard;
