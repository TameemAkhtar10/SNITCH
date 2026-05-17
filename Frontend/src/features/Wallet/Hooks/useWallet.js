import {
  getBalanceApi,
  getTransactionsApi,
  addMoneyApi,
  verifyTopupApi,
  payWithWalletApi,
} from "../services/wallet.api.js";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  setBalance,
  setTransactions,
  setWalletLoading,
  setWalletError,
  addTransaction,
} from "../State/wallet.slice.js";

export const useWallet = () => {
  const dispatch = useDispatch();

  const fetchBalance = useCallback(async () => {
    try {
      dispatch(setWalletLoading(true));
      const response = await getBalanceApi();
      if (response?.data?.balance !== undefined) {
        dispatch(setBalance(response.data.balance));
      }
      dispatch(setWalletError(null));
      return response;
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        "Failed to fetch balance";
      dispatch(setWalletError(errorMsg));
      throw error;
    } finally {
      dispatch(setWalletLoading(false));
    }
  }, [dispatch]);

  const fetchTransactions = useCallback(async () => {
    try {
      dispatch(setWalletLoading(true));
      const response = await getTransactionsApi();
      if (Array.isArray(response?.data?.transactions)) {
        dispatch(setTransactions(response.data.transactions));
      }
      dispatch(setWalletError(null));
      return response;
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Failed to fetch transactions";
      dispatch(setWalletError(errorMsg));
      throw error;
    } finally {
      dispatch(setWalletLoading(false));
    }
  }, [dispatch]);

  const addMoneyHandler = useCallback(
    async (amount) => {
      try {
        dispatch(setWalletLoading(true));
        const response = await addMoneyApi(amount);
        dispatch(setWalletError(null));
        return response;
      } catch (error) {
        const errorMsg =
          error?.response?.data?.message || "Failed to create topup order";
        dispatch(setWalletError(errorMsg));
        throw error;
      } finally {
        dispatch(setWalletLoading(false));
      }
    },
    [dispatch]
  );

  const verifyTopupHandler = useCallback(
    async (data) => {
      try {
        dispatch(setWalletLoading(true));
        const response = await verifyTopupApi(data);
        if (response?.data?.balance !== undefined) {
          dispatch(setBalance(response.data.balance));
          // Add transaction to state
          if (data?.amount) {
            dispatch(
              addTransaction({
                type: "credit",
                amount: data.amount,
                description: "Money added to wallet",
                createdAt: new Date().toISOString(),
              })
            );
          }
        }
        dispatch(setWalletError(null));
        return response;
      } catch (error) {
        const errorMsg =
          error?.response?.data?.message || "Failed to verify topup";
        dispatch(setWalletError(errorMsg));
        throw error;
      } finally {
        dispatch(setWalletLoading(false));
      }
    },
    [dispatch]
  );

  const payWithWalletHandler = useCallback(
    async (amount) => {
      try {
        dispatch(setWalletLoading(true));
        const response = await payWithWalletApi(amount);
        if (response?.data?.balance !== undefined) {
          dispatch(setBalance(response.data.balance));
          // Add transaction to state
          dispatch(
            addTransaction({
              type: "debit",
              amount: amount,
              description: "Payment from wallet",
              createdAt: new Date().toISOString(),
            })
          );
        }
        dispatch(setWalletError(null));
        return response;
      } catch (error) {
        const errorMsg =
          error?.response?.data?.message || "Failed to process wallet payment";
        dispatch(setWalletError(errorMsg));
        throw error;
      } finally {
        dispatch(setWalletLoading(false));
      }
    },
    [dispatch]
  );

  return {
    fetchBalance,
    fetchTransactions,
    addMoneyHandler,
    verifyTopupHandler,
    payWithWalletHandler,
  };
};
