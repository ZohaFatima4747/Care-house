import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api"; // adjust path if needed
import "./Dashboard.css";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
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

  /* ================= AUTH TOKEN ================= */
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  /* ================= IMAGE COMPRESSION ================= */
  const compressImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const scale = MAX_WIDTH / img.width;

          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;

          canvas.getContext("2d").drawImage(
            img, 0, 0, canvas.width, canvas.height
          );

          resolve(canvas.toDataURL("image/jpeg", 0.5));
        };
      };
    });

  /* ================= FETCH PAYMENTS ================= */
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments/my");
        setPayments(res.data);
      } catch (err) {
        console.error("Fetch payments error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

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

  /* ================= SUBMIT PAYMENT ================= */
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMonth) return;

    if (paymentType === "Online" && !screenshotUrl) {
      setSubmitMsg("Please upload payment screenshot");
      return;
    }

    setSubmitting(true);
    setSubmitMsg("");

    try {
      const res = await api.post("/payments/submit", {
        paymentType,
        cashNote,
        screenshotUrl,
        month: selectedMonth,
      });

      setPayments((prev) => [
        ...prev.filter((p) => p.month !== selectedMonth),
        res.data.payment,
      ]);

      setSubmitMsg("Payment submitted successfully!");
      setSelectedMonth(null);
      setCashNote("");
      setScreenshotUrl("");
    } catch (err) {
      console.error("Submit error:", err);
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

            <form onSubmit={handlePaymentSubmit}>
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
                  placeholder="Cash note"
                  value={cashNote}
                  onChange={(e) => setCashNote(e.target.value)}
                  required
                />
              )}

              {paymentType === "Online" && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const img = await compressImage(e.target.files[0]);
                      setScreenshotUrl(img);
                    }}
                  />
                  {screenshotUrl && (
                    <img src={screenshotUrl} alt="preview" width="100" />
                  )}
                </>
              )}

              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button type="button" onClick={() => setSelectedMonth(null)}>
                Cancel
              </button>

              {submitMsg && <p>{submitMsg}</p>}
            </form>
          </div>
        </div>
      )}

      <h2>Full Year Payment</h2>

      {loading ? <p>Loading...</p> : (
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => {
              const pay = getMonthPayment(m);
              return (
                <tr key={m}>
                  <td>{m}</td>
                  <td style={{ color: statusColor(pay?.status) }}>
                    {pay?.status || "Not Paid"}
                  </td>
                  <td>
                    <button
                      disabled={pay?.status === "Received"}
                      onClick={() => handleMonthClick(m)}
                    >
                      {pay?.status === "Received" ? "Paid" : "Pay Now"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
