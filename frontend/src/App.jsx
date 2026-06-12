import { useEffect, useRef, useCallback, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, COLOR, INPUT_EVENT_TYPE } from "cm-chessboard";
import {
  Markers,
  MARKER_TYPE,
} from "cm-chessboard/src/extensions/markers/Markers.js";
import "cm-chessboard/assets/chessboard.css";
import "cm-chessboard/assets/extensions/markers/markers.css";

const SPRITE = "/node_modules/cm-chessboard/assets/pieces/standard.svg";

function KingIcon({ piece, selected, onClick }) {
  const isWhite = piece === "wk";
  const isRandom = piece === "random";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100px",
        height: "100px",
        background: isRandom
          ? "linear-gradient(to bottom right, #c8c8c8 50%, #1a1a1a 50%)"
          : selected
          ? isWhite ? "#e8e8e8" : "#2a2a2a"
          : isWhite ? "#c8c8c8" : "#1a1a1a",
        border: selected ? "3px solid #7fa650" : "3px solid #444",
        borderRadius: "10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "border-color 0.15s",
      }}
    >
      {isRandom ? (
        <span style={{ fontSize: "2.5rem", color: "#777", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>?</span>
      ) : (
        <svg viewBox="0 0 45 45" width="72" height="72" style={{ display: "block" }}>
          <use href={`${SPRITE}#${piece}`} />
        </svg>
      )}
    </button>
  );
}

function ColorPicker({ onSelect }) {
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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2rem",
      background: "#1a1a1a",
    }}>
      <p style={{ color: "#aaa", fontSize: "1rem", margin: 0, letterSpacing: "0.05em" }}>
        PLAY AS
      </p>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <KingIcon piece="wk"     selected={selected === "white"}  onClick={() => setSelected("white")} />
        <KingIcon piece="random" selected={selected === "random"} onClick={() => setSelected("random")} />
        <KingIcon piece="bk"     selected={selected === "black"}  onClick={() => setSelected("black")} />
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

const chess = new Chess();

function highlightCheckmatedKing(board) {
  if (!chess.isCheckmate()) return;
  const kingColor = chess.turn();
  const kingSquare = chess
    .board()
    .flat()
    .find((p) => p && p.type === "k" && p.color === kingColor).square;
  board.addMarker(MARKER_TYPE.frameDanger, kingSquare);
}

async function fetchEngineMove(fen) {
  const res = await fetch("/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen }),
  });
  const data = await res.json();
  return data.move;
}

function Board({ playerColor, onNewGame }) {
  const boardRef = useRef(null);
  const chessboardRef = useRef(null);
  const orientation = playerColor === "white" ? COLOR.white : COLOR.black;
  const playerColorCode = playerColor === "white" ? COLOR.white : COLOR.black;

  const initBoard = useCallback(() => {
    if (chessboardRef.current) chessboardRef.current.destroy();

    const board = new Chessboard(boardRef.current, {
      position: chess.fen(),
      orientation,
      assetsUrl: "/node_modules/cm-chessboard/assets/",
      extensions: [{ class: Markers }],
    });

    board.enableMoveInput((event) => {
      if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        return chess.moves({ square: event.squareFrom, verbose: true }).length > 0;
      }

      if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        try {
          chess.move({ from: event.squareFrom, to: event.squareTo, promotion: "q" });
        } catch {
          return false;
        }

        board.setPosition(chess.fen(), true);
        highlightCheckmatedKing(board);

        if (!chess.isGameOver()) {
          fetchEngineMove(chess.fen()).then((botMove) => {
            chess.move({
              from: botMove.slice(0, 2),
              to: botMove.slice(2, 4),
              promotion: botMove[4] || "q",
            });
            board.setPosition(chess.fen(), true);
            highlightCheckmatedKing(board);
          });
        }

        return true;
      }
    }, playerColorCode);

    chessboardRef.current = board;
  }, [orientation, playerColorCode]);

  useEffect(() => {
    chess.reset();
    initBoard();

    // if playing as black, engine goes first
    if (playerColor === "black") {
      fetchEngineMove(chess.fen()).then((botMove) => {
        chess.move({
          from: botMove.slice(0, 2),
          to: botMove.slice(2, 4),
          promotion: botMove[4] || "q",
        });
        chessboardRef.current?.setPosition(chess.fen(), true);
      });
    }

    return () => chessboardRef.current?.destroy();
  }, [initBoard, playerColor]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.5rem",
      background: "#1a1a1a",
    }}>
      <div ref={boardRef} style={{ width: "600px", height: "600px" }} />
      <button
        onClick={onNewGame}
        style={{
          padding: "0.6rem 2rem",
          fontSize: "1rem",
          fontWeight: "600",
          background: "#fff",
          color: "#1a1a1a",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        New Game
      </button>
    </div>
  );
}

export default function App() {
  const [playerColor, setPlayerColor] = useState(null);

  if (!playerColor) {
    return <ColorPicker onSelect={setPlayerColor} />;
  }

  return (
    <Board
      playerColor={playerColor}
      onNewGame={() => setPlayerColor(null)}
    />
  );
}
