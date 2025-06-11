# Deployment Guide

This guide provides comprehensive instructions for deploying Recipedium to various environments, from local development to production.

## Table of Contents

1. [Overview](#overview)
2. [Local Development](#local-development)
3. [Staging Environment](#staging-environment)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Overview

Recipedium follows a modern deployment architecture:

- **Frontend**: Next.js deployed on Vercel
- **Backend**: Node.js/Express deployed as Netlify Functions
- **Database**: MongoDB Atlas (production) / Local MongoDB (development)
- **File Storage**: External service for recipe images (recommended)

## Local Development

### Prerequisites

- Node.js 18.x+
- npm 9.x+
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd recipedium
   ```

2. **Environment Setup**
   ```bash
   # Backend environment
   cp backend/env.example backend/.env
   
   # Frontend environment
   cp frontend/env.example frontend/.env.local
   ```

3. **Docker Development (Recommended)**
   ```bash
   # Start all services with hot reload
   docker compose -f compose.dev.yaml up --build --watch
   
   # Access the application
   # Frontend: http://localhost:3000
   # Backend: http://localhost:5001
   # MongoDB: localhost:27017
   ```

4. **Manual Setup (Alternative)**
   ```bash
   # Install dependencies
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   
   # Start MongoDB
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Start services (in separate terminals)
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

### Development Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/recipedium
JWT_SECRET=dev-secret-key-min-32-chars-long
JWT_EXPIRE=30d
PORT=5000
```

#### Frontend (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG_MODE=true
```

## Staging Environment

### Purpose
Staging environment mirrors production for testing before deployment.

### Setup on Heroku (Example)

1. **Create Heroku Apps**
   ```bash
   # Backend
   heroku create recipedium-api-staging
   
   # Frontend
   heroku create recipedium-staging
   ```

2. **Configure Environment Variables**
   ```bash
   # Backend
   heroku config:set NODE_ENV=staging -a recipedium-api-staging
   heroku config:set MONGODB_URI=<staging-mongodb-uri> -a recipedium-api-staging
   heroku config:set JWT_SECRET=<staging-jwt-secret> -a recipedium-api-staging
   
   # Frontend
   heroku config:set NODE_ENV=staging -a recipedium-staging
   heroku config:set NEXT_PUBLIC_API_URL=https://recipedium-api-staging.herokuapp.com/api -a recipedium-staging
   ```

3. **Deploy**
   ```bash
   # Backend
   git subtree push --prefix=backend heroku-backend-staging main
   
   # Frontend
   git subtree push --prefix=frontend heroku-frontend-staging main
   ```

## Production Deployment

### Backend Deployment (Netlify)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify Site**
   ```bash
   cd backend
   netlify init
   ```

4. **Configure netlify.toml** (already configured)
   ```toml
   [build]
     functions = "netlify/functions"
     command = "npm run build"
   
   [functions]
     node_bundler = "esbuild"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200
   ```

5. **Set Environment Variables**
   ```bash
   # Via Netlify CLI
   netlify env:set MONGODB_URI "mongodb+srv://user:pass@cluster.mongodb.net/recipedium"
   netlify env:set JWT_SECRET "production-secret-key"
   netlify env:set NODE_ENV "production"
   
   # Or via Netlify Dashboard
   # Go to Site settings > Environment variables
   ```

6. **Deploy**
   ```bash
   cd backend
   netlify deploy --prod
   ```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Environment Variables**
   ```bash
   # Via Vercel CLI
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://your-netlify-backend.netlify.app/api
   
   vercel env add NODE_ENV production
   # Enter: production
   ```

### Alternative: GitHub Actions Deployment

#### Backend Deployment Action
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Build
        run: |
          cd backend
          npm run build
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './backend'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

#### Frontend Deployment Action
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Build
        run: |
          cd frontend
          npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## Docker Deployment

### Production Docker Setup

1. **Build Images**
   ```bash
   # Build production images
   docker compose -f compose.yaml build
   ```

2. **Environment Configuration**
   ```bash
   # Create production .env file
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Deploy with Docker Compose**
   ```bash
   # Start production services
   docker compose -f compose.yaml up -d
   
   # Check status
   docker compose ps
   
   # View logs
   docker compose logs -f
   ```

### Docker Swarm Deployment

1. **Initialize Swarm**
   ```bash
   docker swarm init
   ```

2. **Create Stack File**
   ```yaml
   # docker-stack.yml
   version: '3.8'
   
   services:
     frontend:
       image: recipedium-frontend:latest
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - NEXT_PUBLIC_API_URL=http://backend:5000/api
       deploy:
         replicas: 2
         
     backend:
       image: recipedium-backend:latest
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/recipedium
         - JWT_SECRET_FILE=/run/secrets/jwt_secret
       secrets:
         - jwt_secret
       deploy:
         replicas: 2
         
     mongo:
       image: mongo:latest
       volumes:
         - mongo_data:/data/db
       deploy:
         replicas: 1
         
   volumes:
     mongo_data:
     
   secrets:
     jwt_secret:
       external: true
   ```

3. **Deploy Stack**
   ```bash
   # Create secret
   echo "your-production-jwt-secret" | docker secret create jwt_secret -
   
   # Deploy stack
   docker stack deploy -c docker-stack.yml recipedium
   ```

## Environment Variables

### Production Environment Variables

#### Backend (Netlify)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment type | `production` |
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRE` | ❌ | JWT expiration time | `30d` |

#### Frontend (Vercel)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL | `https://api.recipedium.com/api` |
| `NODE_ENV` | ✅ | Environment type | `production` |
| `NEXT_PUBLIC_APP_URL` | ❌ | Frontend URL | `https://recipedium.com` |

### Security Considerations

1. **JWT Secret Generation**
   ```bash
   # Generate secure secret
   openssl rand -base64 32
   ```

2. **Environment Variable Management**
   ```bash
   # Use Netlify CLI for backend
   netlify env:set JWT_SECRET "$(openssl rand -base64 32)"
   
   # Use Vercel CLI for frontend
   vercel env add NEXT_PUBLIC_API_URL production
   ```

## Database Setup

### MongoDB Atlas (Production)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster
   - Choose appropriate tier (M0 for development, M2+ for production)

2. **Database Configuration**
   ```javascript
   // Database: recipedium
   // Collections: users, recipes
   ```

3. **Create Database User**
   ```bash
   # Username: recipedium-api
   # Password: <generate-secure-password>
   # Roles: readWrite on recipedium database
   ```

4. **Network Access**
   ```bash
   # Add IP addresses or use 0.0.0.0/0 for Netlify/Vercel
   # (Not recommended for high-security applications)
   ```

5. **Connection String**
   ```
   mongodb+srv://recipedium-api:<password>@cluster0.xxxxx.mongodb.net/recipedium?retryWrites=true&w=majority
   ```

### Local MongoDB (Development)

1. **Docker Setup**
   ```bash
   docker run -d \
     --name mongodb \
     -p 27017:27017 \
     -v mongodb_data:/data/db \
     mongo:latest
   ```

2. **Create Development Data**
   ```bash
   cd backend
   npm run seed  # If seed script exists
   ```

## Monitoring & Maintenance

### Health Checks

1. **Backend Health Check**
   ```bash
   curl https://your-backend.netlify.app/api/health
   ```

2. **Frontend Health Check**
   ```bash
   curl https://your-frontend.vercel.app
   ```

### Logging

1. **Netlify Functions Logs**
   ```bash
   netlify logs --live
   ```

2. **Vercel Logs**
   ```bash
   vercel logs
   ```

### Monitoring Setup

1. **Uptime Monitoring**
   - Use services like Pingdom, UptimeRobot, or StatusCake
   - Monitor both frontend and backend endpoints

2. **Error Tracking**
   ```javascript
   // Sentry setup (optional)
   import * as Sentry from "@sentry/nextjs";
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### Database Backups

1. **MongoDB Atlas Backups**
   - Automated backups are enabled by default
   - Configure backup frequency and retention

2. **Manual Backup**
   ```bash
   mongodump --uri="mongodb+srv://..." --out=./backup-$(date +%Y%m%d)
   ```

### Performance Monitoring

1. **Frontend Performance**
   ```javascript
   // Next.js analytics
   export { reportWebVitals } from 'next/web-vitals';
   ```

2. **Backend Performance**
   ```javascript
   // Response time monitoring
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       console.log(`${req.method} ${req.path} - ${duration}ms`);
     });
     next();
   });
   ```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build logs
   netlify logs
   vercel logs
   
   # Test build locally
   cd frontend && npm run build
   cd backend && npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify environment variables
   netlify env:list
   vercel env ls
   ```

