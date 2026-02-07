
# EquiLearn Upgrade Guide

This guide covers the installation and setup for the upgraded EquiLearn system with Classroom, Assignments, and AI features.

## 1. Backend Setup (Flask)

The backend is now a full Python Flask application located in `backend/`.

### Prerequisites
- Python 3.9+
- PostgreSQL (Optional, defaults to SQLite)
- Tesseract OCR (Optional, for real OCR)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Backend
1. Initialize Database & Seed Data:
   ```bash
   python seed_db.py
   ```
2. Run the Server:
   ```bash
   python run.py
   ```
   Server runs at `http://localhost:5000`.

## 2. Frontend Setup (React)

The frontend is in `src/`.

### Installation
1. Install dependencies (if not already):
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

## 3. Usage Guide for New Features

### 🏫 Classroom & Assignments
- **Teacher**: Login (`teacher@equilearn.com`). Go to **"Classrooms"** tab. Create a new Class. Click the class to enter. Use "Assignments" tab to upload a worksheet.
- **Student**: Login (`student@equilearn.com`). Go to **"My Classrooms"**. You will see the assigned class (joined via seed). Click to view content and submit assignments.

### 📄 Document Extraction (OCR)
- **Teacher**: In "My Content", click "Upload Content". Select a mock PDF/Image. The system will simulate extraction (or perform real OCR if Tesseract is installed). content will be auto-translated.

### 💬 Doubt System
- **Student**: Inside a Classroom, go to **"Doubts"**. Ask a question.
- **Teacher**: View doubts in the same tab and reply.

### 🎙️ Voice Features
- Use the **Mic** button in the dashboard or Doubt chat to simulate voice input (uses Browser API).
- Use the **Speaker** icon to read out lessons (TTS).
