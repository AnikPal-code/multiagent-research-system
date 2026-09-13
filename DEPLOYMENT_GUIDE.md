# Deployment Guide for ResearchFlow AI

## Architecture Overview

This project consists of two parts:
1. **Backend (Python/FastAPI)** - Handles the AI research pipeline
2. **Frontend (Expo/React)** - Mobile/Web UI

## Current Issue

The Vercel deployment at https://multiagent-research-system-chi.vercel.app/ shows 404 because:
- Vercel only hosts the frontend
- The backend needs to be deployed separately
- The frontend needs to be configured with the backend API URL

## Deployment Steps

### Step 1: Deploy the Backend (Python FastAPI)

The backend needs a Python hosting service. **Recommended options:**

#### Option A: Railway (Recommended - Easy & Free tier)

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set Root Directory: `/` (or leave empty)
5. Add environment variables:
   - `GOOGLE_API_KEY`: Your Gemini API key
   - `TAVILY_API_KEY`: Your Tavily API key
6. Railway will auto-detect `requirements.txt` and `main.py`
7. Add a start command in railway.toml or settings:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
8. Copy the deployed URL (e.g., `https://your-app.railway.app`)

#### Option B: Render.com

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect repository
3. Settings:
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `GOOGLE_API_KEY`: Your Gemini API key
     - `TAVILY_API_KEY`: Your Tavily API key
4. Copy the deployed URL

#### Option C: Fly.io

1. Install flyctl
2. Run in project root:
   ```bash
   fly launch
   fly secrets set GOOGLE_API_KEY="your-key"
   fly secrets set TAVILY_API_KEY="your-key"
   fly deploy
   ```

### Step 2: Deploy the Frontend to Vercel

#### Option 1: Deploy from GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com) and login
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Important Settings:**
   - **Root Directory**: `mobile`
   - **Framework Preset**: Other (or detect automatically)
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `web-build`
   - **Install Command**: `npm install`
5. **Environment Variables** (CRITICAL):
   - **Name**: `EXPO_PUBLIC_API_URL`
   - **Value**: Your backend URL from Step 1 (e.g., `https://your-app.railway.app`)
6. Click "Deploy"

#### Option 2: Deploy via Vercel CLI

```bash
cd mobile
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- Set root directory to `mobile`
- Add environment variable: `EXPO_PUBLIC_API_URL=https://your-backend-url`

### Step 3: Update Mobile App .env

Update `mobile/.env` with your deployed backend URL:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url-here.railway.app
```

## Project Structure

```
Multi-Agent System/
├── agents.py              # AI agents (search, reader, writer, critic)
├── tools.py               # Web search and scraping tools
├── pipeline.py            # CLI pipeline runner
├── main.py                # FastAPI server (BACKEND)
├── requirements.txt       # Python dependencies
└── mobile/                # Frontend app
    ├── vercel.json        # Vercel configuration
    ├── app.config.js      # Expo configuration
    ├── package.json       # Node dependencies
    └── src/
        ├── api.ts         # API client
        └── screens/
            └── HomeScreen.tsx
```

## Troubleshooting

### "DEPLOYMENT_NOT_FOUND" Error
- The Vercel project may not be properly configured
- Make sure you've set the `mobile` folder as the root directory
- Ensure build command is `npm run build:web`

### "Connection to research server was lost"
- Backend is not deployed or not running
- Check that `EXPO_PUBLIC_API_URL` environment variable is set correctly in Vercel
- Verify backend is accessible (test with curl or browser)

### CORS Errors
- The FastAPI backend already has CORS enabled for `*` (all origins)
- If you want to restrict it, update `main.py`:
  ```python
  allow_origins=["https://your-vercel-app.vercel.app"]
  ```

### Build Fails on Vercel
- Make sure `expo` is listed in package.json dependencies
- Check build logs for specific errors
- Ensure Node version is compatible (16.x or 18.x)

## Testing Locally

### Backend:
```bash
# In project root
.\.venv\Scripts\Activate.ps1  # Windows
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend:
```bash
# In mobile folder
npm install
npm run web
```

Visit http://localhost:19006

## Environment Variables Summary

### Backend (Railway/Render):
- `GOOGLE_API_KEY` - Your Google Gemini API key
- `TAVILY_API_KEY` - Your Tavily search API key

### Frontend (Vercel):
- `EXPO_PUBLIC_API_URL` - Your deployed backend URL

## Next Steps

1. ✅ Choose a backend hosting provider (Railway recommended)
2. ✅ Deploy backend with environment variables
3. ✅ Get backend URL
4. ✅ Configure Vercel with backend URL
5. ✅ Deploy frontend to Vercel
6. ✅ Test the deployed app

## Cost Considerations

- **Railway**: Free tier available (500 hours/month)
- **Render**: Free tier available with limitations
- **Vercel**: Free for hobby projects
- **Gemini API**: Pay-as-you-go ($0.25/1M tokens for 3.5 Flash-Lite)
- **Tavily API**: Check their pricing

## Support

If you encounter issues:
1. Check build logs in Vercel dashboard
2. Check runtime logs in Railway/Render dashboard
3. Test backend endpoint directly: `https://your-backend/health`
4. Verify environment variables are set correctly
