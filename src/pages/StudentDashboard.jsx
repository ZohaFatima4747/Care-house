import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function StudentDashboard({ student, token, onLogout }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState("Cash");
  const [cashNote, setCashNote] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);

  const BASE_URL = "https://backend-care-house.vercel.app";

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/payments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [token]);

  const statusColor = (status) => {
    if (status === "Received") return "#4CAF50";
    if (status === "Pending") return "#f0ad4e";
    if (status === "Not Received") return "#f44336";
    return "#ccc"; // Not Paid
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setPaymentType("Cash");
    setCashNote("");
    setScreenshotUrl("");
    setSubmitMsg("");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMonth) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/payments/submit`,
        { paymentType, cashNote, screenshotUrl, month: selectedMonth },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayments(prev => [
        ...prev.filter(p => p.month !== selectedMonth),
        res.data.payment
      ]);

      setSubmitMsg("Payment submitted successfully!");
      setSelectedMonth(null);
      setCashNote("");
      setScreenshotUrl("");
    } catch (err) {
      console.error(err);
      setSubmitMsg(err.response?.data?.error || "Payment submission failed");
    }
  };

  const getMonthPayment = (month) => payments.find(p => p.month === month);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome {student.name}</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <div className="student-info">
        <p><strong>Room:</strong> {student.roomNo}</p>
        <p><strong>Security Fee:</strong> {student.SecurityFee || "-"}</p>
      </div>

      {selectedMonth && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Payment for {selectedMonth}</h3>
            <form onSubmit={handlePaymentSubmit} className="payment-form">
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>

              {paymentType === "Cash" && (
                <input
                  type="text"
                  placeholder="Enter Cash Note"
                  value={cashNote}
                  onChange={(e) => setCashNote(e.target.value)}
                  required
                />
              )}

              {paymentType === "Online" && (
                <div className="online-payment">
                  <input
                    type="file"
                    id="screenshot-upload"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setScreenshotUrl(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    required
                  />
                  <label htmlFor="screenshot-upload" className="upload-btn">
                    {screenshotUrl ? "Change Screenshot" : "Upload Screenshot"}
                  </label>
                  {screenshotUrl && (
                    <img src={screenshotUrl} alt="Preview" className="screenshot-preview" />
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setSelectedMonth(null)}>Cancel</button>
              </div>
              {submitMsg && <p className="submit-msg">{submitMsg}</p>}
            </form>
          </div>
        </div>
      )}

      <div className="payment-section">
        <h2>Full Year Payment Table</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => {
                  const pay = getMonthPayment(month);
                  return (
                    <tr key={month}>
                      <td>{month}</td>
                      <td>{new Date().getFullYear()}</td>
                      <td>{pay?.paymentType || "-"}</td>
                      <td style={{ color: statusColor(pay?.status), fontWeight: "bold" }}>
                        {pay?.status || "Not Paid"}
                      </td>
                      <td>{pay?.adminRemarks || "-"}</td>
                      <td>
                        <button
                          className={`pay-btn ${pay?.status === "Received" ? "paid-btn" : ""}`}
                          onClick={() => pay?.status !== "Received" && handleMonthClick(month)}
                          disabled={pay?.status === "Received"}
                        >
                          {pay?.status === "Received" ? "Paid" : "Pay Now"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
