import { useState } from 'react'
import variantService from '../services/variant.service'

const useVariant = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const addVariant = async (productId, formData) => {
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            const response = await variantService.addVariant(productId, formData)
            setSuccess('Variant added successfully!')
            return response
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to add variant'
            setError(errorMessage)
            console.error('Add variant error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const getVariants = async (productId) => {
        setLoading(true)
        setError('')
        try {
            const response = await variantService.getVariants(productId)
            return response
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch variants'
            setError(errorMessage)
            console.error('Get variants error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateVariant = async (productId, variantId, data) => {
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            const response = await variantService.updateVariant(productId, variantId, data)
            setSuccess('Variant updated successfully!')
            return response
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update variant'
            setError(errorMessage)
            console.error('Update variant error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const deleteVariant = async (productId, variantId) => {
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            const response = await variantService.deleteVariant(productId, variantId)
            setSuccess('Variant deleted successfully!')
            return response
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete variant'
            setError(errorMessage)
            console.error('Delete variant error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const clearMessages = () => {
        setError('')
        setSuccess('')
    }

    return {
        loading,
        error,
        success,
        addVariant,
        getVariants,
        updateVariant,
        deleteVariant,
        clearMessages,
    }
}

export default useVariant
