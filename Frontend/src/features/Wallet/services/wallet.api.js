import axios from "axios";

const api = axios.create({
  baseURL: "https://snitch-aukv.onrender.com/api/wallet",
  withCredentials: true,
});

export const getBalanceApi = async () => {
  try {
    const response = await api.get("/balance");
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
};

export const getTransactionsApi = async () => {
  try {
    const response = await api.get("/transactions");
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    throw error;
  }
};

export const addMoneyApi = async (amount) => {
  try {
    const response = await api.post("/add", { amount });
    return response.data;
  } catch (error) {
    console.error("Error creating wallet topup order:", error);
    throw error;
  }
};

export const verifyTopupApi = async (data) => {
  try {
    const response = await api.post("/verify", data);
    return response.data;
  } catch (error) {
    console.error("Error verifying wallet topup:", error);
    throw error;
  }
};

export const payWithWalletApi = async (amount) => {
  try {
    const response = await api.post("/pay", { amount });
    return response.data;
  } catch (error) {
    console.error("Error paying with wallet:", error);
    throw error;
  }
};
