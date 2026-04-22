import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>🔥 DASHBOARD KYD</h1>

      <button
        onClick={() => navigate("/novo")}
        style={{
          marginTop: 20,
          padding: "12px 20px",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        ➕ Cadastrar novo PET / TAG
      </button>
    </div>
  );
}