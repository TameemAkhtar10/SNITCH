import axios from 'axios'

let api = axios.create({
    baseURL:'http://localhost:3000/api/auth',
    withCredentials:true
})

export const register = async({email,password,contact,fullname,isSeller})=>{
    try {
        const response = await api.post('/register',{email,password,contact,fullname,isSeller})
        return response.data
    } catch (error) {
        throw error
    }
}