import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

export const getCharacters = () => api.get("/characters").then((r) => r.data);

export const getModels = () => api.get("/models").then((r) => r.data);

export const streamChat = async (character, message, history, modelId, provider, onChunk) => {
  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      character,
      message,
      history,
      model_id: modelId,
      provider,
      stream: true,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.slice(6).trim();
        if (dataStr === "[DONE]") return;
        try {
          const data = JSON.parse(dataStr);
          if (data.text) onChunk(data.text);
          if (data.error) throw new Error(data.error);
        } catch (e) {
          console.error("Error parsing stream chunk", e);
        }
      }
    }
  }
};

export const sendMessage = (character, message, history, modelId, provider) =>
  api.post("/chat", { character, message, history, model_id: modelId, provider, stream: false }).then((r) => r.data);
