# Architecture Overview

This document provides a comprehensive overview of Recipedium's architecture, including system design, component interactions, and key architectural decisions.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [Performance Considerations](#performance-considerations)
8. [Scalability Strategy](#scalability-strategy)

## System Overview

Recipedium follows a **microservices-inspired architecture** with clear separation between frontend and backend services, designed for scalability, maintainability, and deployment flexibility.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Web    │    │   Mobile App    │    │   Admin Panel   │
│   (Next.js)     │    │   (Future)      │    │   (Next.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Netlify)     │
                    └─────────┬───────┘
                              │
                    ┌─────────────────┐
                    │  Backend API    │
                    │  (Express.js)   │
                    └─────────┬───────┘
                              │
                    ┌─────────────────┐
                    │   Database      │
                    │   (MongoDB)     │
                    └─────────────────┘
```

### Technology Stack

#### Frontend Layer
- **Framework**: Next.js 15.2.1 (React 18)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context + Local State
- **HTTP Client**: Fetch API with custom wrapper
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

#### Backend Layer
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Testing**: Jest + Supertest
- **Deployment**: Netlify Functions (Serverless)

#### Infrastructure
- **Database Hosting**: MongoDB Atlas
- **File Storage**: External CDN (future)
- **Monitoring**: Application-level logging
- **CI/CD**: GitHub Actions (future)

## Architecture Patterns

### 1. Layered Architecture

The backend follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (Routes & Controllers)      │
├─────────────────────────────────────┤
│            Business Layer           │
│         (Service Logic)             │
├─────────────────────────────────────┤
│            Data Layer               │
│         (Models & Database)         │
└─────────────────────────────────────┘
```

#### Layer Responsibilities

**Presentation Layer**:
- HTTP request/response handling
- Input validation
- Authentication middleware
- Error handling

**Business Layer**:
- Core business logic
- Data transformation
- Business rule enforcement
- External service integration

**Data Layer**:
- Database operations
- Data modeling
- Query optimization
- Data validation

### 2. MVC Pattern (Frontend)

The frontend uses a component-based MVC pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      View       │    │   Controller    │    │      Model      │
│  (Components)   │◄──►│   (Hooks)       │◄──►│   (API Client)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3. Repository Pattern (Backend)

Data access is abstracted through model classes:

```javascript
// User Model (Repository)
class User {
  static async findByEmail(email) {
    return await UserSchema.findOne({ email });
  }
  
  static async create(userData) {
    return await UserSchema.create(userData);
  }
}
```

### 4. Middleware Pattern

Cross-cutting concerns are handled through middleware:

```javascript
app.use(cors());           // CORS handling
app.use(auth);             // Authentication
app.use(validateInput);    // Input validation
app.use(errorHandler);     // Error handling
```

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── ui/                 # Base UI components (Button, Input, etc.)
│   ├── layout/             # Layout components (Header, Footer, etc.)
│   ├── features/           # Feature-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── recipes/        # Recipe-related components
│   │   └── users/          # User-related components
│   └── shared/             # Shared utility components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and API client
├── context/                # React Context providers
└── pages/                  # Next.js pages
```

#### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── MainContent
│   │   ├── RecipeList
│   │   │   └── RecipeCard
│   │   ├── RecipeDetail
│   │   └── UserProfile
│   └── Footer
└── AuthProvider
    └── UserContext
```

### Backend Components

```
src/
├── controllers/            # Request handlers
├── models/                 # Database models
├── routes/                 # Route definitions
├── middleware/             # Custom middleware
├── services/               # Business logic services
├── utils/                  # Utility functions
└── config/                 # Configuration files
```

#### Service Layer Architecture

```javascript
// Example: Recipe Service
class RecipeService {
  static async getRecipes(filters, pagination) {
    // Business logic for fetching recipes
    const query = this.buildQuery(filters);
    const recipes = await Recipe.find(query)
      .populate('author')
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);
    
    return this.formatRecipes(recipes);
  }
  
  static buildQuery(filters) {
    // Query building logic
  }
  
  static formatRecipes(recipes) {
    // Data formatting logic
  }
}
```

## Data Flow

### User Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Frontend   │    │   Backend   │    │  Database   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Login Request │                  │                  │
       ├─────────────────►│                  │                  │
       │                  │ 2. API Call      │                  │
       │                  ├─────────────────►│                  │
       │                  │                  │ 3. User Lookup   │
       │                  │                  ├─────────────────►│
       │                  │                  │ 4. User Data     │
       │                  │                  │◄─────────────────┤
       │                  │ 5. JWT Token     │                  │
       │                  │◄─────────────────┤                  │
       │ 6. Token + User  │                  │                  │
       │◄─────────────────┤                  │                  │
```

### Recipe Creation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Frontend   │    │   Backend   │    │  Database   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Recipe Data   │                  │                  │
       ├─────────────────►│                  │                  │
       │                  │ 2. Validation    │                  │
       │                  │ 3. API Call      │                  │
       │                  ├─────────────────►│                  │
       │                  │                  │ 4. Auth Check    │
       │                  │                  │ 5. Validation    │
       │                  │                  │ 6. Save Recipe   │
       │                  │                  ├─────────────────►│
       │                  │                  │ 7. Recipe Data   │
       │                  │                  │◄─────────────────┤
       │                  │ 8. Success       │                  │
       │                  │◄─────────────────┤                  │
       │ 9. UI Update     │                  │                  │
       │◄─────────────────┤                  │                  │
```

### State Management Flow

```
┌─────────────────┐
│   User Action   │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  Event Handler  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   API Client    │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  State Update   │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  Component      │
│  Re-render      │
└─────────────────┘
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Client       │    │     Backend     │    │    Database     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ 1. Login Credentials │                      │
          ├─────────────────────►│                      │
          │                      │ 2. Verify Password  │
          │                      ├─────────────────────►│
          │                      │ 3. User Data        │
          │                      │◄─────────────────────┤
          │ 4. JWT Token         │                      │
          │◄─────────────────────┤                      │
          │                      │                      │
          │ 5. Protected Request │                      │
          │    (with JWT)        │                      │
          ├─────────────────────►│                      │
          │                      │ 6. Verify JWT       │
          │                      │ 7. Extract User ID  │
          │                      │ 8. Authorized        │
          │                      │    Response          │
          │◄─────────────────────┤                      │
```

### Security Layers

1. **Transport Security**: HTTPS/TLS encryption
2. **Authentication**: JWT-based stateless authentication
3. **Authorization**: Role-based access control (RBAC)
4. **Input Validation**: Server-side validation with express-validator
5. **Data Security**: Password hashing with bcrypt
6. **CORS**: Configured for specific origins

### Security Middleware Stack

```javascript
app.use(helmet());           // Security headers
app.use(cors(corsOptions));  // CORS configuration
app.use(rateLimit);          // Rate limiting
app.use(auth);               // JWT verification
app.use(authorize);          // Role-based authorization
app.use(validateInput);      // Input sanitization
```

## Deployment Architecture

### Current Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
            ┌─────────┴─────────┐
            │   Load Balancer   │
            │     (CDN)         │
            └─────────┬─────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼────────┐
│   Frontend     │         │    Backend      │
│   (Vercel)     │         │   (Netlify)     │
│                │         │                 │
│ - Static Site  │         │ - Serverless    │
│ - CDN          │         │ - Functions     │
│ - Edge Compute │         │ - Auto-scaling  │
└────────────────┘         └─────────┬───────┘
                                     │
                           ┌─────────▼───────┐
                           │   Database      │
                           │ (MongoDB Atlas) │
                           │                 │
                           │ - Managed       │
                           │ - Replicated    │
                           │ - Backed up     │
                           └─────────────────┘
```

### Scalability Considerations

#### Horizontal Scaling
- **Frontend**: Edge distribution via Vercel CDN
- **Backend**: Serverless auto-scaling with Netlify Functions
- **Database**: MongoDB Atlas clustering

#### Vertical Scaling
- **Database**: Upgrade MongoDB Atlas tier
- **Functions**: Increase memory/timeout limits

#### Caching Strategy
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │     CDN     │    │  Backend    │
│   Cache     │    │   Cache     │    │   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
      │                    │                  │
      │ Static Assets      │ API Responses    │ Database
      │ (24h)              │ (5min)           │ Queries
```

## Performance Considerations

### Frontend Optimizations

1. **Code Splitting**: Lazy loading with React.lazy()
2. **Image Optimization**: Next.js Image component
3. **Bundle Optimization**: Tree shaking and minification
4. **Caching**: Service workers for offline functionality

```javascript
// Code splitting example
const AdminPanel = lazy(() => import('./AdminPanel'));

// Image optimization
<Image
  src="/recipe.jpg"
  alt="Recipe"
  width={300}
  height={200}
  loading="lazy"
/>
```

### Backend Optimizations

1. **Database Indexing**: Strategic indexes for queries
2. **Query Optimization**: Projection and pagination
3. **Caching**: In-memory caching for frequently accessed data
4. **Connection Pooling**: MongoDB connection optimization

```javascript
// Database indexes
db.recipes.createIndex({ "title": "text", "description": "text" });
db.recipes.createIndex({ "author": 1, "createdAt": -1 });

// Query optimization
const recipes = await Recipe
  .find(filter)
  .select('title author createdAt')
  .populate('author', 'username')
  .lean();
```

### Performance Monitoring

```javascript
// Response time middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## Scalability Strategy

### Phase 1: Current Architecture (MVP)
- Monolithic frontend and backend
- Single database instance
- Basic caching

### Phase 2: Enhanced Performance
- Implement Redis caching
- Database read replicas
- Image CDN integration
- Advanced monitoring

### Phase 3: Microservices
- Split into domain services:
  - Authentication Service
  - Recipe Service
  - User Service
  - Notification Service

### Phase 4: Advanced Architecture
- Event-driven architecture
- CQRS pattern for read/write optimization
- Advanced analytics and ML features

### Migration Strategy

```
Current Architecture
┌─────────────────┐
│   Monolithic    │
│   Application   │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│  Modular        │
│  Monolith       │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│  Microservices  │
│  Architecture   │
└─────────────────┘
```

## Architectural Decisions

### 1. Why Next.js for Frontend?
- **SSR/SSG**: Better SEO and performance
- **Developer Experience**: Great tooling and conventions
- **Ecosystem**: Large community and plugin ecosystem
- **Vercel Integration**: Seamless deployment

### 2. Why Express.js for Backend?
- **Simplicity**: Minimal and flexible
- **Ecosystem**: Extensive middleware ecosystem
- **Performance**: Fast and lightweight
- **Familiarity**: Well-known by developers

### 3. Why MongoDB?
- **Flexibility**: Schema-less design for evolving data
- **Scalability**: Horizontal scaling capabilities
- **Performance**: Fast reads and writes
- **Atlas**: Managed service reduces operational overhead

### 4. Why Serverless?
- **Cost**: Pay-per-use pricing model
- **Scalability**: Automatic scaling
- **Maintenance**: Reduced operational overhead
- **Global**: Edge distribution

### 5. Why JWT for Authentication?
- **Stateless**: No server-side session storage
- **Scalable**: Works across multiple servers
- **Secure**: Cryptographically signed
- **Standard**: Industry-standard approach

## Future Considerations

### Potential Improvements

1. **Real-time Features**: WebSocket integration for live updates
2. **Advanced Search**: Elasticsearch for better search capabilities
3. **Media Handling**: Dedicated image processing service
4. **Analytics**: User behavior tracking and insights
5. **Mobile App**: React Native mobile application
6. **API Gateway**: Centralized API management
7. **Event Sourcing**: For audit trails and data recovery

### Technology Upgrades

- **Frontend**: Consider migrating to App Router (Next.js 13+)
- **Backend**: Evaluate GraphQL for flexible data fetching
- **Database**: Consider PostgreSQL for complex relational queries
- **Deployment**: Evaluate Kubernetes for container orchestration

This architecture provides a solid foundation for Recipedium while maintaining flexibility for future growth and enhancement. 