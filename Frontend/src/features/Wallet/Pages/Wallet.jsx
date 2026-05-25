import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../Hooks/useWallet.js";
import { useRazorpay } from "react-razorpay";

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return storedTheme === "dark" || (!storedTheme && prefersDark);
  });

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return { isDark, toggleDark };
};

const Wallet = () => {
  const navigate = useNavigate();
  const { fetchBalance, fetchTransactions, addMoneyHandler, verifyTopupHandler } = useWallet();
  const balance = useSelector((state) => state.wallet?.balance || 0);
  const transactions = useSelector((state) => state.wallet?.transactions || []);
  const loading = useSelector((state) => state.wallet?.loading);
  const error = useSelector((state) => state.wallet?.error);
  const { Razorpay, isLoading } = useRazorpay();

  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [addMoneyError, setAddMoneyError] = useState("");
  const [addingMoney, setAddingMoney] = useState(false);

  useEffect(() => {
    fetchBalance().catch(() => { });
    fetchTransactions().catch(() => { });
  }, [fetchBalance, fetchTransactions]);

  const formatMoney = (value) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAddMoney = async () => {
    setAddMoneyError("");

    if (!addMoneyAmount || Number(addMoneyAmount) <= 0) {
      setAddMoneyError("Please enter a valid amount");
      return;
    }

    if (Number(addMoneyAmount) < 100) {
      setAddMoneyError("Minimum amount is ₹100");
      return;
    }

    try {
      if (isLoading || !Razorpay) {
        window.alert(
          "Payment gateway is still loading. Please try again in a moment."
        );
        return;
      }

      const response = await addMoneyHandler(Number(addMoneyAmount));
      const razorpayOrder = response?.data?.order;
      const razorpayKey = response?.data?.keyId;

      if (!razorpayKey || !razorpayOrder?.id) {
        setAddMoneyError("Failed to create payment order");
        return;
      }

      setAddingMoney(true);

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Snitch Wallet",
        description: "Add Money to Wallet",
        order_id: razorpayOrder.id,
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await verifyTopupHandler({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              amount: Number(addMoneyAmount),
            });

            if (verifyResponse?.success) {
              window.alert("✓ Money added to wallet successfully!");
              setShowAddMoneyModal(false);
              setAddMoneyAmount("");
              setAddingMoney(false);
              // Refresh balance and transactions
              try {
                await fetchBalance();
                await fetchTransactions();
              } catch (err) {
                console.error("Error refreshing data:", err);
              }
            }
          } catch (err) {
            setAddMoneyError("Payment verification failed. Please try again.");
            setAddingMoney(false);
            console.error("Verification error:", err);
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment popup closed by user");
            setAddingMoney(false);
          },
        },
        prefill: {
          contact: "",
          email: "",
        },
        theme: {
          color: "#b8860b",
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.on("payment.failed", (paymentError) => {
        const message =
          paymentError?.error?.description || "Payment failed. Please try again.";
        setAddMoneyError(message);
        setAddingMoney(false);
        console.error("Payment failed:", paymentError);
      });
      razorpayInstance.open();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to create payment order";
      setAddMoneyError(errorMsg);
      setAddingMoney(false);
      console.error("Add money error:", err);
    }
  };

  const { isDark, toggleDark } = useDarkMode();

  const themeStyles = isDark
    ? `
        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #141414;
            --text-primary: #ffffff;
            --text-secondary: #a3a3a3;
            --accent: #d4af37;
            --border: #262626;
            --danger: #ef4444;
            --success: #10b981;
        }
    `
    : `
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --text-primary: #000000;
            --text-secondary: #525252;
            --accent: #b8860b;
            --border: #e5e5e5;
            --danger: #ef4444;
            --success: #10b981;
        }
    `;

  return (
    <div className="min-h-screen font-outfit premium-bg premium-text transition-colors duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        ${themeStyles}

        .premium-bg { background-color: var(--bg-primary); transition: background-color 0.5s ease; }
        .premium-surface { background-color: var(--bg-secondary); transition: background-color 0.5s ease; }
        .premium-text { color: var(--text-primary); transition: color 0.5s ease; }
        .premium-text-muted { color: var(--text-secondary); transition: color 0.5s ease; }
        .premium-border { border-color: var(--border); transition: border-color 0.5s ease; }
        
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        
        .btn-accent {
            background-color: var(--text-primary);
            color: var(--bg-primary);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-accent:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            background-color: var(--accent);
            color: #fff;
        }
        
        .glass-header {
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border);
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}</style>

      <header className="sticky top-0 z-40 glass-header flex items-center justify-between px-4 py-3 sm:px-12 sm:py-5">
        <button
          onClick={() => navigate("/")}
          className="shrink-0 text-[8px] uppercase tracking-[0.15em] whitespace-nowrap premium-text-muted hover:text-(--text-primary) transition-colors text-left"
        >
          Back Home
        </button>
        <div className="flex-1 text-center">
          <span
            className="font-playfair whitespace-nowrap text-sm sm:text-2xl tracking-widest cursor-pointer font-semibold"
            onClick={() => navigate("/")}
          >
            S N I T C H
          </span>
        </div>
        <div className="shrink-0 flex justify-end items-center gap-4">
          <button
            onClick={toggleDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="shrink-0 text-xs uppercase tracking-widest whitespace-nowrap premium-text-muted hover:text-(--text-primary) transition-colors"
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:py-24">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-3">
            Wallet
          </p>
          <h1 className="font-playfair text-3xl sm:text-5xl md:text-6xl font-medium leading-tight mb-2">
            Your Balance
          </h1>
        </div>

        {error && (
          <div className="mb-8 p-6 border border-(--danger) text-(--danger) text-xs uppercase tracking-widest">
            {String(error)}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="flex flex-col gap-10">
            {/* Balance Card */}
            <div className="premium-surface p-8 sm:p-12 border border-(--border) rounded-lg">
              <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-4">
                Current Balance
              </p>
              <div className="flex items-end gap-4 mb-8">
                <h2 className="font-playfair text-5xl sm:text-7xl font-medium">
                  {formatMoney(balance)}
                </h2>
              </div>
              <button
                onClick={() => setShowAddMoneyModal(true)}
                className="btn-accent px-10 py-4 text-xs uppercase tracking-[0.2em] font-medium"
              >
                Add Money
              </button>
            </div>

            {/* Transactions List */}
            <div>
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2">
                  Transactions
                </p>
                <h3 className="font-playfair text-2xl sm:text-3xl font-medium">
                  Transaction History
                </h3>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-2 border-t-transparent border-(--text-primary) rounded-full animate-spin mb-4"></div>
                  <p className="tracking-[0.2em] text-xs font-medium premium-text-muted uppercase">
                    Loading Transactions...
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="premium-surface p-8 border border-(--border) text-center">
                  <p className="premium-text-muted text-sm">
                    No transactions yet. Add money to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="premium-surface p-4 sm:p-6 border border-(--border) rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`text-xs uppercase tracking-widest font-medium px-2 py-1 rounded ${transaction.type === "credit"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              }`}
                          >
                            {transaction.type === "credit" ? "Credit" : "Debit"}
                          </span>
                        </div>
                        <p className="premium-text font-medium">
                          {transaction.description}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.15em] premium-text-muted mt-1">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className={`font-playfair text-lg sm:text-2xl font-medium ${transaction.type === "credit"
                              ? "text-(--success)"
                              : "text-(--danger)"
                            }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatMoney(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-32 h-fit">
            <div className="premium-surface p-4 sm:p-8 border border-(--border) rounded-lg">
              <h3 className="text-xs uppercase tracking-[0.2em] mb-6 pb-4 border-b border-(--border)">
                Quick Info
              </h3>
              <div className="space-y-4 text-sm premium-text-muted">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-1">
                    Current Balance
                  </p>
                  <p className="premium-text font-medium text-base">
                    {formatMoney(balance)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-1">
                    Total Transactions
                  </p>
                  <p className="premium-text font-medium text-base">
                    {transactions.length}
                  </p>
                </div>
                <div className="pt-4 border-t border-(--border)">
                  <p className="text-[9px] uppercase tracking-[0.15em] mb-3">
                    Use wallet to pay for orders and get instant discounts!
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setShowAddMoneyModal(false)}
          />
          <div className="relative z-60 w-full max-w-md border border-(--border) premium-surface premium-text rounded-3xl p-6 sm:p-8 shadow-2xl mx-4">
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-(--border)">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] premium-text-muted mb-2">
                  Add Money
                </p>
                <h3 className="font-playfair text-2xl">Top up your wallet</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddMoneyModal(false);
                  setAddMoneyAmount("");
                  setAddMoneyError("");
                }}
                className="text-[10px] uppercase tracking-[0.2em] premium-text-muted hover:text-(--text-primary) transition-colors"
              >
                Close
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.2em] premium-text-muted mb-3">
                Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={addMoneyAmount}
                onChange={(e) => {
                  setAddMoneyAmount(e.target.value);
                  setAddMoneyError("");
                }}
                placeholder="Enter amount (minimum ₹100)"
                className="w-full px-4 py-3 border border-(--border) premium-surface premium-text rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) text-sm"
              />
              {addMoneyError && (
                <p className="text-(--danger) text-xs mt-2">{addMoneyError}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddMoney}
                disabled={addingMoney || isLoading}
                className="btn-accent w-full py-3 px-4 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {addingMoney || isLoading ? "Processing..." : "Proceed to Payment"}
              </button>
              <button
                onClick={() => {
                  setShowAddMoneyModal(false);
                  setAddMoneyAmount("");
                  setAddMoneyError("");
                }}
                className="w-full py-3 px-4 text-xs uppercase tracking-[0.2em] font-medium border border-(--border) premium-text hover:bg-(--border) transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
