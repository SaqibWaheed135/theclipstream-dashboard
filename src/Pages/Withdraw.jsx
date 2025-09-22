import { useEffect, useState } from "react";
import axios from "axios";

export default function Withdraw() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get(
        "https://theclipstream-backend.onrender.com/api/withdrawals/history",
        { withCredentials: true } // ensure auth cookies sent
      );

      if (res.data.withdrawals) {
        setWithdrawals(res.data.withdrawals);
        setPagination(res.data.pagination || {});
      } else {
        setWithdrawals([]);
      }
    } catch (err) {
      console.error("Failed to fetch withdrawals:", err.response?.data || err);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("✅ Approve this withdrawal request?")) return;

    try {
      const response = await axios.post(
        `https://theclipstream-backend.onrender.com/api/withdrawals/admin/approve/${id}`,
        { notes: "Approved by admin" },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === id ? { ...w, status: "approved", approvedAt: new Date().toISOString() } : w
          )
        );
        alert("Withdrawal approved successfully ✅");
      }
    } catch (err) {
      console.error("Failed to approve:", err.response?.data || err);
      alert(err.response?.data?.msg || "Failed to approve withdrawal ❌");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const response = await axios.post(
        `https://theclipstream-backend.onrender.com/api/withdrawals/admin/reject/${id}`,
        { reason },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === id ? { ...w, status: "rejected", rejectedAt: new Date().toISOString() } : w
          )
        );
        alert("Withdrawal rejected ❌");
      }
    } catch (err) {
      console.error("Failed to reject:", err.response?.data || err);
      alert(err.response?.data?.msg || "Failed to reject withdrawal ❌");
    }
  };

  const renderPaymentDetails = (withdrawal) => {
    if (withdrawal.method === "bank") {
      return (
        <div className="text-sm">
          <div>
            <strong>Account:</strong>{" "}
            {withdrawal.details?.bankDetails?.accountNumber || "N/A"}
          </div>
          <div>
            <strong>Bank:</strong>{" "}
            {withdrawal.details?.bankDetails?.bankName || "N/A"}
          </div>
          <div>
            <strong>IFSC:</strong>{" "}
            {withdrawal.details?.bankDetails?.ifsc || "N/A"}
          </div>
        </div>
      );
    } else if (withdrawal.method === "paypal") {
      return <div>{withdrawal.details?.paypalEmail}</div>;
    } else if (withdrawal.method === "card") {
      return (
        <div>
          <strong>Card:</strong>{" "}
          {withdrawal.details?.cardDetails?.cardNumber || "N/A"}
        </div>
      );
    }
    return <span className="text-gray-400">N/A</span>;
  };

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Withdrawal Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p>No withdrawal requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="withdraw-table">
            <thead>
              <tr>
                <th className="withdraw-th">User</th>
                <th className="withdraw-th">Method</th>
                <th className="withdraw-th">Details</th>
                <th className="withdraw-th">Points</th>
                <th className="withdraw-th">Amount</th>
                <th className="withdraw-th">Status</th>
                <th className="withdraw-th">Requested At</th>
                <th className="withdraw-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id}>
                  <td className="withdraw-td">
                    {w.userId?.username || "N/A"}
                    <br />
                    <small>{w.userId?.email}</small>
                  </td>
                  <td className="withdraw-td">{w.method}</td>
                  <td className="withdraw-td">{renderPaymentDetails(w)}</td>
                  <td className="withdraw-td">{w.pointsToDeduct}</td>
                  <td className="withdraw-td">${w.amount}</td>
                  <td className="withdraw-td">{w.status}</td>
                  <td className="withdraw-td">{new Date(w.requestedAt).toLocaleString()}</td>
                  <td className="withdraw-td">
                    {w.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(w._id)}
                          style={{
                            backgroundColor: "#27ae60",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontFamily: "poppins",
                            marginRight: "5px",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(w._id)}
                          style={{
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontFamily: "poppins",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Info */}
          {pagination && pagination.total && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {withdrawals.length} of {pagination.total} requests
            </div>
          )}
        </div>
      )}
    </div>
  );
}