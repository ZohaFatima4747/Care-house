import { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import "./Dashboard.css";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Home() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showLogin, setShowLogin] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const [token, setToken] = useState("");

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  const BASE_URL = "https://backend-care-house.vercel.app";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/students`);
        setStudents(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentClick = (student) => {
    setCurrentStudent(student);
    setShowLogin(true);
    setPassword("");
    setLoginError("");
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!currentStudent) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        name: currentStudent.name,
        password,
      });

      setLoggedInStudent(currentStudent);
      setToken(res.data.token);
      setShowLogin(false);
    } catch (err) {
      setLoginError(err.response?.data?.error || "Login failed");
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/login`, {
        name: "admin",
        password: adminPassword,
      });

      setLoggedInAdmin({ name: "Admin" });
      setAdminToken(res.data.token);
      setShowAdminLogin(false);
    } catch (err) {
      setAdminLoginError(err.response?.data?.error || "Admin login failed");
    }
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    setToken("");
    setLoggedInAdmin(null);
    setAdminToken("");
  };

  if (loggedInStudent) {
    return (
      <StudentDashboard
        student={loggedInStudent}
        token={token}
        onLogout={handleLogout}
      />
    );
  }

  if (loggedInAdmin) {
    return (
      <AdminDashboard
        admin={loggedInAdmin}
        token={adminToken}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="home-container">
      <div className="home-left">
        <h1 className="home-heading">Care House</h1>
        <h2 className="subheading">Hostel Payments</h2>

        <button
          className="admin-btn"
          onClick={() => {
            setShowAdminLogin(true);
            setAdminPassword("");
            setAdminLoginError("");
          }}
        >
          Admin
        </button>

        <p className="instruction">Click on your name to login</p>

        {loading ? (
          <p>Loading students...</p>
        ) : (
          <div className="students-grid">
            {students.map((student) => (
              <div
                key={student._id}
                className="student-card"
                onClick={() => handleStudentClick(student)}
              >
                <h3>{student.name}</h3>
                <p>Room: {student.roomNo}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="home-right"></div>

      {showLogin && currentStudent && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h3>Login for {currentStudent.name}</h3>
            <form onSubmit={handleStudentLogin}>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {loginError && <p className="login-error">{loginError}</p>}
              <button type="submit">Login</button>
            </form>
            <button
              className="close-btn"
              onClick={() => setShowLogin(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h3>Admin Login</h3>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                placeholder="Enter Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              {adminLoginError && (
                <p className="login-error">{adminLoginError}</p>
              )}
              <button type="submit">Login</button>
            </form>
            <button
              className="close-btn"
              onClick={() => setShowAdminLogin(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
