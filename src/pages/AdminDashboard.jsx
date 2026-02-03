import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard({ admin, token, onLogout }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [updateMsg, setUpdateMsg] = useState("");
  const [popupImg, setPopupImg] = useState(""); // for image popup

 useEffect(() => {
  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        "https://backend-hostel-sigma.vercel.app/api/admin/payments",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchPayments();
}, [token]);

const handleStatusUpdate = async (paymentId, status) => {
  const remarks = prompt("Enter remarks (optional):", "");
  try {
    const res = await axios.put(
      `https://backend-hostel-sigma.vercel.app/api/admin/payments/${paymentId}/status`,
      { status, adminRemarks: remarks || "" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPayments((prev) =>
      prev.map((p) => (p._id === paymentId ? res.data.payment : p))
    );
    setUpdateMsg("Payment status updated ✅");
    setTimeout(() => setUpdateMsg(""), 3000);
  } catch (err) {
    console.error("UPDATE FAILED:", err.response?.data || err);
    setUpdateMsg("Update failed ❌");
    setTimeout(() => setUpdateMsg(""), 3000);
  }
};


  const statusColor = (status) => {
    if (status === "Pending") return "#f0ad4e";
    if (status === "Received") return "#4CAF50";
    if (status === "Not Received") return "#f44336";
    return "#777";
  };

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome {admin?.name || "Admin"}</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <div className="filter-section">
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Received">Received</option>
          <option value="Not Received">Not Received</option>
        </select>
      </div>

      <div className="table-responsive">
        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No payments found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Room</th>
                <th>Month</th>
                <th>Year</th>
                <th>Type</th>
                <th>Status</th>
                <th>Screenshot</th>
                <th>Admin Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments
                .filter(p => filterStatus === "All" || p.status === filterStatus)
                .map((p) => (
                  <tr key={p._id}>
                    <td>{p.studentId?.name}</td>
                    <td>{p.studentId?.roomNo}</td>
                    <td>{p.month}</td>
                    <td>{p.year}</td>
                    <td>{p.paymentType}</td>
                    <td style={{ color: statusColor(p.status), fontWeight: "bold" }}>
                      {p.status}
                    </td>
                    <td>
                      {p.screenshotUrl ? (
                        <img
                          src={p.screenshotUrl}
                          alt="Payment"
                          className="payment-thumb"
                          onClick={() => setPopupImg(p.screenshotUrl)}
                        />
                      ) : "-"}
                    </td>
                    <td>{p.adminRemarks || "-"}</td>
                    <td>
                      {p.status?.includes("Pending") && (
                        <div className="action-buttons">
                          <button className="approve-btn" onClick={() => handleStatusUpdate(p._id, "Received")}>
                            Received
                          </button>
                          <button className="reject-btn" onClick={() => handleStatusUpdate(p._id, "Not Received")}>
                            Not Received
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Image popup modal */}
      {popupImg && (
        <div className="image-popup-overlay" onClick={() => setPopupImg("")}>
          <div className="image-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPopupImg("")}>✖</button>
            <img src={popupImg} alt="Full Preview" className="popup-img"/>
          </div>
        </div>
      )}

      {updateMsg && <p className="update-msg">{updateMsg}</p>}
    </div>
  );
}
