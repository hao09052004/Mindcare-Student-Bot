# Mindcare Student Bot - Deployment Guide

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   User      │────▶│  Frontend   │────▶│  FastAPI Backend │
│  (Browser)  │◀────│  (Vercel)   │◀────│  (Render)        │
└─────────────┘     └─────────────┘     └────────┬─────────┘
                                                  │
                                                  ▼
                                        ┌────────────────────┐
                                        │ Cloudflare Workers  │
                                        │ AI (@cf/meta/llama) │
                                        └────────────────────┘
```

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Git
- Cloudflare account with Workers AI access
- GitHub account

---

## Part 1: Deploy Backend to Render

### Step 1: Push Backend to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mindcare-backend.git
git push -u origin main
```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New** → **Web Service**
3. Connect your GitHub account and select the `mindcare-backend` repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| Name | `mindcare-backend` |
| Region | Singapore (or nearest) |
| Branch | `main` |
| Runtime | `Python 3.11` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | **Free** |

### Step 3: Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `CLOUDFLARE_API_TOKEN` | `cf_xxxxxxxxxxxx` | From Cloudflare dashboard |
| `CLOUDFLARE_ACCOUNT_ID` | `xxxxxxxxxxxx` | Your Cloudflare Account ID |

### Step 4: Get Cloudflare Credentials

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **My Profile** → **API Tokens**
3. Create a new token with **Template: Edit Cloudflare Workers** or use **Create Custom Token**
4. Copy the token and your Account ID (found in Workers AI overview)

### Step 5: Note Your Backend URL

After deployment, your backend will be available at:
```
https://mindcare-backend.onrender.com
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Push Frontend to GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mindcare-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **Add New** → **Project**
3. Import the `mindcare-frontend` repository
4. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | **Next.js** |
| Root Directory | `.` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

### Step 3: Set Environment Variables

In Vercel project settings, go to **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://mindcare-backend.onrender.com` |

### Step 4: Deploy

Click **Deploy**. Vercel will automatically build and deploy.

---

## Part 3: Keep Render Awake (Free Tier)

Render's free tier spins down after 15 minutes of inactivity. To prevent cold starts:

### Option 1: Use a Cron Job Service

Create a free account at [cron-job.org](https://cron-job.org) or [runhooks.app](https://runhooks.app):

1. Add a new cron job
2. URL: `https://mindcare-backend.onrender.com/health`
3. Schedule: Every 10 minutes (`*/10 * * * *`)

### Option 2: Add Health Endpoint

The backend already has a `/health` endpoint. The cron job will ping it regularly.

---

## Cost Summary

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Render Backend | Free | $0 |
| Vercel Frontend | Hobby | $0 |
| Cloudflare Workers AI | Pay-as-you-go | ~$0.10-1.00* |

*Estimated based on typical usage (1K-10K messages/month)

---

## Troubleshooting

### Backend Issues

**Error: Cloudflare AI client not configured**
- Check that `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set in Render

**Cold start taking too long**
- Free tier has 30-90 second cold starts
- Use a keep-alive cron job (see Part 3)

### Frontend Issues

**CORS errors**
- Backend CORS is configured to allow Vercel domains
- If using another host, update `allow_origins` in `backend/main.py`

**Build failures**
- Ensure Node.js 18+ is selected
- Check that all dependencies are in `package.json`

---

## Development

### Running Backend Locally

```bash
cd backend
cp .env.example .env  # Fill in your Cloudflare credentials
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Running Frontend Locally

```bash
cd frontend
cp .env.local.example .env.local  # Set API URL
npm install
npm run dev
```

---

## Model Information

- **Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **Provider**: Cloudflare Workers AI
- **Context Window**: 24,000 tokens
- **Pricing**: $0.29/1M input, $2.25/1M output tokens
- **Status**: Active (not deprecated)

---

## License

MIT License - See LICENSE file
