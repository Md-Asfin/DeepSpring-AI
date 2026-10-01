# DeepSpring AI

> **Private AI chat, running on your own machine.**

[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring AI](https://img.shields.io/badge/Spring%20AI-1.0.0--M4-green.svg)](https://spring.io/projects/spring-ai)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.14-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20Inference-black.svg)](https://ollama.com/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-R1%20Reasoning-blueviolet.svg)](https://deepseek.com/)

**DeepSpring AI** is a modern, full-stack, privacy-first conversational AI application that runs large language models (such as **DeepSeek R1**) locally on your hardware using **Ollama** and **Spring AI**. Your data, prompts, and chat history never leave your computer.

---

## 🌟 Features

* **100% Local & Private**: All inference and reasoning takes place on your machine. Zero external telemetry or cloud leakage.
* **DeepSeek R1 Reasoning Extraction**: Full progressive streaming and interactive collapsible visualization for DeepSeek `<think>...</think>` reasoning tokens.
* **Real-Time Reactive Streaming**: Built with Spring WebFlux (`Flux<ServerSentEvent>`) and Browser `ReadableStream` for low-latency, token-by-token generation.
* **Rich Markdown & Syntax Highlighting**: Full GitHub Flavored Markdown (GFM) support with syntax-highlighted code blocks, language badges, and one-click copy buttons.
* **Persistent Chat History**: Fast, versioned `localStorage` schema with session creation, instant switching, in-place renaming, and session deletion.
* **Dark & Light Mode**: Seamless dark and light theme switching with automatic system preference detection.
* **Fully Responsive UI**: Polished desktop and mobile-first experience built with React, Vite, and Tailwind CSS.
* **Pluggable Mock AI Provider**: Built-in deterministic mock provider allowing complete frontend and backend development/testing with zero Ollama setup required.
* **Resilient Architecture & Error UX**: Centralized exception handling, clean request validation, actionable UI error banners, and connection health diagnostics.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│             (React 18 + Vite + Tailwind CSS)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
            HTTP POST / SSE    │ (text/event-stream)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 DeepSpring AI Backend Server                │
│                 (Spring Boot 3.4 + Spring AI)               │
│                                                             │
│   ┌───────────────────────┐     ┌───────────────────────┐   │
│   │    ChatController     │────▶│      ChatService      │   │
│   └───────────────────────┘     └───────────┬───────────┘   │
│                                             │               │
│                     ┌───────────────────────┴──────────┐    │
│                     ▼                                  ▼    │
│          ┌─────────────────────┐            ┌────────────────────┐
│          │   MockChatService   │            │ OllamaChatService  │
│          │  (Dev / Test Mode)  │            │  (Live Inference)  │
│          └─────────────────────┘            └──────────┬─────────┘
└────────────────────────────────────────────────────────┼────┘
                                                         │
                                   HTTP REST API (11434) │
                                                         ▼
                                          ┌────────────────────────────┐
                                          │       Ollama Server        │
                                          │    (http://localhost:11434)│
                                          └──────────────┬─────────────┘
                                                         │
                                                         ▼
                                          ┌────────────────────────────┐
                                          │    DeepSeek R1 Model       │
                                          │ (Local Weights / Inference)│
                                          └────────────────────────────┘
```

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed on your machine:

| Requirement | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Java JDK** | Java 21 LTS | Java 21 / 23 / 26 | Backend runtime |
| **Apache Maven** | Maven 3.8+ | Maven 3.9+ | Backend build tool (or use `./mvnw`) |
| **Node.js** | Node.js 18 LTS | Node.js 20+ LTS / 22+ | Frontend runtime |
| **npm** | npm 9+ | npm 10+ | Frontend package manager |
| **Ollama** | 0.5.0+ | Latest Stable | Local LLM inference engine (*optional for Mock mode*) |

---

## 🦙 Ollama Installation & DeepSeek Model Setup

> [!IMPORTANT]
> **Manual User Action Required**: Ollama and model downloads must be run manually by the user. The application will start in **Mock Mode** by default so you can test immediately without Ollama installed.

### 1. Install Ollama

* **Windows**: Download and run the official installer from [https://ollama.com/download/windows](https://ollama.com/download/windows).
* **macOS**: Download from [https://ollama.com/download/mac](https://ollama.com/download/mac) or install via Homebrew: `brew install ollama`.
* **Linux**: Run the official installation script:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

### 2. Verify Ollama Installation

Check that Ollama is installed and running:
```bash
ollama --version
```

Start the Ollama daemon (if not already started as a background service):
```bash
ollama serve
```

### 3. Pull the DeepSeek Model

Pull your preferred DeepSeek model variant depending on your system's VRAM/RAM capacity:

```bash
# Recommended default (balanced reasoning & performance, ~4.7GB)
ollama pull deepseek-r1

# Lightweight variant for systems with low RAM (1.5B parameters, ~1.1GB)
ollama pull deepseek-r1:1.5b

# Larger reasoning models for powerful GPUs
ollama pull deepseek-r1:8b
ollama pull deepseek-r1:14b
ollama pull deepseek-r1:32b
```

Verify the downloaded model:
```bash
ollama list
```

---

## 🚀 Quick Start Guide

### Step 1: Run the Backend

Open a terminal in the project root:

```bash
cd Backend

# Build and run with default Mock AI provider (zero external dependencies)
mvn spring-boot:run
```

To run with **Live Ollama + DeepSeek**:

```bash
# PowerShell (Windows)
$env:AI_PROVIDER="ollama"
$env:OLLAMA_MODEL="deepseek-r1"
mvn spring-boot:run

# Bash (Linux / macOS)
AI_PROVIDER=ollama OLLAMA_MODEL=deepseek-r1 mvn spring-boot:run
```

The backend server will start at `http://localhost:8080`.

### Step 2: Run the Frontend

In a second terminal:

```bash
cd Frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## ⚙️ Configuration & Environment Variables

### Backend Configuration (`Backend/src/main/resources/application.properties`)

| Environment Variable | Property Name | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `AI_PROVIDER` | `app.ai.provider` | `mock` | Active provider: `mock` (development/testing) or `ollama` (live inference). |
| `BACKEND_PORT` | `server.port` | `8080` | Port for the Spring Boot REST API. |
| `ALLOWED_ORIGINS` | `app.cors.allowed-origins` | `http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed CORS origins. |
| `OLLAMA_BASE_URL` | `spring.ai.ollama.base-url` | `http://localhost:11434` | Base URL of the Ollama server. |
| `OLLAMA_MODEL` | `spring.ai.ollama.chat.options.model` | `deepseek-r1` | Ollama model identifier to use. |
| `MOCK_STREAM_DELAY` | `app.mock.stream-delay-millis` | `25` | Delay in milliseconds per token chunk in mock mode. |

### Frontend Configuration (`Frontend/.env`)

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the DeepSpring AI backend. |

---

## 📡 API Contract & Endpoints

### 1. Synchronous Chat Completion
* **Method & Path**: `POST /api/chat`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "prompt": "Explain quicksort in Java",
    "conversationId": "session-123",
    "model": "deepseek-r1"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Here is how Quicksort works...",
    "reasoningContent": "Thinking about the partitioning algorithm...",
    "conversationId": "session-123",
    "model": "deepseek-r1",
    "finishReason": "stop",
    "timestamp": "2026-10-01T04:30:00Z"
  }
  ```

---

### 2. Server-Sent Events (SSE) Streaming Chat
* **Method & Path**: `POST /api/chat/stream`
* **Content-Type**: `application/json`
* **Accept**: `text/event-stream`
* **Stream Events**:
  ```
  event: message
  data: {"thinkingChunk":"Analyzing request..."}

  event: message
  data: {"content":"Here "}

  event: message
  data: {"content":"is the answer."}

  event: done
  data: {"isDone":true,"conversationId":"session-123","model":"deepseek-r1"}
  ```

---

### 3. Health & Diagnostics
* **Method & Path**: `GET /api/health`
* **Success Response (`200 OK`)**:
  ```json
  {
    "status": "UP",
    "application": "DeepSpring AI",
    "version": "1.0.0",
    "aiProvider": "mock",
    "configuredModel": "deepseek-r1",
    "ollamaBaseUrl": "http://localhost:11434",
    "timestamp": "2026-10-01T04:30:00Z",
    "details": {
      "streamingSupported": true,
      "thinkingExtractionSupported": true
    }
  }
  ```

---

### 4. Models List
* **Method & Path**: `GET /api/models`
* **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1",
      "description": "Active configured DeepSeek reasoning model",
      "supportsThinking": true,
      "isDefault": true
    },
    {
      "id": "deepseek-r1:1.5b",
      "name": "DeepSeek R1 (1.5B)",
      "description": "Lightweight reasoning model for fast inference",
      "supportsThinking": true,
      "isDefault": false
    }
  ]
  ```

---

### 5. Standardized Error Response
When a validation error, bad request, or service outage occurs:
```json
{
  "timestamp": "2026-10-01T04:30:00Z",
  "status": 503,
  "error": "AI_SERVICE_UNAVAILABLE",
  "message": "The local AI service is unavailable. Start Ollama and make sure the model is installed.",
  "path": "/api/chat"
}
```

---

## 🧪 Testing & Verification

### Run Backend Tests

```bash
cd Backend
mvn clean test
```
* **Coverage**: `ChatControllerTest`, `GlobalExceptionHandlerTest`, `MockChatServiceTest`, `DeepSeekResponseParserTest`, `DeepSpringAiApplicationTests`.
* Tests run deterministically and **do not require Ollama**.

### Run Frontend Tests

```bash
cd Frontend
npm run test
```
* **Coverage**: `storage.test.ts`, `Composer.test.tsx`, `ThinkingSection.test.tsx`.

### Production Builds

```bash
# Backend jar package
cd Backend
mvn clean package

# Frontend production bundle
cd Frontend
npm run build
```

---

## 📁 Project Structure

```
DeepSpring AI/
├── Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/deepspring/ai/
│   │   │   │   ├── config/
│   │   │   │   │   ├── AiConfig.java
│   │   │   │   │   ├── AppProperties.java
│   │   │   │   │   └── CorsConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── ChatController.java
│   │   │   │   │   └── HealthController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── ChatChunkResponse.java
│   │   │   │   │   ├── ChatRequest.java
│   │   │   │   │   ├── ChatResponse.java
│   │   │   │   │   ├── ErrorResponse.java
│   │   │   │   │   ├── HealthResponse.java
│   │   │   │   │   └── ModelInfo.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── AiServiceException.java
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   └── InvalidRequestException.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── ChatService.java
│   │   │   │   │   ├── MockChatService.java
│   │   │   │   │   └── OllamaChatService.java
│   │   │   │   ├── util/
│   │   │   │   │   └── DeepSeekResponseParser.java
│   │   │   │   └── DeepSpringAiApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       └── java/com/deepspring/ai/
│   │           ├── ChatControllerTest.java
│   │           ├── DeepSeekResponseParserTest.java
│   │           ├── DeepSpringAiApplicationTests.java
│   │           ├── GlobalExceptionHandlerTest.java
│   │           └── MockChatServiceTest.java
│   └── pom.xml
│
├── Frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── Composer.test.tsx
│   │   │   ├── storage.test.ts
│   │   │   └── ThinkingSection.test.tsx
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatArea.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── Composer.tsx
│   │   │   │   └── ThinkingSection.tsx
│   │   │   ├── common/
│   │   │   │   ├── ErrorBanner.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── markdown/
│   │   │   │   ├── CodeBlock.tsx
│   │   │   │   └── MarkdownRenderer.tsx
│   │   │   └── sidebar/
│   │   │       └── Sidebar.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   └── useTheme.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── storage.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── setupTests.ts
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🛠️ Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **"Unable to connect to DeepSpring AI backend"** | The Spring Boot backend server is not running on port 8080. | Run `mvn spring-boot:run` in the `Backend` directory. |
| **"Local AI service is unavailable"** | Ollama daemon is offline or configured model has not been pulled. | Run `ollama serve` and `ollama pull deepseek-r1`. Alternatively, leave `AI_PROVIDER=mock` for testing. |
| **CORS policy error in browser console** | Frontend origin does not match backend `ALLOWED_ORIGINS`. | Set `ALLOWED_ORIGINS=http://localhost:5173` in backend environment or `application.properties`. |
| **Port 8080 or 5173 already in use** | Another process is occupying the port. | Change `server.port` via `BACKEND_PORT=8081` and update `VITE_API_BASE_URL` accordingly. |
| **Streaming stops abruptly** | Network interruption or client clicked "Stop". | DeepSpring AI preserves all partially streamed tokens and thinking blocks. Refresh or click retry if needed. |

---

## 🚀 Deployment Notes

* **Self-Hosted & Local Deployment**: The recommended deployment model is running both backend and Ollama on a single machine or local server equipped with GPU/CPU resources.
* **Separated Frontend Hosting**: The React + Vite frontend can be deployed statically (e.g., on Vercel, Netlify, or Nginx). However, a frontend deployed in the cloud **cannot directly reach `localhost:11434` on your computer**. You must deploy the Spring Boot backend on a server accessible to the frontend and configure `VITE_API_BASE_URL` with the backend's public domain.

---

## 📄 License

This project is licensed under the MIT License.
