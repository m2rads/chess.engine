import { Chess } from "chess.js";
import { MARKER_TYPE } from "cm-chessboard/src/extensions/markers/Markers.js";

// single shared game instance
export const chess = new Chess();

// applies a UCI move string (e.g. "e7e5", "a7a8q") to the game
export function applyUciMove(uci) {
  chess.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci[4] || "q",
  });
}

export function highlightCheckmatedKing(board) {
  if (!chess.isCheckmate()) return;
  const kingColor = chess.turn();
  const kingSquare = chess
    .board()
    .flat()
    .find((p) => p && p.type === "k" && p.color === kingColor).square;
  board.addMarker(MARKER_TYPE.frameDanger, kingSquare);
}
