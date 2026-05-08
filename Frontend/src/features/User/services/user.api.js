import axios from 'axios'

const api = axios.create({
  baseURL: 'https://snitch-aukv.onrender.com/api/user',
  withCredentials: true,
})

export const getAddressesApi = async () => {
  const res = await api.get('/addresses')
  return res.data
}

export const addAddressApi = async (payload) => {
  const res = await api.post('/address', payload)
  return res.data
}

export const deleteAddressApi = async (addressId) => {
  const res = await api.delete(`/address/${addressId}`)
  return res.data
}

export const setDefaultAddressApi = async (addressId) => {
  const res = await api.patch(`/address/${addressId}/default`)
  return res.data
}

export const updateProfileApi = async (payload) => {
  const res = await api.patch('/profile', payload)
  return res.data
}

export default api
