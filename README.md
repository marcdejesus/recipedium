# Recipedium

A modern, full-stack recipe sharing platform where users can discover, create, share, and save their favorite recipes. Built with Next.js and Express.js, featuring a clean UI, robust authentication, and comprehensive recipe management capabilities.

## 🌟 Features

- **User Authentication**: Secure registration, login, and password reset functionality
- **Recipe Management**: Create, edit, delete, and categorize recipes
- **Social Features**: Like recipes, save favorites, and follow other users
- **Advanced Search**: Filter recipes by ingredients, cuisine, difficulty, and more
- **User Profiles**: Customizable profiles with recipe collections
- **Admin Dashboard**: Content moderation and user management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Dynamic content updates and notifications

## 🏗️ Architecture

This is a monorepo containing:

```
recipedium/
├── frontend/          # Next.js application
├── backend/           # Express.js API server
├── compose.yaml       # Production Docker setup
├── compose.dev.yaml   # Development Docker setup
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.1
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives, Material-UI icons
- **Charts**: Recharts for data visualization
- **Testing**: Jest with React Testing Library

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Validation**: Express Validator
- **Testing**: Jest with Supertest
- **Deployment**: Netlify Functions (serverless)

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Development**: Docker Compose with hot reload
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Netlify Functions
- **Database**: MongoDB Atlas (production) / Local MongoDB (development)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Docker and Docker Compose (for containerized development)
- MongoDB (for local development without Docker)

### Option 1: Docker Development (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipedium
   ```

2. **Set up environment variables**
   ```bash
   # Copy example files and configure
   cp .env.example .env
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

3. **Start the development environment**
   ```bash
   # Start all services (frontend, backend, database)
   docker compose -f compose.dev.yaml up --build

   # For development with file watching
   docker compose -f compose.dev.yaml up --build --watch
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api
   - MongoDB: localhost:27017

### Option 2: Local Development

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd recipedium
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   cd ..

   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Configure environment variables** (see Environment Variables section)

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or install MongoDB locally
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## ⚙️ Environment Variables

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/recipedium

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=30d

# Server
NODE_ENV=development
PORT=5000
```

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Environment
NODE_ENV=development
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Backend Tests
```bash
cd backend
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

## 📦 Production Deployment

### Backend (Netlify)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and deploy**
   ```bash
   cd backend
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Configure environment variables in Netlify Dashboard**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Strong secret key for JWT signing
   - `NODE_ENV`: production

### Frontend (Vercel)

1. **Connect repository to Vercel**
2. **Configure build settings**
   - Build command: `cd frontend && npm run build`
   - Output directory: `frontend/.next`
3. **Set environment variables**
   - `NEXT_PUBLIC_API_URL`: Your Netlify backend URL

## 🔧 Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run build` - Build Netlify functions
- `npm run start:netlify` - Start Netlify dev server

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── components/        # Reusable UI components
├── pages/            # Next.js pages and routing
├── lib/              # Utility functions and API client
├── styles/           # Global styles and Tailwind config
├── public/           # Static assets
└── tests/            # Test files
```

### Backend Structure
```
backend/
├── src/
│   ├── controllers/  # Route handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routes
│   ├── middleware/   # Custom middleware
│   └── config/       # Configuration files
├── tests/            # Test files
├── netlify/          # Netlify function wrappers
└── scripts/          # Utility scripts
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 📝 API Documentation

The API provides the following main endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/recipes` - Get recipes with filtering
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get specific recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000 or 5000
   npx kill-port 3000 5000
   ```

2. **MongoDB connection issues**
   ```bash
   # Check if MongoDB is running
   docker ps
   # Or restart MongoDB container
   docker restart mongodb
   ```

3. **Module not found errors**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Express.js](https://expressjs.com/) for the robust backend framework
- [MongoDB](https://www.mongodb.com/) for the flexible database solution
