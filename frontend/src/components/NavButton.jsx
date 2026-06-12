export default function NavButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "0.6rem 1.2rem",
        fontSize: "1.1rem",
        fontWeight: "600",
        background: disabled ? "#333" : "#fff",
        color: disabled ? "#666" : "#1a1a1a",
        border: "none",
        borderRadius: "6px",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
