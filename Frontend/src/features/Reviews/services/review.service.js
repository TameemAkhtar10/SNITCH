import axios from 'axios'

const api = axios.create({
    baseURL: 'https://snitch-aukv.onrender.com/api/reviews',
    withCredentials: true
})

export const addReview = async (productId, data) => {
    try {
        const response = await api.post(`/${productId}`, data)
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getReviews = async (productId) => {
    try {
        const response = await api.get(`/${productId}`)
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const deleteReview = async (reviewId) => {
    try {
        const response = await api.delete(`/${reviewId}`)
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}
