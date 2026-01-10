import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await api.get("/students");
      setStudents(res.data);
    };
    fetchStudents();
  }, []);

  return (
    <div style={{ width: "250px", padding: "20px", background: "#f0f0f0" }}>
      <Link to="/admin/login">
        <button style={{ width: "100%", marginBottom: "20px" }}>Admin</button>
      </Link>
      <h3>Students</h3>
      {students.map((s) => (
        <Link key={s._id} to={`/student/login/${s._id}`}>
          <div
            style={{
              padding: "10px",
              marginBottom: "5px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {s.name} - {s.roomNo}
          </div>
        </Link>
      ))}
    </div>
  );
}
