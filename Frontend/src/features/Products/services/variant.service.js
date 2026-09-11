import axios from 'axios'
import { API_URL } from '../../../config/api.js'

const axiosInstance = axios.create({
    baseURL: `${API_URL}/api/products`,
    withCredentials: true,
})

const variantService = {
    addVariant: async (productId, formData) => {
        const response = await axiosInstance.post(`/${productId}/variants`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getVariants: async (productId) => {
        const response = await axiosInstance.get(`/${productId}/variants`)
        return response.data
    },

    updateVariant: async (productId, variantId, data) => {
        const response = await axiosInstance.put(`/${productId}/variants/${variantId}`, data)
        return response.data
    },

    deleteVariant: async (productId, variantId) => {
        const response = await axiosInstance.delete(`/${productId}/variants/${variantId}`)
        return response.data
    },
}

export default variantService
