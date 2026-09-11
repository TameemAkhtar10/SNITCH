import axios from 'axios'
import { API_URL } from '../../../config/api.js'

const api = axios.create({
    baseURL: `${API_URL}/api/wishlist`,
    withCredentials: true
})

export const addToWishlist = async (productId) => {
    try {
        const response = await api.post('/add', { productId })
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const removeFromWishlist = async (productId) => {
    try {
        const response = await api.delete(`/remove/${productId}`)
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getWishlist = async () => {
    try {
        const response = await api.get('/')
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}
