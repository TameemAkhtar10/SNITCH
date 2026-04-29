import React, { useState } from 'react'
import useVariant from '../Hooks/useVariant'
import '../Pages/CreateProduct.css'

const VariantManager = ({ productId, onVariantAdded }) => {
    const [showForm, setShowForm] = useState(false)
    const { loading, error, success, addVariant, clearMessages } = useVariant()

    const [formData, setFormData] = useState({
        stock: '',
        priceAmount: '',
        priceCurrency: 'INR',
    })

    const [variantImages, setVariantImages] = useState([])
    const [imagePreviews, setImagePreviews] = useState([])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setVariantImages(files)
        const previews = files.map((file) => URL.createObjectURL(file))
        setImagePreviews(previews)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        clearMessages()

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('stock', formData.stock)
            formDataToSend.append('priceAmount', formData.priceAmount)
            formDataToSend.append('priceCurrency', formData.priceCurrency)
            variantImages.forEach((file) => formDataToSend.append('files', file))

            const response = await addVariant(productId, formDataToSend)

            if (response) {
                setFormData({
                    stock: '',
                    priceAmount: '',
                    priceCurrency: 'INR',
                })
                setVariantImages([])
                setImagePreviews([])
                setShowForm(false)

                if (onVariantAdded) {
                    onVariantAdded(response.variant)
                }

                setTimeout(() => clearMessages(), 3000)
            }
        } catch (err) {
            console.error('Submit error:', err)
        }
    }

    return (
        <div className="variant-manager" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                    Product Variants
                </h3>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: showForm ? '#ef4444' : '#c9a84c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = showForm ? '#dc2626' : '#d4b765')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = showForm ? '#ef4444' : '#c9a84c')}
                >
                    {showForm ? '✕ Close' : '+ Add Variant'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '1rem' }}>
                        <div className="product-field">
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                className="product-input"
                                placeholder=" "
                                required
                            />
                            <label className="product-label">Stock Quantity</label>
                        </div>

                        <div className="product-field">
                            <input
                                type="number"
                                name="priceAmount"
                                value={formData.priceAmount}
                                onChange={handleInputChange}
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
                                value={formData.priceCurrency}
                                onChange={handleInputChange}
                                className="product-select"
                            >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                            <label className="product-label product-label--active">Currency</label>
                        </div>
                    </div>
                    <div
                        className="product-upload-zone"
                        onClick={() => document.getElementById('variant-images').click()}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        <input
                            id="variant-images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="product-file-input"
                            onChange={handleImageChange}
                        />
                        <div className="product-upload-icon">↑</div>
                        <p className="product-upload-text">
                            {variantImages.length === 0 ? 'Click to upload variant images' : `${variantImages.length} image(s) selected`}
                        </p>
                        <p className="product-upload-sub">Max 5 images · 5MB each</p>
                    </div>
                    {imagePreviews.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.75rem' }}>
                                Image Previews
                            </p>
                            <div className="product-preview-grid">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="product-preview-item">
                                        <img src={preview} alt={`Variant preview ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p style={{ color: '#dc2626', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>❌ {error}</p>}
                    {success && <p style={{ color: '#059669', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '6px' }}>✓ {success}</p>}

                    <div style={{ display: 'flex', height: 'fit-content', gap: '1rem' }}>
                        <button type="submit" className="product-btton mt-0" disabled={loading}>
                            {loading ? 'Adding Variant...' : 'Add Variant'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default VariantManager
