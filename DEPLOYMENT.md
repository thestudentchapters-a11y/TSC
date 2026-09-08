# 🚀 The Student Chapters (TSC) — Production Deployment Guide

This guide covers deploying the **Next.js Frontend on Vercel** and the **Node.js/Express Backend on Render** with **MongoDB Atlas** and **Cloudinary**.

---

## 1. Deploy Frontend on Vercel ⚡

### Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"** → Import your **`TSC`** GitHub repository.
2. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click "Edit" and select `apps/web`
   - **Build Command**: `next build` *(default)*
   - **Output Directory**: `.next` *(default)*
3. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_WHATSAPP_URL` | `https://whatsapp.com/channel/0029VajGqlK60eBkTXgEAK2m` |
   | `NEXT_PUBLIC_KONNECTX_URL` | `https://konnectx.app/` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` *(your live domain)* |
   | `NEXT_PUBLIC_API_URL` | `https://tsc-api.onrender.com` *(from Render step below)* |
4. Click **Deploy**.

---

## 2. Deploy Backend on Render 🛠️

### Option A: Using Render Blueprint (1-Click)
1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2. Click **"New Blueprint Instance"** and select your repository.
3. Render will automatically read `render.yaml` and configure the service. Fill in `MONGODB_URI` when prompted.

### Option B: Manual Web Service Setup
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Set the following:
   - **Name**: `tsc-api`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://...` |
   | `JWT_SECRET` | `your_strong_random_jwt_secret_here` |
   | `JWT_REFRESH_SECRET` | `your_strong_random_refresh_secret_here` |
   | `CLIENT_URL` | `https://your-app.vercel.app` |
   | `CORS_ORIGIN` | `https://your-app.vercel.app,http://localhost:3000` |
   | `CLOUDINARY_CLOUD_NAME` | `wwiampqg` |
   | `CLOUDINARY_API_KEY` | `849988263724582` |
   | `CLOUDINARY_API_SECRET` | `EMtdpvYIN-wsFDxScHYYemuifLQ` |
5. Click **Create Web Service**.

---

## 3. Initial Database Seeding (Optional)

To seed initial categories, demo stories, and platform configurations on your live MongoDB database:
1. Go to your Render Web Service dashboard.
2. Click the **"Shell"** tab.
3. Run:
   ```bash
   npm run seed
   ```
