import { useState } from "react";
import KingIcon from "./KingIcon";

export default function ColorPicker({ onSelect }) {
  const [selected, setSelected] = useState("random");

  function handlePlay() {
    if (!selected) return;
    if (selected === "random") {
      onSelect(Math.random() < 0.5 ? "white" : "black");
    } else {
      onSelect(selected);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        background: "#1a1a1a",
      }}
    >
      <p
        style={{
          color: "#aaa",
          fontSize: "1rem",
          margin: 0,
          letterSpacing: "0.05em",
        }}
      >
        PLAY AS
      </p>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <KingIcon
          piece="wk"
          selected={selected === "white"}
          onClick={() => setSelected("white")}
        />
        <KingIcon
          piece="random"
          selected={selected === "random"}
          onClick={() => setSelected("random")}
        />
        <KingIcon
          piece="bk"
          selected={selected === "black"}
          onClick={() => setSelected("black")}
        />
      </div>
      <button
        onClick={handlePlay}
        style={{
          padding: "0.6rem 2.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          background: selected ? "#7fa650" : "#444",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: selected ? "pointer" : "not-allowed",
          transition: "background 0.2s",
        }}
      >
        Play
      </button>
    </div>
  );
}
