import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../utils/api";

export default function StudentLogin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { name: id, password });
      setAuthToken(res.data.token);
      localStorage.setItem("studentToken", res.data.token);
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Student Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
