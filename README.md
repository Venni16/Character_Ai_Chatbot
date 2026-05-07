# Character AI Chatbot — Full-Stack Migration

This project is a sophisticated, immersive Character AI Chatbot built with **FastAPI**, **React (Vite)**, and **Tailwind CSS v4**.

It originated as the first project in the Udemy course:
**[LLM Engineering, RAG, & AI Agents Masterclass [2026]]**

Originally implemented as a single-turn Jupyter notebook using the Google Gemini SDK, I have enhanced it into a production-grade full-stack application with advanced features like multi-turn memory, real-time streaming, and local LLM support.

---

## 🎭 Features

- **6 Signature Personas**: Chat with Sherlock Holmes, Tony Stark, Yoda, Hermione Granger, Darth Vader, or Albert Einstein.
- **Dynamic Accent Theming**: The entire UI (glows, borders, buttons) shifts its accent color to match the selected character's personality.
- **Hybrid Model Selection**: 
  - **Cloud**: Supports Gemini 2.0 Flash, 1.5 Flash, and 1.5 Pro.
  - **Local**: Full integration with **LM Studio** (OpenAI-compatible) for running models entirely offline on your own hardware.
- **Real-time Streaming**: Enjoy snappy, "fast response" generation using Server-Sent Events (SSE).
- **Immersive Reasoning Filter**: Automatically detects and collapses technical "thinking" blocks from local models, keeping the character roleplay front and center.
- **Multi-turn Context**: Conversations maintain history separately for each character.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python), Google Gemini GenAI SDK, HTTPX (for Local API), Pydantic.
- **Frontend**: React (Vite), Tailwind CSS v4, Axios.
- **Styling**: Premium Google Fonts (`Cinzel Decorative`, `Crimson Pro`), Neo-Gothic Dark Aesthetic.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+ 
- Node.js 18+
- A Google Gemini API Key (get one at [aistudio.google.com](https://aistudio.google.com/))
- (Optional) **LM Studio** for local model support.

### 2. Backend Setup
1. Navigate to the `backend` folder.
2. Create a `.env` file and add your key:
   ```env
   GEMINI_API_KEY=YOUR_API_KEY_HERE
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

---

## 🎓 Project Credits

This project was built as part of the **LLM Engineering, RAG, & AI Agents Masterclass [2026]**.
- **Original Project**: Jupyter Notebook (Gemini API 101)
- **Enhanced Version**: Full-Stack FastAPI + React + LM Studio Integration

---

## ✍️ Author

**Vennilavan Manoharan**

---

## 🛡️ License
MIT
