import { useEffect, useState } from "react";
import axios from "axios";

export default function RechargeAdmin() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchRecharges();
  }, []);

  const fetchRecharges = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5002/api/recharges/history",
        { withCredentials: true } // ensure auth cookies sent
      );

      if (res.data.recharges) {
        setRecharges(res.data.recharges);
        setPagination(res.data.pagination || {});
      } else {
        setRecharges([]);
      }
    } catch (err) {
      console.error("Failed to fetch recharges:", err.response?.data || err);
      setRecharges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("✅ Approve this recharge request?")) return;

    try {
      const response = await axios.post(
        `http://localhost:5002/api/recharges/admin/approve/${id}`,
        { notes: "Approved by admin" },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setRecharges((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, status: "approved", approvedAt: new Date().toISOString() } : r
          )
        );
        alert("Recharge approved successfully ✅");
      }
    } catch (err) {
      console.error("Failed to approve:", err.response?.data || err);
      alert(err.response?.data?.msg || "Failed to approve recharge ❌");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const response = await axios.post(
        `http://localhost:5002/api/recharges/admin/reject/${id}`,
        { reason },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setRecharges((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, status: "rejected", rejectedAt: new Date().toISOString() } : r
          )
        );
        alert("Recharge rejected ❌");
      }
    } catch (err) {
      console.error("Failed to reject:", err.response?.data || err);
      alert(err.response?.data?.msg || "Failed to reject recharge ❌");
    }
  };

  const renderPaymentDetails = (recharge) => {
    if (recharge.method === "bank") {
      return (
        <div className="text-sm">
          <div>
            <strong>Transaction ID:</strong> {recharge.details?.transactionId || "N/A"}
          </div>
          <div>
            <strong>Screenshot:</strong>{" "}
            {recharge.screenshotUrl ? (
              <a 
                href={recharge.screenshotUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View
              </a>
            ) : (
              "N/A"
            )}
          </div>
        </div>
      );
    }
    return <span className="text-gray-400">N/A</span>;
  };

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Recharge Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : recharges.length === 0 ? (
        <p>No recharge requests.</p>
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
              {recharges.map((r) => (
                <tr key={r._id}>
                  <td className="withdraw-td">
                    {r.userId?.username || "N/A"}
                    <br />
                    <small>{r.userId?.email}</small>
                  </td>
                  <td className="withdraw-td">{r.method}</td>
                  <td className="withdraw-td">{renderPaymentDetails(r)}</td>
                  <td className="withdraw-td">{r.pointsToAdd}</td>
                  <td className="withdraw-td">${r.amount}</td>
                  <td className="withdraw-td">{r.status}</td>
                  <td className="withdraw-td">{new Date(r.requestedAt).toLocaleString()}</td>
                  <td className="withdraw-td">
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r._id)}
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
                          onClick={() => handleReject(r._id)}
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
              Showing {recharges.length} of {pagination.total} requests
            </div>
          )}
        </div>
      )}
    </div>
  );
}