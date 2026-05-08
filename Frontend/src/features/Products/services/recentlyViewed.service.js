import axios from 'axios'

const api = axios.create({
    baseURL: 'https://snitch-aukv.onrender.com/api/user',
    withCredentials: true
})

export const addRecentlyViewed = async (productId) => {
    try {
        const response = await api.post('/recently-viewed', { productId })
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getRecentlyViewed = async () => {
    try {
        const response = await api.get('/recently-viewed')
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}
