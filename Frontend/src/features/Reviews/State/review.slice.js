import { createSlice } from '@reduxjs/toolkit'

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        loading: false,
        error: null
    },
    reducers: {
        setReviews: (state, action) => {
            state.reviews = action.payload || []
            state.error = null
        },
        addOrUpdateReviewInState: (state, action) => {
            const review = action.payload
            const existingIndex = state.reviews.findIndex((item) => String(item._id) === String(review._id))
            if (existingIndex !== -1) {
                state.reviews[existingIndex] = review
            } else {
                state.reviews.unshift(review)
            }
            state.error = null
        },
        removeReviewFromState: (state, action) => {
            state.reviews = state.reviews.filter((item) => String(item._id) !== String(action.payload))
        },
        setReviewStats: (state, action) => {
            state.averageRating = action.payload?.averageRating || 0
            state.totalReviews = action.payload?.totalReviews || 0
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearReviews: (state) => {
            state.reviews = []
            state.averageRating = 0
            state.totalReviews = 0
            state.error = null
        }
    }
})

export const { setReviews, addOrUpdateReviewInState, removeReviewFromState, setReviewStats, setLoading, setError, clearReviews } = reviewSlice.actions

export default reviewSlice.reducer
