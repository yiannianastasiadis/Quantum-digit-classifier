import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { canvasToMnistFloat32 } from "./lib/preprocess";
import { predictDigit } from "./lib/predict";

export default function App() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const [status, setStatus] = useState("Ready. Draw a digit then Predict.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    setResult(null);
    setStatus("Cleared.");
  }

  async function onPredict() {
    console.log("PREDICT CLICKED");
    setLoading(true);
    setResult(null);
    setStatus("Running inference...");

    try {
      const x = canvasToMnistFloat32(canvasRef.current);
      const pred = await predictDigit(x);
      setResult(pred);
      setStatus("Done.");
    } catch (e) {
      console.error(e);
      setStatus("Prediction failed — check Console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <h1>Digit Classifier (0–9)</h1>
      <p className="sub">In-browser ONNX inference (no backend).</p>

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
          <button onClick={onPredict} disabled={loading}>
            {loading ? "Predicting..." : "Predict"}
          </button>
        </div>

        <div className="result">
          <div className="small">Status: {status}</div>
          {result && (
            <>
              <div className="big">
                Prediction: <span>{result.digit}</span>
              </div>
              <div className="small">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
