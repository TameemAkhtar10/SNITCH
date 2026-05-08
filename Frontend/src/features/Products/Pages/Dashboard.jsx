import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UseProduct from "../Hooks/UseProduct.js";

const useDarkMode = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
        setIsDark(initialDark);
    }, []);

    const toggleDark = () => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    return { isDark, toggleDark };
};

const Dashboard = () => {
    const { handleGetSellerProducts } = UseProduct();
    const navigate = useNavigate();
    const sellerProducts = useSelector((state) => state.product.sellerProducts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const { isDark, toggleDark } = useDarkMode();

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
    };

    const handleEdit = (productId) => {
        navigate(`/seller/edit-product/${productId}`);
    };

    const filteredProducts = filter === "all" ? sellerProducts : sellerProducts;

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

                .glass-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border);
                }

                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            `}</style>

            <header className="sticky top-0 z-40 glass-header flex items-center justify-between px-4 py-3 sm:px-12 sm:py-5">
                <button
                    onClick={() => navigate('/')}
                    className="shrink-0 text-xs uppercase tracking-[0.15em] whitespace-nowrap premium-text-muted hover:text-[var(--text-primary)] transition-colors text-left"
                >
                    Return
                </button>
                <div className="flex-1 text-center">
                    <span className="font-playfair whitespace-nowrap text-sm sm:text-2xl tracking-widest cursor-pointer font-semibold" onClick={() => navigate('/')}>
                        S N I T C H
                    </span>
                </div>
                <div className="shrink-0 flex justify-end items-center gap-6">
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
                    <button
                        onClick={() => navigate("/seller/create-product")}
                        className="shrink-0 text-xs uppercase tracking-widest whitespace-nowrap text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        [+ Add]
                    </button>
                    <button
                        onClick={() => navigate("/seller/orders")}
                        className="shrink-0 text-xs uppercase tracking-widest whitespace-nowrap text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        View Orders
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-24">
                <div className="mb-16">
                    <p className="text-[10px] uppercase tracking-[0.3em] premium-text-muted mb-4">Store Management</p>
                    <h1 className="font-playfair text-5xl lg:text-6xl font-medium leading-tight mb-4">
                        Curator Dashboard
                    </h1>
                    <p className="text-sm font-light premium-text-muted">{sellerProducts?.length || 0} pieces in collection</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-12 sm:mb-16 border-b border-[var(--border)] pb-6 sm:pb-8">
                    <div className="flex flex-wrap gap-4 sm:gap-8">
                        {['all', 'active', 'inactive'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`text-[10px] uppercase tracking-[0.2em] transition-all pb-1 border-b ${filter === f ? 'border-[var(--text-primary)] premium-text' : 'border-transparent premium-text-muted hover:text-[var(--text-primary)]'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="text-[10px] uppercase tracking-widest premium-text-muted hover:text-[var(--text-primary)] transition-colors underline underline-offset-4"
                    >
                        {loading ? "Syncing..." : "Sync Collection"}
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-6 text-xs uppercase tracking-widest flex justify-between items-center border border-[var(--danger)] text-[var(--danger)]">
                        <span>{error}</span>
                        <button onClick={fetchProducts} className="underline underline-offset-4 font-bold">Retry</button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin mb-4"></div>
                        <p className="tracking-[0.2em] text-xs font-medium premium-text-muted uppercase">Loading Portfolio...</p>
                    </div>
                ) : sellerProducts && sellerProducts.length > 0 ? (
                    <>
                        <div className="grid gap-4 sm:gap-8 mb-12 sm:mb-16 grid-cols-1 sm:grid-cols-3">
                            <div className="premium-surface border border-[var(--border)] p-6 sm:p-10 flex flex-col justify-center">
                                <span className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Total Assortment</span>
                                <span className="font-playfair text-5xl font-medium">{sellerProducts.length}</span>
                            </div>
                            <div className="premium-surface border border-[var(--border)] p-6 sm:p-10 flex flex-col justify-center">
                                <span className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Active Pieces</span>
                                <span className="font-playfair text-5xl font-medium">{sellerProducts.filter((p) => p.status !== "inactive").length}</span>
                            </div>
                            <div className="premium-surface border border-[var(--border)] p-6 sm:p-10 flex flex-col justify-center">
                                <span className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Portfolio Value</span>
                                <span className="font-playfair text-5xl font-medium text-[var(--accent)]">
                                    ₹{sellerProducts.reduce((sum, p) => sum + (parseInt(p.price?.amount) || 0), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="group cursor-pointer flex flex-col" onClick={() => navigate(`/seller/edit-product/${product._id}`)}>
                                    <div className="relative aspect-[3/4] w-full bg-[var(--bg-secondary)] overflow-hidden mb-6 border border-[var(--border)] rounded-[10px]">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.title}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100 rounded-[10px]"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest premium-text-muted">No Media</div>
                                        )}
                                        {product.status === "featured" && (
                                            <div className="absolute top-4 left-4 bg-[var(--bg-primary)] px-3 py-1 text-[9px] font-medium tracking-[0.2em] uppercase border border-[var(--border)]">
                                                Featured
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-playfair text-xl transition-colors group-hover:text-[var(--accent)] line-clamp-1 flex-1 pr-4">{product.title}</h3>
                                            <span className="text-sm font-light">
                                                ₹{product.price?.amount?.toLocaleString() || '0'}
                                            </span>
                                        </div>

                                        <p className="text-xs font-light premium-text-muted line-clamp-2 mb-6">
                                            {product.description}
                                        </p>

                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest premium-text-muted border-b border-[var(--border)] pb-4 mb-4">
                                            <span>Variants: {product.variants?.length || 0}</span>
                                            <span>
                                                {(() => {
                                                    const totalStock = product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;
                                                    if (totalStock === 0) {
                                                        return <span style={{ color: '#ef4444' }}>Out of Stock</span>;
                                                    } else if (totalStock <= 5) {
                                                        return <span style={{ color: 'var(--accent)' }}>Low Stock: {totalStock}</span>;
                                                    } else {
                                                        return <span style={{ color: '#10b981' }}>{totalStock} In Stock</span>;
                                                    }
                                                })()}
                                            </span>
                                        </div>

                                        <button
                                            className="text-[10px] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-colors text-left"
                                        >
                                            Modify Piece
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 border border-[var(--border)]">
                        <div className="text-4xl mb-8 font-light premium-text-muted">_</div>
                        <h3 className="font-playfair text-3xl font-medium mb-4">Empty Portfolio</h3>
                        <p className="text-sm font-light premium-text-muted mb-10">You have not curated any pieces yet.</p>
                        <button
                            className="btn-accent px-10 py-4 text-xs uppercase tracking-[0.2em] font-medium"
                            onClick={() => navigate("/seller/create-product")}
                        >
                            Curate First Piece
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
