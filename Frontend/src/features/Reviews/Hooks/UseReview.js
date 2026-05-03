import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addReview, deleteReview, getReviews } from '../services/review.service.js'
import { setReviews, addOrUpdateReviewInState, removeReviewFromState, setReviewStats, setLoading, setError } from '../State/review.slice.js'

const UseReview = () => {
    const dispatch = useDispatch()
    const reviewState = useSelector((state) => state.review)

    const fetchReviewsByProductId = useCallback(async (productId) => {
        try {
            dispatch(setLoading(true))
            const response = await getReviews(productId)
            dispatch(setReviews(response?.reviews || []))
            dispatch(setReviewStats({
                averageRating: response?.averageRating || 0,
                totalReviews: response?.totalReviews || 0
            }))
            dispatch(setError(null))
            return response
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || 'Failed to fetch reviews'))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const submitReviewHandler = useCallback(async (productId, payload) => {
        try {
            dispatch(setLoading(true))
            const response = await addReview(productId, payload)
            if (response?.review) {
                dispatch(addOrUpdateReviewInState(response.review))
            }
            dispatch(setReviewStats({
                averageRating: response?.averageRating || 0,
                totalReviews: response?.totalReviews || 0
            }))
            dispatch(setError(null))
            return response
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || 'Failed to submit review'))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const deleteReviewHandler = useCallback(async (reviewId) => {
        try {
            dispatch(setLoading(true))
            const response = await deleteReview(reviewId)
            dispatch(removeReviewFromState(reviewId))
            dispatch(setReviewStats({
                averageRating: response?.averageRating || 0,
                totalReviews: response?.totalReviews || 0
            }))
            dispatch(setError(null))
            return response
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || 'Failed to delete review'))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    return {
        ...reviewState,
        fetchReviewsByProductId,
        submitReviewHandler,
        deleteReviewHandler
    }
}

export default UseReview
