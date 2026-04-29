import { createProduct, getSellerProducts, getAllProducts, getProductById, updateProduct } from "../services/product.api"
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setSellerProducts, setProducts, setCurrentProduct, setLoading, setError, clearCurrentProduct } from "../State/product.slice"



const UseProduct = () => {
    const dispatch = useDispatch();

    const handleCreateProduct = useCallback(async (formData) => {
        try {
            const response = await createProduct(formData)
            return response?.product || response
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, [])

    const handleGetSellerProducts = useCallback(async () => {
        try {
            const response = await getSellerProducts()
            dispatch(setSellerProducts(response.products))
            return response.products
        } catch (error) {
            console.log(error);

        }
    }, [dispatch])

    const handleGetAllProducts = useCallback(async () => {
        try {
            const response = await getAllProducts()
            dispatch(setProducts(response.products))
            return response.products
        }
        catch (error) {
            console.log(error);
        }
    }, [dispatch])

    const handleGetProductById = useCallback(async (productId) => {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const response = await getProductById(productId)
            dispatch(setCurrentProduct(response.product))
            return response.product
        }
        catch (error) {
            console.log(error);
            dispatch(setError(error?.response?.data?.message || "Failed to load product"))
            throw error;
        }
        finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const handleClearCurrentProduct = useCallback(() => {
        dispatch(clearCurrentProduct())
    }, [dispatch])

    const handleUpdateProduct = useCallback(async (productId, formData) => {
        try {
            const response = await updateProduct(productId, formData)
            dispatch(setCurrentProduct(response.product))
            return response?.product || response
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, [dispatch])

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetAllProducts,
        handleGetProductById,
        handleClearCurrentProduct,
        handleUpdateProduct
    }
}


export default UseProduct;