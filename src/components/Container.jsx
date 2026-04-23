export default function Container({ children }) {
  return (
    <div style={page}>
      <div style={wrapper}>{children}</div>
    </div>
  );
}

const page = {
  width: "100%",
  minHeight: "100vh",
  background: "#f5f5f5",
  display: "flex",
  justifyContent: "center"
};

const wrapper = {
  width: "100%",
  maxWidth: 420,
  padding: "20px 15px",
  boxSizing: "border-box"
};