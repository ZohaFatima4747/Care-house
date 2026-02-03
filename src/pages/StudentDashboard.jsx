import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function StudentDashboard({ student, token, onLogout }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState("Cash");
  const [cashNote, setCashNote] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = "https://backend-hostel-sigma.vercel.app";

  /* ================= IMAGE COMPRESSION (MOBILE SAFE) ================= */
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400; // Reduced from 600 for smaller payload
          const scale = MAX_WIDTH / img.width;

          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressed = canvas.toDataURL("image/jpeg", 0.3); // Reduced from 0.5 to 0.3
          resolve(compressed);
        };
      };
    });
  };

  /* ================= FETCH PAYMENTS ================= */
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
    return "#ccc";
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setPaymentType("Cash");
    setCashNote("");
    setScreenshotUrl("");
    setSubmitMsg("");
  };

  /* ================= SUBMIT PAYMENT (FIXED) ================= */
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMonth) return;

    // Enhanced validation
    if (paymentType === "Online" && !screenshotUrl) {
      setSubmitMsg("Please upload payment screenshot");
      return;
    }

    if (paymentType === "Cash" && !cashNote.trim()) {
      setSubmitMsg("Please enter cash note");
      return;
    }

    setSubmitting(true);
    setSubmitMsg("");

    try {
      const payload = {
        paymentType,
        cashNote: paymentType === "Cash" ? cashNote.trim() : "",
        screenshotUrl: paymentType === "Online" ? screenshotUrl : "",
        month: selectedMonth,
      };

      console.log("Submitting payment:", payload);

      const res = await axios.post(
        `${BASE_URL}/api/payments/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPayments((prev) => [
        ...prev.filter((p) => p.month !== selectedMonth),
        res.data.payment,
      ]);

      setSubmitMsg("Payment submitted successfully!");
      setSelectedMonth(null);
      setCashNote("");
      setScreenshotUrl("");
    } catch (err) {
      console.error("Payment submission error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setSubmitMsg(
        err.response?.data?.error || "Payment submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getMonthPayment = (month) =>
    payments.find((p) => p.month === month);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome {student.name}</h1>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
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
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const img = await compressImage(file);
                        setScreenshotUrl(img);
                      }
                    }}
                  />
                  <label htmlFor="screenshot-upload" className="upload-btn">
                    {screenshotUrl ? "Change Screenshot" : "Upload Screenshot"}
                  </label>

                  {screenshotUrl && (
                    <img
                      src={screenshotUrl}
                      alt="Preview"
                      className="screenshot-preview"
                    />
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                >
                  Cancel
                </button>
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
                      <td
                        style={{
                          color: statusColor(pay?.status),
                          fontWeight: "bold",
                        }}
                      >
                        {pay?.status || "Not Paid"}
                      </td>
                      <td>{pay?.adminRemarks || "-"}</td>
                      <td>
                        <button
                          className={`pay-btn ${
                            pay?.status === "Received" ? "paid-btn" : ""
                          }`}
                          disabled={pay?.status === "Received"}
                          onClick={() =>
                            pay?.status !== "Received" &&
                            handleMonthClick(month)
                          }
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
