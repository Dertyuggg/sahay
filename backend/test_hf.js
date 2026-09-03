require('dotenv').config({ path: '../.env' });
const { InferenceClient } = require("@huggingface/inference");
const fs = require('fs');
async function test() {
  const hfToken = process.env.HF_TOKEN;
  const client = new InferenceClient(hfToken);
  const buffer = fs.readFileSync('test.webm');
  const fileBlob = new Blob([buffer], { type: 'audio/webm' });
  const result = await client.automaticSpeechRecognition({
    model: process.env.HF_MODEL || "openai/whisper-large-v3",
    data: fileBlob,
    provider: process.env.HF_PROVIDER || "auto"
  });
  console.log("Success:", result);
}
test().catch(console.error);
