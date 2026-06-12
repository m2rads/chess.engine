export async function fetchEngineMove(fen) {
  const res = await fetch("/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen }),
  });
  const data = await res.json();
  return data.move; // UCI string, e.g. "e7e5"
}
