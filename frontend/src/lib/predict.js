import * as ort from "onnxruntime-web";
import ortWasmUrl from "../assets/ort-wasm.wasm?url";

console.log("ORT VERSION", ort.version);
console.log("ORT_WASM_URL", ortWasmUrl);

fetch(ortWasmUrl)
  .then(r => console.log("WASM FETCH", r.status, r.headers.get("content-type")))
  .catch(console.error);

ort.env.wasm.wasmPaths = {
  "ort-wasm.wasm": ortWasmUrl,
  "ort-wasm-simd.wasm": ortWasmUrl,
  "ort-wasm-threaded.wasm": ortWasmUrl,
  "ort-wasm-simd-threaded.wasm": ortWasmUrl,
};

ort.env.wasm.enableWasmStreaming = false;
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;



let sessionPromise = null;

async function getSession() {
  if (!sessionPromise) {
    console.log("Loading ONNX model: /model/baseline.onnx");
    sessionPromise = ort.InferenceSession.create("/model/baseline.onnx", {
      executionProviders: ["wasm"],
    });
  }
  return sessionPromise;
}

function softmax(logits) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) max = Math.max(max, logits[i]);

  const exps = new Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const e = Math.exp(logits[i] - max);
    exps[i] = e;
    sum += e;
  }

  let bestIdx = 0;
  let bestProb = 0;
  const probs = exps.map((e, i) => {
    const p = e / sum;
    if (p > bestProb) {
      bestProb = p;
      bestIdx = i;
    }
    return p;
  });

  return { bestIdx, bestProb, probs };
}

export async function predictDigit(float32_28x28) {
  const session = await getSession();

  const input = new ort.Tensor("float32", float32_28x28, [1, 1, 28, 28]);
  const results = await session.run({ input });

  const logits = results.logits.data;
  const { bestIdx, bestProb, probs } = softmax(logits);

  return { digit: bestIdx, confidence: bestProb, probs };
}
