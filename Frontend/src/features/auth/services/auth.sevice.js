import axios from 'axios'

let api = axios.create({
    baseURL: 'http://localhost:3000/api/auth',
    withCredentials: true
})

export const register = async ({ email, password, contact, fullname, isSeller }) => {
    try {
        const response = await api.post('/register', { email, password, contact, fullname, isSeller })
        return response.data
    } catch (error) {
        console.log("Register error:", error);
        throw error;
    }
}
export const login = async ({ email, password }) => {
    try {
        const response = await api.post('/login', { email, password })
        return response.data
    }
    catch (error) {
        console.log("Login error:", error);
        throw error;
    }
}
export const getme = async () => {
    try {
        const response = await api.get('/me')
        return response.data
    }
    catch (error) {
        console.log("Get user failed:", error)
        throw error  // Throw error so caller knows request failed
    }
}
