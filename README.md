# Recipedium

A recipe sharing application where users can discover, share, and save their favorite recipes.

## Deployment Instructions

### Backend Deployment on Netlify

1. Install Netlify CLI globally:
   ```
   npm install netlify-cli -g
   ```

2. Login to Netlify:
   ```
   netlify login
   ```

3. Initialize Netlify site (if not already done):
   ```
   cd backend
   netlify init
   ```

4. Set up environment variables in Netlify:
   - Go to the Netlify dashboard
   - Navigate to your site
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variables:
     - MONGODB_URI: Your MongoDB connection string
     - JWT_SECRET: Secret key for JWT
     - NODE_ENV: production

5. Deploy to Netlify:
   ```
   cd backend
   netlify deploy --prod
   ```

6. Testing your Netlify deployment:
   - Access the API at https://your-netlify-site.netlify.app/api
   - Test specific endpoints like https://your-netlify-site.netlify.app/api/health

### Frontend Deployment

The frontend is deployed on Vercel. Update the API_URL in the frontend environment to point to your new Netlify backend:

1. Go to the Vercel dashboard
2. Navigate to your frontend project
3. Go to Settings > Environment Variables
4. Update API_URL to your Netlify backend URL
5. Redeploy the frontend

## Development Setup

1. Clone the repository
2. Install dependencies for both frontend and backend
   ```
   cd frontend && npm install
   cd backend && npm install
   ```
3. Set up environment variables (see .env.example files)
4. Start development servers
   ```
   # For frontend
   cd frontend && npm run dev
   
   # For backend
   cd backend && npm run dev
   # Or for Netlify local development:
   cd backend && netlify dev
   ```

## Tech Stack

- Frontend: Next.js, Tailwind CSS
- Backend: Express.js, MongoDB
- Deployment: Vercel (Frontend), Netlify (Backend)
