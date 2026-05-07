import os
from typing import List, Optional
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
import httpx

from characters import CHARACTER_PERSONALITIES

load_dotenv()

app = FastAPI(title="Character AI Chatbot API", version="1.0.0")

# Allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialise Gemini client
api_key = os.getenv("YOUR_GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("YOUR_GEMINI_API_KEY not found in environment variables.")

client = genai.Client(api_key=api_key)


# ─── Schemas ────────────────────────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role: str          # "user" or "model"
    content: str


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str


class ChatRequest(BaseModel):
    character: str
    message: str
    history: Optional[List[HistoryMessage]] = []
    model_id: Optional[str] = "gemini-2.0-flash"
    provider: Optional[str] = "gemini"
    stream: Optional[bool] = True


class CharacterInfo(BaseModel):
    name: str
    emoji: str
    accent: str
    tagline: str


class ChatResponse(BaseModel):
    reply: str
    character: str


# ─── Routes ─────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Character AI Chatbot API is running."}


@app.get("/characters", response_model=List[CharacterInfo], tags=["Characters"])
def get_characters():
    """Return all available characters with metadata."""
    return [
        CharacterInfo(
            name=name,
            emoji=data["emoji"],
            accent=data["accent"],
            tagline=data["tagline"],
        )
        for name, data in CHARACTER_PERSONALITIES.items()
    ]


@app.get("/models", response_model=List[ModelInfo], tags=["Models"])
async def get_models():
    """Fetch available Gemini models and local LM Studio models."""
    models = [
        ModelInfo(id="gemini-2.0-flash", name="Gemini 2.0 Flash", provider="gemini"),
        ModelInfo(id="gemini-1.5-flash", name="Gemini 1.5 Flash", provider="gemini"),
        ModelInfo(id="gemini-1.5-pro", name="Gemini 1.5 Pro", provider="gemini"),
        # Standard ID variants in case of resolution issues
        ModelInfo(id="models/gemini-1.5-flash", name="Gemini 1.5 Flash (Verbose)", provider="gemini"),
    ]

    # Try to fetch from LM Studio (Async)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://127.0.0.1:1234/v1/models", timeout=2.0)
            if response.status_code == 200:
                data = response.json()
                for m in data.get("data", []):
                    models.append(ModelInfo(
                        id=m["id"],
                        name=f"Local: {m['id']}",
                        provider="lmstudio"
                    ))
    except Exception:
        pass

    return models


@app.post("/chat", tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Send a message to a character and receive a reply.
    Supports streaming and multi-provider selection.
    """
    if request.character not in CHARACTER_PERSONALITIES:
        raise HTTPException(status_code=404, detail="Character not found.")

    character_data = CHARACTER_PERSONALITIES[request.character]
    system_prompt = character_data["system_prompt"]

    # ─── Preparation ───
    if request.provider == "gemini":
        contents = []
        for msg in (request.history or []):
            contents.append(
                types.Content(role=msg.role, parts=[types.Part(text=msg.content)])
            )
        contents.append(
            types.Content(role="user", parts=[types.Part(text=request.message)])
        )

        async def gemini_streamer():
            try:
                # Use stream generator
                response_stream = client.models.generate_content_stream(
                    model=request.model_id or "gemini-2.0-flash",
                    config=types.GenerateContentConfig(system_instruction=system_prompt),
                    contents=contents,
                )
                for chunk in response_stream:
                    if chunk.text:
                        # Use standard EventStream format
                        yield f"data: {json.dumps({'text': chunk.text})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

        if request.stream:
            return StreamingResponse(gemini_streamer(), media_type="text/event-stream")
        
        # Non-streaming fallback
        try:
            res = client.models.generate_content(
                model=request.model_id or "gemini-2.0-flash",
                config=types.GenerateContentConfig(system_instruction=system_prompt),
                contents=contents,
            )
            return ChatResponse(reply=res.text, character=request.character)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    elif request.provider == "lmstudio":
        messages = [{"role": "system", "content": system_prompt}]
        for msg in (request.history or []):
            messages.append({
                "role": "assistant" if msg.role == "model" else msg.role,
                "content": msg.content
            })
        messages.append({"role": "user", "content": request.message})

        async def lmstudio_streamer():
            try:
                async with httpx.AsyncClient() as http_client:
                    async with http_client.stream(
                        "POST",
                        "http://127.0.0.1:1234/v1/chat/completions",
                        json={
                            "model": request.model_id,
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 1024,
                            "stream": True
                        },
                        timeout=60.0
                    ) as response:
                        if response.status_code != 200:
                            err_text = await response.aread()
                            print(f"LM Studio Error ({response.status_code}): {err_text.decode()}")
                            yield f"data: {json.dumps({'error': f'LM Studio Error: {response.status_code}'})}\n\n"
                            return

                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                data_str = line[6:].strip()
                                if data_str == "[DONE]":
                                    break
                                try:
                                    chunk_data = json.loads(data_str)
                                    content = chunk_data["choices"][0]["delta"].get("content", "")
                                    if content:
                                        yield f"data: {json.dumps({'text': content})}\n\n"
                                except:
                                    continue
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

        if request.stream:
            return StreamingResponse(lmstudio_streamer(), media_type="text/event-stream")

        # Non-streaming fallback
        try:
            async with httpx.AsyncClient() as http_client:
                response = await http_client.post(
                    "http://127.0.0.1:1234/v1/chat/completions",
                    json={"model": request.model_id, "messages": messages, "temperature": 0.7},
                    timeout=60.0
                )
                data = response.json()
                return ChatResponse(reply=data["choices"][0]["message"]["content"], character=request.character)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    else:
        raise HTTPException(status_code=400, detail="Invalid provider.")
