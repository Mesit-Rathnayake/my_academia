# My Academia - AI-Powered Student Management System

A comprehensive, full-stack student management system featuring a built-in AI Tutor that allows users to chat directly with their lecture notes and course materials using Retrieval-Augmented Generation (RAG).

## 🎯 Core Features

- **Context-Aware AI Tutor**: Upload lecture PDFs and instantly chat with them. The AI grounds its answers in the provided documents and cites specific pages for reference.
- **Multi-Session Chat History**: Create multiple conversation threads for different topics (e.g., "Midterm Prep", "Assignment 1") and securely store your chat history.
- **Module & Progress Management**: Organize coursework, track assignment grades, and monitor lecture attendance with dynamic visual indicators.
- **Modern UI/UX**: Built with a vibrant, glassmorphic design system that features responsive layouts, smooth micro-animations, and dynamic color themes.

---

## 🧠 AI Engineering & Architecture

The standout feature of this application is its custom **Retrieval-Augmented Generation (RAG)** pipeline, built as an independent Python microservice.

### AI Stack
* **LLM & Embeddings**: Powered by **Google Gemini Pro** via the Gemini API. Used for generating highly accurate, context-aware responses and creating text embeddings for semantic search.
* **Orchestration**: **LangChain** is used to seamlessly chain together the document loaders, vector stores, and the LLM prompts.
* **Vector Database**: **ChromaDB** is implemented for efficient, local vector storage. It allows the system to perform blazing-fast similarity searches across thousands of embedded document chunks.
* **Document Processing**: **PyMuPDF** (`fitz`) is utilized for robust PDF parsing and text extraction, which is then chunked into manageable semantic blocks before embedding.
* **Microservice API**: The AI backend is built with **FastAPI**, providing a high-performance, asynchronous REST API for the core Node.js backend to communicate with.

### Workflow Example:
1. **Ingestion**: A user uploads a PDF. The Node.js backend saves it and triggers the FastAPI service.
2. **Processing**: FastAPI extracts text via PyMuPDF, chunk it, embeds it via Gemini Embeddings, and stores it in ChromaDB.
3. **Retrieval**: When a user asks a question, the query is embedded, and ChromaDB retrieves the most semantically relevant text chunks.
4. **Generation**: The retrieved context and the user's question are formatted into a prompt and sent to Gemini, which generates a grounded response complete with source citations.

---

## 💻 Full-Stack Technologies

Beyond the AI microservice, the application utilizes a modern, robust web stack:

### Frontend
- **React.js**: Component-driven UI architecture.
- **Tailwind CSS**: Utility-first styling with custom themes, gradients, and glassmorphism effects.
- **React Markdown & KaTeX**: Injected into the chat interface to beautifully render AI-generated markdown and complex mathematical LaTeX equations.

### Core Backend
- **Node.js & Express.js**: Handles user authentication, file routing, and business logic.
- **Prisma ORM**: Type-safe database access and schema management.
- **PostgreSQL**: Relational database for storing user profiles, module data, and persistent chat session histories.
- **JWT Authentication**: Secure, token-based user sessions.