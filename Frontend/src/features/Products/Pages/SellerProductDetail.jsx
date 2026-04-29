import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import UseProduct from '../Hooks/UseProduct.js'
import VariantManager from './VariantManager'
import '../Pages/CreateProduct.css'

const SellerProductDetail = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleGetProductById, handleUpdateProduct } = UseProduct()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
    variants: '',
  })

  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
            variants: product.variants ? JSON.stringify(product.variants) : '',
          })
          if (product.images && Array.isArray(product.images)) {
            setExistingImages(product.images)
          }
        }
      } catch (err) {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files)
    setImages(files)
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
    console.log('Selected images:', files)
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
      if (formData.variants) form.append('variants', formData.variants)
      if (existingImages.length > 0) {
        form.append('existingImages', JSON.stringify(existingImages))
      }
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
      <section className="product-root flex min-h-screen items-center justify-center px-7 py-12 sm:px-10">
        <div className="text-center">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="product-root flex min-h-screen items-center justify-center px-7 py-12 sm:px-10">
      <div className="product-form-container mx-auto w-full">
        <p className="product-overline">Edit Product</p>
        <h2 className="product-title">Update Product Details</h2>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="product-field">
            <input
              id="title"
              name="title"
              type="text"
              className="product-input"
              placeholder=" "
              value={formData.title}
              onChange={handleChange}
              required
            />
            <label htmlFor="title" className="product-label">Product Title</label>
          </div>

          <div className="product-field">
            <textarea
              id="description"
              name="description"
              className="product-textarea"
              placeholder=" "
              value={formData.description}
              onChange={handleChange}
              required
            />
            <label htmlFor="description" className="product-label">Description</label>
          </div>

          <div className="product-row">
            <div className="product-field flex-1">
              <input
                id="priceAmount"
                name="priceAmount"
                type="number"
                className="product-input"
                placeholder=" "
                value={formData.priceAmount}
                onChange={handleChange}
                step="0.01"
                required
              />
              <label htmlFor="priceAmount" className="product-label">Price</label>
            </div>
            <div className="product-field" style={{ width: '130px' }}>
              <select
                id="priceCurrency"
                name="priceCurrency"
                className="product-select"
                value={formData.priceCurrency}
                onChange={handleChange}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <label htmlFor="priceCurrency" className="product-label product-label--active">Currency</label>
            </div>
          </div>

         
         
        
          {existingImages.length > 0 && (
            <div>
              <p className="product-overline" style={{ marginTop: '2rem' }}>Current Images</p>
              <div className="product-preview-grid">
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="product-preview-item relative group">
                    <img src={image.url} alt={`Product ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="product-upload-zone" onClick={() => document.getElementById('images').click()}>
            <input
              id="images"
              name="images"
              type="file"
              multiple
              accept="image/*"
              className="product-file-input"
              onChange={handleImageChange}
            />
            <div className="product-upload-icon">↑</div>
            <p className="product-upload-text">
              {images.length === 0 ? 'Click to upload new images' : `${images.length} new image(s) selected`}
            </p>
            <p className="product-upload-sub">Max 7 images · 5MB each (optional)</p>
          </div>
          {imagePreviews.length > 0 && (
            <div>
              <p className="product-overline" style={{ marginTop: '1rem' }}>New Images</p>
              <div className="product-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="product-preview-item">
                    <img src={preview} alt={`New Preview ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error ? <p className="product-error">{error}</p> : null}
          {success ? <p className="product-success">{success}</p> : null}

          <button type="submit" className="product-button" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>

          <button type="button" className="product-back" onClick={() => navigate('/seller')}>
            ← Back to Dashboard
          </button>
        </form>
        <VariantManager
          productId={productId}
          onVariantAdded={(newVariant) => {
            console.log('New variant added:', newVariant)
          }}
        />
      </div>
    </section>
  )
}

export default SellerProductDetail
