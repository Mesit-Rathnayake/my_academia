# My Academia - AI-Powered Student Management System

A comprehensive student management system with a built-in AI Tutor to help you chat with your lecture notes.

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Python 3.10+ (for AI Service)

### 1. Backend Setup
```bash
cd backend
npm install
```
- Configure the `.env` file with your PostgreSQL connection string (`DATABASE_URL`).
- Apply the Prisma schema to your database:
```bash
npx prisma db push
```
- Start the backend server:
```bash
npm start
```
*The backend runs on http://localhost:5001 by default.*

### 2. AI Service Setup
```bash
cd ai-service
python -m venv .venv
```
- Activate the virtual environment (e.g. `.\.venv\Scripts\activate` on Windows).
```bash
pip install -r requirements.txt
```
- Configure `.env` with your `GEMINI_API_KEY`.
- Start the service:
```bash
python -m uvicorn app.main:app --port 8000 --reload
```
*The AI service runs on http://localhost:8000.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
*The frontend runs on http://localhost:3000.*

## 🎯 Features

- **AI Tutor**: Upload your lecture PDFs, create multi-session chats, and interact with your notes using Retrieval-Augmented Generation (RAG).
- **Module Management**: Organize your coursework, assignments, and labs.
- **Progress Tracking**: Keep track of attendance and assignment grades.

## 📊 Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **AI Service**: FastAPI, LangChain, ChromaDB, Google Gemini API