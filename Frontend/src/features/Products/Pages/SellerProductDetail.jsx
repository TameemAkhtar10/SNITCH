import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import UseProduct from '../Hooks/UseProduct.js'
import VariantManager from './VariantManager'

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

const SellerProductDetail = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleGetProductById, handleUpdateProduct } = UseProduct()
  const { isDark, toggleDark } = useDarkMode()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
    stock: '',
    variants: '',
  })

  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const product = await handleGetProductById(productId)
        if (product) {
          setFormData({
            title: product.title || '',
            description: product.description || '',
            priceAmount: product.price?.amount || '',
            priceCurrency: product.price?.currency || 'INR',
            stock: product.stock || '',
            variants: product.variants ? JSON.stringify(product.variants) : '',
          })
          if (product.images && Array.isArray(product.images)) {
            setExistingImages(product.images)
          }
        }
      } catch {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    if (productId) fetchProduct()
  }, [productId, handleGetProductById])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files)
    setImages(files)
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const form = new FormData()
      form.append('title', formData.title)
      form.append('description', formData.description)
      form.append('priceAmount', formData.priceAmount)
      form.append('priceCurrency', formData.priceCurrency)
      form.append('stock', formData.stock)
      if (formData.variants) form.append('variants', formData.variants)
      if (existingImages.length > 0) form.append('existingImages', JSON.stringify(existingImages))
      images.forEach((file) => form.append('files', file))
      await handleUpdateProduct(productId, form)
      setSuccess('Product updated successfully.')
      setTimeout(() => navigate('/seller'), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen font-outfit premium-bg premium-text flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
          ${themeStyles}
          .premium-bg { background-color: var(--bg-primary); }
          .premium-text { color: var(--text-primary); }
          .font-outfit { font-family: 'Outfit', sans-serif; }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">Loading Product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        ${themeStyles}

        .premium-bg { background-color: var(--bg-primary); transition: background-color 0.5s ease; }
        .premium-surface { background-color: var(--bg-secondary); transition: background-color 0.5s ease; }
        .premium-text { color: var(--text-primary); transition: color 0.5s ease; }
        .premium-text-muted { color: var(--text-secondary); transition: color 0.5s ease; }
        .premium-border { border-color: var(--border); }

        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }

        .glass-header {
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border);
        }

        .input-field {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            color: var(--text-primary);
            font-family: 'Outfit', sans-serif;
            transition: all 0.3s ease;
            width: 100%;
            padding: 14px 18px;
            font-size: 0.9rem;
            outline: none;
        }
        .input-field:focus {
            border-color: var(--accent);
        }
        .input-field::placeholder {
            color: var(--text-secondary);
        }

        .upload-zone {
            background: var(--bg-secondary);
            border: 1px dashed var(--border);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .upload-zone:hover {
            border-color: var(--accent);
        }

        .btn-primary {
            background-color: var(--text-primary);
            color: var(--bg-primary);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover {
            background-color: var(--accent);
            color: #fff;
            transform: translateY(-2px);
        }
        .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .btn-secondary {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-secondary);
            transition: all 0.3s ease;
        }
        .btn-secondary:hover {
            border-color: var(--text-primary);
            color: var(--text-primary);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-header flex items-center justify-between px-4 py-3 sm:px-12 sm:py-5">
        <button
          onClick={() => navigate('/seller')}
          className="shrink-0 text-xs uppercase tracking-[0.15em] whitespace-nowrap premium-text-muted hover:text-[var(--text-primary)] transition-colors text-left"
        >
          ← Return
        </button>
        <div className="flex-1 text-center">
          <span className="font-playfair whitespace-nowrap text-sm sm:text-2xl tracking-widest cursor-pointer font-semibold" onClick={() => navigate('/')}>
            S N I T C H
          </span>
        </div>
        <div className="shrink-0 flex justify-end">
          <button
            onClick={toggleDark}
            className="shrink-0 text-xs uppercase tracking-[0.1em] whitespace-nowrap premium-text-muted hover:text-[var(--text-primary)] transition-colors"
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 sm:px-12 py-16 lg:py-24">

        {/* Page Title */}
        <div className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] premium-text-muted mb-4">Store Management</p>
          <h1 className="font-playfair text-5xl lg:text-6xl font-medium leading-tight">
            Edit Piece
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-12">

          {/* Basic Info */}
          <section>
            <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-8 pb-4 border-b border-[var(--border)]">Basic Information</p>
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Product Title</label>
                <input
                  name="title"
                  type="text"
                  className="input-field"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Description</label>
                <textarea
                  name="description"
                  className="input-field resize-y"
                  placeholder="Describe the product"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Price</label>
                  <input
                    name="priceAmount"
                    type="number"
                    className="input-field"
                    placeholder="0.00"
                    value={formData.priceAmount}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </div>
                <div className="w-full sm:w-40">
                  <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Currency</label>
                  <select
                    name="priceCurrency"
                    className="input-field appearance-none"
                    value={formData.priceCurrency}
                    onChange={handleChange}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3 block">Stock Quantity</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section>
            <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-8 pb-4 border-b border-[var(--border)]">Images</p>

            {existingImages.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Current Images</p>
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative group w-24 h-32 overflow-hidden border border-[var(--border)] rounded-[10px]">
                      <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded-[10px]" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-[var(--danger)] text-white w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="upload-zone p-16 flex flex-col items-center justify-center text-center"
              onClick={() => document.getElementById('images').click()}
            >
              <input id="images" name="images" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              <div className="text-2xl mb-4 premium-text-muted font-light">↑</div>
              <p className="text-sm font-medium mb-2">
                {images.length === 0 ? 'Click to upload new images' : `${images.length} image(s) selected`}
              </p>
              <p className="text-[10px] uppercase tracking-widest premium-text-muted">Max 7 · 5MB each</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">Preview</p>
                <div className="flex flex-wrap gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="w-24 h-32 overflow-hidden border border-[var(--border)] rounded-[10px]">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-[10px]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Errors / Success */}
          {error && (
            <div className="p-5 border border-[var(--danger)] text-[var(--danger)] text-xs uppercase tracking-widest text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-5 border border-[var(--success)] text-[var(--success)] text-xs uppercase tracking-widest text-center">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-[var(--border)] pt-10">
            <button
              type="button"
              className="btn-secondary flex-1 px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-medium"
              onClick={() => navigate('/seller')}
            >
              ← Back to Dashboard
            </button>
            <button
              type="submit"
              className="btn-primary flex-[2] px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-medium"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Variant Manager */}
        <section className="mt-16 pt-16 border-t border-[var(--border)]">
          <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-8">Manage Variants</p>
          <VariantManager
            productId={productId}
            onVariantAdded={(newVariant) => console.log('New variant added:', newVariant)}
          />
        </section>

      </main>
    </div>
  )
}

export default SellerProductDetail