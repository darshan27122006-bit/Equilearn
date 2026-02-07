# Complete Setup Guide

Step-by-step guide to set up and run the AI-Based Multilingual Learning Assistant.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup (Optional)](#backend-setup-optional)
4. [Database Setup](#database-setup)
5. [AI Services Configuration](#ai-services-configuration)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js**: Version 18.x or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **Browser**: Chrome 80+, Firefox 75+, Safari 14+, or Edge 80+

### Optional (for Backend)
- **Python**: Version 3.11 or higher
- **PostgreSQL**: Version 12+ or SQLite 3.x
- **RAM**: 8GB minimum (16GB recommended for AI models)

---

## Frontend Setup

### Step 1: Download or Clone the Project

```bash
# If you received the project as a zip file
unzip multilingual-learning-assistant.zip
cd multilingual-learning-assistant

# Or if cloning from git
git clone <repository-url>
cd multilingual-learning-assistant
```

### Step 2: Install Node.js

**Windows:**
1. Download from https://nodejs.org/
2. Run the installer
3. Verify installation:
```bash
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 3: Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
npm install -g pnpm
pnpm install
```

This will install all required packages including:
- React and React DOM
- TypeScript
- Tailwind CSS
- UI component libraries
- All other dependencies

### Step 4: Run the Development Server

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

You should see:
```
  VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser

1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the login page

### Step 6: Test with Demo Accounts

Use these pre-configured accounts to test the application:

**Admin Access:**
- Email: `admin@mlassistant.com`
- Password: `admin123`

**Teacher Access:**
- Email: `teacher@mlassistant.com`
- Password: `teacher123`

**Student Access:**
- Email: `student@mlassistant.com`
- Password: `student123`

---

## Backend Setup (Optional)

The frontend works standalone using localStorage. Follow these steps only if you want to integrate with a real backend.

### Step 1: Install Python

**Windows:**
1. Download from https://www.python.org/downloads/
2. Run installer (check "Add Python to PATH")
3. Verify:
```bash
python --version
pip --version
```

**macOS:**
```bash
brew install python@3.11
python3 --version
pip3 --version
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.11 python3-pip
python3 --version
pip3 --version
```

### Step 2: Create Project Structure

```bash
mkdir backend
cd backend
```

### Step 3: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 4: Create requirements.txt

Create a file named `requirements.txt` with this content:

```
flask==3.0.0
flask-cors==4.0.0
flask-jwt-extended==4.6.0
flask-sqlalchemy==3.1.1
python-dotenv==1.0.0
bcrypt==4.1.2
googletrans==4.0.0
transformers==4.36.0
torch==2.1.2
```

### Step 5: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This may take 10-15 minutes as it downloads AI models and dependencies.

### Step 6: Create Application Files

Follow the structure in `BACKEND_IMPLEMENTATION.md` to create all necessary files.

### Step 7: Set Up Environment Variables

Create a `.env` file:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this
JWT_SECRET_KEY=your-jwt-secret-change-this
DATABASE_URL=sqlite:///dev.db
CORS_ORIGINS=http://localhost:5173
```

### Step 8: Initialize Database

```bash
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### Step 9: Run Backend Server

```bash
python run.py
```

Server should start on `http://localhost:5000`

---

## Database Setup

### Using SQLite (Development)

SQLite is embedded and requires no setup. Data is stored in a file.

**Pros:**
- No installation needed
- Easy to use
- Good for development

**Cons:**
- Limited concurrent access
- Not suitable for production

### Using PostgreSQL (Production)

#### Installation

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the password you set

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE mlassistant;
CREATE USER mluser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE mlassistant TO mluser;
\q
```

#### Update .env

```env
DATABASE_URL=postgresql://mluser:your-password@localhost:5432/mlassistant
```

---

## AI Services Configuration

### Option 1: Use Mock Services (Demo)

The current implementation uses mock AI services. No configuration needed.

**Features:**
- Works offline
- No API keys required
- Good for testing

**Limitations:**
- Not production-ready
- Limited accuracy

### Option 2: Google Cloud Services (Production)

#### Step 1: Create Google Cloud Account

1. Go to https://cloud.google.com/
2. Create an account (Free tier available)
3. Create a new project

#### Step 2: Enable APIs

Enable these APIs in Google Cloud Console:
- Cloud Translation API
- Cloud Speech-to-Text API
- Cloud Text-to-Speech API

#### Step 3: Create Service Account

1. Go to IAM & Admin > Service Accounts
2. Create service account
3. Grant roles:
   - Cloud Translation API User
   - Cloud Speech API User
4. Create JSON key
5. Download the key file

#### Step 4: Set Environment Variables

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Option 3: HuggingFace API (Alternative)

#### Step 1: Create Account

1. Go to https://huggingface.co/
2. Create account
3. Go to Settings > Access Tokens
4. Create new token

#### Step 2: Update Configuration

```env
HUGGINGFACE_API_KEY=your-api-key-here
```

---

## Production Deployment

### Option 1: Deploy Frontend Only

#### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login and deploy:
```bash
vercel login
vercel
```

3. Follow prompts to deploy

#### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to Netlify

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Option 2: Full Stack Deployment

#### Using Docker

1. Create `docker-compose.yml` (see BACKEND_IMPLEMENTATION.md)

2. Build and run:
```bash
docker-compose up -d
```

3. Access at `http://localhost:5173`

#### Using Cloud Platforms

**AWS:**
- Frontend: S3 + CloudFront
- Backend: Elastic Beanstalk or ECS
- Database: RDS PostgreSQL

**Google Cloud:**
- Frontend: Cloud Storage + Cloud CDN
- Backend: Cloud Run
- Database: Cloud SQL

**Azure:**
- Frontend: Static Web Apps
- Backend: App Service
- Database: Azure Database for PostgreSQL

---

## Troubleshooting

### Frontend Issues

#### Issue: "Command not found: npm"

**Solution:**
Node.js is not installed or not in PATH.
- Reinstall Node.js from https://nodejs.org/
- Ensure "Add to PATH" is checked during installation

#### Issue: "Port 5173 is already in use"

**Solution:**
Another application is using the port.
```bash
# Kill the process using the port
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### Issue: "Module not found" errors

**Solution:**
Dependencies not installed properly.
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Browser Issues

#### Issue: Voice input not working

**Solution:**
- Ensure microphone permissions are granted
- Use HTTPS (required for Web Speech API)
- Use Chrome or Edge (best support)
- Check if browser supports Web Speech API:
  ```javascript
  console.log('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  ```

#### Issue: Text-to-speech not working

**Solution:**
- Check browser compatibility
- Ensure system audio is not muted
- Verify language pack is installed
- Try a different voice/language

#### Issue: Data not persisting

**Solution:**
- Check if localStorage is enabled
- Clear browser cache
- Verify storage quota not exceeded
  ```javascript
  console.log(navigator.storage.estimate())
  ```

### Backend Issues

#### Issue: "ModuleNotFoundError" in Python

**Solution:**
Virtual environment not activated or dependencies not installed.
```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### Issue: Database connection error

**Solution:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running:
  ```bash
  # Check status
  sudo systemctl status postgresql
  
  # Start if not running
  sudo systemctl start postgresql
  ```
- Verify database exists:
  ```bash
  psql -U mluser -d mlassistant
  ```

#### Issue: AI models loading slowly

**Solution:**
- First run downloads models (takes time)
- Use GPU if available
- Consider using API services instead of local models

### Performance Issues

#### Issue: Application running slowly

**Solution:**
- Clear localStorage:
  ```javascript
  localStorage.clear()
  ```
- Close other applications
- Use a modern browser
- Check system resources (RAM, CPU)

#### Issue: Large bundle size

**Solution:**
- Build for production:
  ```bash
  npm run build
  ```
- Enable code splitting
- Optimize images
- Remove unused dependencies

---

## Quick Reference Commands

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
python run.py

# Create database tables
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

### Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## Getting Help

If you encounter issues not covered here:

1. **Check Documentation:**
   - README.md
   - API_DOCUMENTATION.md
   - BACKEND_IMPLEMENTATION.md

2. **Browser Console:**
   - Press F12
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Server Logs:**
   - Check terminal output
   - Look for error messages

4. **Common Solutions:**
   - Clear browser cache
   - Restart servers
   - Reinstall dependencies
   - Check environment variables

---

## Next Steps

After successful setup:

1. **Explore Features:**
   - Login with demo accounts
   - Test all three dashboards
   - Try voice features
   - Create content
   - Track progress

2. **Customize:**
   - Add your own content
   - Configure languages
   - Update branding
   - Modify UI colors

3. **Deploy:**
   - Choose hosting platform
   - Set up production database
   - Configure AI services
   - Set up monitoring

4. **Scale:**
   - Add more users
   - Optimize performance
   - Enable caching
   - Set up CDN

---

**Setup Guide Version**: 1.0  
**Last Updated**: February 2, 2026  
**Support**: Check README.md for contact information
