import React, { useState } from 'react'
import useVariant from '../Hooks/useVariant'

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
                setFormData({ stock: '', priceAmount: '', priceCurrency: 'INR' })
                setVariantImages([])
                setImagePreviews([])
                setShowForm(false)
                if (onVariantAdded) onVariantAdded(response.variant)
                setTimeout(() => clearMessages(), 3000)
            }
        } catch (err) {
            console.error('Submit error:', err)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <style>{`
                .vm-input {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    font-family: 'Outfit', sans-serif;
                    width: 100%;
                    padding: 12px 16px;
                    font-size: 0.88rem;
                    outline: none;
                    transition: border-color 0.3s ease;
                }
                .vm-input:focus { border-color: var(--accent); }
                .vm-input::placeholder { color: var(--text-secondary); }

                .vm-upload {
                    background: var(--bg-secondary);
                    border: 1px dashed var(--border);
                    transition: border-color 0.3s ease;
                    cursor: pointer;
                }
                .vm-upload:hover { border-color: var(--accent); }

                .vm-btn-primary {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                    transition: all 0.3s ease;
                    font-family: 'Outfit', sans-serif;
                }
                .vm-btn-primary:hover:not(:disabled) {
                    background: var(--accent);
                    color: #fff;
                    transform: translateY(-1px);
                }
                .vm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                .vm-btn-secondary {
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    font-family: 'Outfit', sans-serif;
                    transition: all 0.3s ease;
                }
                .vm-btn-secondary:hover {
                    border-color: var(--text-primary);
                    color: var(--text-primary);
                }
            `}</style>

            {/* Header */}
            <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted">Product Variants</p>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="text-[10px] uppercase tracking-[0.2em] transition-colors"
                    style={{ color: showForm ? 'var(--text-secondary)' : 'var(--accent)' }}
                >
                    {showForm ? '✕ Close' : '[+ Add Variant]'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8 border border-[var(--border)] premium-surface">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                className="vm-input"
                                placeholder="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Price</label>
                            <input
                                type="number"
                                name="priceAmount"
                                value={formData.priceAmount}
                                onChange={handleInputChange}
                                className="vm-input"
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Currency</label>
                            <select
                                name="priceCurrency"
                                value={formData.priceCurrency}
                                onChange={handleInputChange}
                                className="vm-input appearance-none"
                            >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    {/* Upload */}
                    <div
                        className="vm-upload p-12 flex flex-col items-center justify-center text-center"
                        onClick={() => document.getElementById('variant-images').click()}
                    >
                        <input
                            id="variant-images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <div className="text-xl mb-3 premium-text-muted font-light">↑</div>
                        <p className="text-sm font-medium mb-2">
                            {variantImages.length === 0 ? 'Click to upload variant images' : `${variantImages.length} image(s) selected`}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest premium-text-muted">Max 5 · 5MB each</p>
                    </div>

                    {/* Previews */}
                    {imagePreviews.length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Preview</p>
                            <div className="flex flex-wrap gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="w-20 h-28 overflow-hidden border border-[var(--border)]">
                                        <img src={preview} alt={`Variant preview ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {error && (
                        <div className="p-4 border border-[var(--danger)] text-[var(--danger)] text-xs uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 border border-[var(--success)] text-[var(--success)] text-xs uppercase tracking-widest text-center">
                            {success}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4 pt-2">
                        <button type="submit" className="vm-btn-primary flex-[2] px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-medium" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Variant'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="vm-btn-secondary flex-1 px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default VariantManager