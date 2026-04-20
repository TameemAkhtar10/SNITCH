import { createProduct, getSellerProducts } from "../services/product.api"
import { useDispatch } from 'react-redux'
import { setSellerProducts } from "../State/product.slice"



const UseProduct = () => {
    const dispatch = useDispatch();

    const handleCreateProduct = async (formData) => {
        try {
            const response = await createProduct(formData)
            return response?.product || response
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    const handleGetSellerProducts = async () => {
        try {
            const response = await getSellerProducts()
            dispatch(setSellerProducts(response.products))
            return response.products
        } catch (error) {
            console.log(error);

        }
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts
    }
}
export default UseProduct;