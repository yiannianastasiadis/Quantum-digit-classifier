import { useEffect, useRef, useState } from "react";
import "./styles.css";

export default function App() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [msg, setMsg] = useState("Draw a digit (0–9), then click Predict.");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White thick strokes
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }

  function onPointerDown(e) {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e) {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function onPointerUp() {
    drawing.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setMsg("Cleared. Draw a digit and click Predict.");
  }

  function dummyPredict() {
    setMsg("not built yet");
  }

  return (
    <div className="wrap">
      <h1>Digit Classifier (0–9)</h1>
      <p className="sub">Runs in-browser .</p>

      <div className="card">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="pad"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />

        <div className="controls">
          <button onClick={clearCanvas}>Clear</button>
          <button onClick={dummyPredict}>Predict</button>
        </div>

        <div className="result">{msg}</div>
      </div>
    </div>
  );
}