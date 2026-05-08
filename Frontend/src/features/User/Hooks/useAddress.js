import { useCallback, useState } from 'react'
import { getAddressesApi, addAddressApi, deleteAddressApi, setDefaultAddressApi } from '../services/user.api.js'

export const useAddress = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getAddressesApi()
      setError(null)
      return res.addresses || []
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch addresses')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addAddress = useCallback(async (payload) => {
    try {
      setLoading(true)
      const res = await addAddressApi(payload)
      setError(null)
      return res.addresses || []
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add address')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAddress = useCallback(async (id) => {
    try {
      setLoading(true)
      const res = await deleteAddressApi(id)
      setError(null)
      return res.addresses || []
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete address')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const setDefault = useCallback(async (id) => {
    try {
      setLoading(true)
      const res = await setDefaultAddressApi(id)
      setError(null)
      return res.addresses || []
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to set default address')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, fetchAddresses, addAddress, deleteAddress, setDefault }
}

export default useAddress
