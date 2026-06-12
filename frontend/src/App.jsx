import { useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard, COLOR, INPUT_EVENT_TYPE } from "cm-chessboard";
import {
  Markers,
  MARKER_TYPE,
} from "cm-chessboard/src/extensions/markers/Markers.js";
import "cm-chessboard/assets/chessboard.css";
import "cm-chessboard/assets/extensions/markers/markers.css";

const chess = new Chess();

function highlightCheckmatedKing(board) {
  if (!chess.isCheckmate()) return;
  const kingColor = chess.turn() === "w" ? "w" : "b";
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

export default function App() {
  const boardRef = useRef(null);
  const chessboardRef = useRef(null);

  const initBoard = useCallback(() => {
    if (chessboardRef.current) chessboardRef.current.destroy();

    const board = new Chessboard(boardRef.current, {
      position: chess.fen(),
      orientation: COLOR.white,
      assetsUrl: "/node_modules/cm-chessboard/assets/",
      extensions: [{ class: Markers }],
    });

    board.enableMoveInput((event) => {
      if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        return (
          chess.moves({ square: event.squareFrom, verbose: true }).length > 0
        );
      }

      if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        try {
          chess.move({
            from: event.squareFrom,
            to: event.squareTo,
            promotion: "q",
          });
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
    }, COLOR.white);

    chessboardRef.current = board;
  }, []);

  useEffect(() => {
    initBoard();
    return () => chessboardRef.current?.destroy();
  }, [initBoard]);

  function handleNewGame() {
    chess.reset();
    initBoard();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background: "#1a1a1a",
      }}
    >
      <div ref={boardRef} style={{ width: "600px", height: "600px" }} />
      <button
        onClick={handleNewGame}
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
