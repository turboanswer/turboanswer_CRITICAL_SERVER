# Turbo Answer — Google Cloud Run Deployment Guide

## Overview

This guide deploys Turbo Answer to **Google Cloud Run** using Docker.
Cloud Run is serverless, scales automatically, and you only pay for actual usage.

## Files Included

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage Docker build (builder + production) |
| `cloudbuild.yaml` | Automated CI/CD via Google Cloud Build |
| `.dockerignore` | Excludes unnecessary files from the image |

---

## Step 1 — Install & Set Up Google Cloud CLI

```bash
# Install the CLI (if not already installed)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and create/select your project
gcloud auth login
gcloud projects create turbo-answer-prod --name="Turbo Answer"
gcloud config set project turbo-answer-prod

# Enable required services
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## Step 2 — Build & Push the Docker Image

```bash
# Build the image
docker build -t gcr.io/turbo-answer-prod/turbo-answer .

# Authenticate Docker with Google Cloud
gcloud auth configure-docker

# Push to Google Container Registry
docker push gcr.io/turbo-answer-prod/turbo-answer
```

---

## Step 3 — Deploy to Cloud Run

Replace each `YOUR_*` value with your actual secrets:

```bash
gcloud run deploy turbo-answer \
  --image gcr.io/turbo-answer-prod/turbo-answer \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 5000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL=YOUR_DATABASE_URL \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY \
  --set-env-vars OPENAI_API_KEY=YOUR_OPENAI_API_KEY \
  --set-env-vars PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID \
  --set-env-vars PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET \
  --set-env-vars BREVO_API_KEY=YOUR_BREVO_API_KEY \
  --set-env-vars STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY \
  --set-env-vars SESSION_SECRET=YOUR_RANDOM_SECRET_STRING
```

> Tip: For secrets, use Google Secret Manager instead of `--set-env-vars` for better security.

---

## Step 4 — Automated Deployments via Cloud Build (Optional)

If you connect your GitHub repo to Cloud Build, every push automatically
builds and deploys using `cloudbuild.yaml`:

```bash
# Connect your repo at:
# https://console.cloud.google.com/cloud-build/triggers
```

---

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon or any Postgres) |
| `GEMINI_API_KEY` | Google Gemini AI key |
| `OPENAI_API_KEY` | OpenAI key (for image generation) |
| `PAYPAL_CLIENT_ID` | PayPal subscription payments |
| `PAYPAL_CLIENT_SECRET` | PayPal secret |
| `BREVO_API_KEY` | Email delivery (Brevo/Sendinblue) |
| `STRIPE_SECRET_KEY` | Stripe payments (if used) |
| `SESSION_SECRET` | Random string for session signing |

---

## Custom Domain

After deploying, map your domain:

```bash
gcloud run domain-mappings create \
  --service turbo-answer \
  --domain yourdomain.com \
  --region us-central1
```

Then add the DNS records shown in the output to your domain registrar.

---

## Cost Estimate

- **Free tier**: 2 million requests/month, 360,000 vCPU-seconds, 180,000 GB-seconds
- **Typical small app**: $0–5/month
- **Growing app**: $10–30/month depending on traffic
