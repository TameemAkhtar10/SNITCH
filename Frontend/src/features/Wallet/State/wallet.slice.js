import { createSlice } from '@reduxjs/toolkit'

const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        balance: 0,
        transactions: [],
        loading: false,
        error: null,
    },
    reducers: {
        setBalance: (state, action) => {
            state.balance = action.payload
            state.error = null
        },
        setTransactions: (state, action) => {
            state.transactions = action.payload
            state.error = null
        },
        setWalletLoading: (state, action) => {
            state.loading = action.payload
        },
        setWalletError: (state, action) => {
            state.error = action.payload
        },
        addTransaction: (state, action) => {
            state.transactions.unshift(action.payload)
        },
        clearWalletError: (state) => {
            state.error = null
        }
    }
})

export const { setBalance, setTransactions, setWalletLoading, setWalletError, addTransaction, clearWalletError } = walletSlice.actions
export default walletSlice.reducer
