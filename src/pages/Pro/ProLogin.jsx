import {
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

export default function ProLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/pro", {
      replace: true,
    });
  }, [navigate]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f2ec",
        padding: "24px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#374151",
        }}
      >
        Abrindo Portal TAP PRO...
      </p>
    </main>
  );
}