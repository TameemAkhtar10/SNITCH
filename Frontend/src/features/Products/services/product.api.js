import axios from 'axios'

let api = axios.create({
    baseURL: "https://snitch-aukv.onrender.com/api/product",
    withCredentials: true
})

export const createProduct = async (formData) => {

    const response = await api.post('/', formData)
    return response.data

}

export const getSellerProducts = async () => {
    try {
        const response = await api.get('/seller')
        return response.data
    } catch (error) {
        console.log(error);
    }
}

export const getAllProducts = async (params = {}) => {
    try {
        const response = await api.get('/', { params })
        return response.data
    } catch (error) {
        console.log(error);
    }
}
export const getAllproducts = async () => {
    try {
        const response = await api.get('/')
        return response.data
    } catch (error) {
        console.log(error);
    }
}
export const getProductById = async (productId) => {
    try {
        const response = await api.get(`/${productId}`)
        return response.data
    } catch (error) {
        console.log(error);
    }

}

export const updateProduct = async (productId, formData) => {
    try {
        const response = await api.put(`/${productId}`, formData)
        return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}   