3. **CORS Issues**
   ```javascript
   // Update CORS configuration
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-frontend.vercel.app'
     ]
   }));
   ```

4. **Database Connection Issues**
   ```javascript
   // Add connection debugging
   mongoose.connection.on('connected', () => {
     console.log('MongoDB connected successfully');
   });
   
   mongoose.connection.on('error', (err) => {
     console.error('MongoDB connection error:', err);
   });
   ```

### Performance Issues

1. **Slow API Responses**
   ```javascript
   // Add database indexes
   db.recipes.createIndex({ "title": "text", "description": "text" });
   db.recipes.createIndex({ "author": 1, "createdAt": -1 });
   ```

2. **Frontend Bundle Size**
   ```bash
   # Analyze bundle
   npm run build
   npx @next/bundle-analyzer
   ```

### Rollback Procedures

1. **Netlify Rollback**
   ```bash
   netlify rollback
   ```

2. **Vercel Rollback**
   ```bash
   vercel rollback
   ```

3. **Database Rollback**
   ```bash
   # Restore from backup
   mongorestore --uri="mongodb+srv://..." ./backup-20240120
   ```

### Emergency Procedures

1. **Service Outage**
   - Check status pages (Netlify, Vercel, MongoDB Atlas)
   - Review error logs
   - Implement temporary fixes or rollback

2. **Security Incident**
   - Rotate JWT secrets immediately
   - Review access logs
   - Update dependencies
   - Notify users if necessary

### Useful Commands

```bash
# Check deployment status
netlify status
vercel ls

# View real-time logs
netlify logs --live
vercel logs --follow

# Test API endpoints
curl -X GET https://your-api.netlify.app/api/health
curl -X POST https://your-api.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Database operations
mongosh "mongodb+srv://cluster.xxxxx.mongodb.net/recipedium"
``` 