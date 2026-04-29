import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        error: null,
        loading: false,
        initializing: true  // Track if we're restoring session on app load
    },
    reducers: {
        setuser: (state, action) => {
            state.user = action.payload
        },
        seterror: (state, action) => {
            state.error = action.payload
        },
        setloading: (state, action) => {
            state.loading = action.payload
        },
        setInitializing: (state, action) => {
            state.initializing = action.payload
        },
        logout: (state) => {
            state.user = null
            state.error = null
        }
    }
})

export const { setuser, seterror, setloading, logout, setInitializing } = authSlice.actions

export default authSlice.reducer