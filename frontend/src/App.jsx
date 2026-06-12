import { useState } from "react";
import ColorPicker from "./components/ColorPicker";
import Board from "./components/Board";

export default function App() {
  const [playerColor, setPlayerColor] = useState(null);

  if (!playerColor) {
    return <ColorPicker onSelect={setPlayerColor} />;
  }

  return (
    <Board playerColor={playerColor} onNewGame={() => setPlayerColor(null)} />
  );
}
