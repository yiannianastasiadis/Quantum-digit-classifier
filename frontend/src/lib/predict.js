import * as ort from "onnxruntime-web";

let sessionPromise = null;

async function getSession() {
  if (!sessionPromise) {
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

  // IMPORTANT: our ONNX export will use input name "input" and output name "logits"
  const input = new ort.Tensor("float32", float32_28x28, [1, 1, 28, 28]);
  const results = await session.run({ input });

  const logits = results.logits.data; // Float32Array length 10
  const { bestIdx, bestProb, probs } = softmax(logits);

  return { digit: bestIdx, confidence: bestProb, probs };
}
