
# Barter

A comprehensive multivendor ecommerce platform built with modern microservices architecture, featuring an intelligent recommendation engine and real-time capabilities.

## Overview

Barter is a full-stack multivendor ecommerce solution that enables multiple sellers to manage their products while providing users with personalized shopping experiences through machine learning-powered recommendations. Built with a microservices architecture using NX monorepo for optimal scalability and maintainability.

## Key Features

### **Ecommerce Core**
- **Multivendor Support**: Complete seller onboarding and management system
- **Product Management**: Full CRUD operations with image handling via ImageKit
- **Order Processing**: End-to-end order management with status tracking
- **Payment Integration**: Stripe integration for secure payments
- **Discount System**: Coupon codes and promotional offers

### **AI-Powered Recommendations**
- **Machine Learning Engine**: TensorFlow.js-based recommendation system
- **User Behavior Tracking**: Advanced analytics for personalized suggestions
- **Real-time Updates**: Dynamic product recommendations based on user interactions

### **Multi-Interface Design**
- **User Interface**: Customer-facing shopping experience
- **Seller Dashboard**: Comprehensive seller management portal
- **Admin Panel**: Platform administration and oversight tools

### **Real-time Features**
- **Live Chat System**: WebSocket-based communication between users and sellers
- **Real-time Notifications**: Instant updates for orders, messages, and system events
- **Live Analytics**: Real-time dashboard updates

### **Enterprise Architecture**
- **Microservices**: Scalable service-oriented architecture
- **NX Monorepo**: Efficient development and deployment workflow
- **Event-Driven**: Kafka integration for reliable message processing
- **Caching**: Redis implementation for optimal performance

## Technology Stack

### **Frontend**
- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS with Framer Motion animations
- **State Management**: Zustand & Jotai for different state needs
- **Data Fetching**: TanStack Query for server state management
- **UI Components**: Custom components with Lucide React icons

### **Backend Services**
- **Runtime**: Node.js with Express.js
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: ImageKit integration for media management
- **Email Service**: Nodemailer for transactional emails

### **Infrastructure**
- **Message Queue**: Apache Kafka for event streaming
- **Caching**: Redis for session management and caching
- **Monitoring**: Morgan logging with custom logger service
- **Documentation**: Swagger for API documentation

### **Machine Learning**
- **Framework**: TensorFlow.js for recommendation algorithms
- **Data Processing**: Custom analytics pipeline for user behavior

## Project Structure

```
barter/
├── apps/
│   ├── auth-service/          # Authentication microservice
│   ├── product-service/       # Product management service
│   ├── order-service/         # Order processing service
│   ├── recommendation-service/ # ML recommendation engine
│   ├── chatting-service/      # Real-time chat service
│   ├── logger-service/        # Centralized logging
│   ├── user-ui/              # Customer interface
│   ├── seller-ui/            # Seller dashboard
│   └── admin-ui/             # Admin panel
├── libs/
│   ├── shared/               # Shared utilities and types
│   ├── components/           # Reusable UI components
│   └── middlewares/          # Common middleware functions
└── prisma/                   # Database schema and migrations
```

## Getting Started

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd barter
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env` files in respective service directories with:
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ImageKit
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="your-imagekit-url"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

4. **Database Setup**
```bash
npx prisma generate
npx prisma db push
```

5. **Start Development Server**
```bash
# Start all services
npm run dev

# Or start specific services
npm run user-ui     # Customer interface
npm run seller-ui   # Seller dashboard  
npm run admin-ui    # Admin panel
```

## API Documentation

### Generate API Documentation
```bash
# Authentication service docs
npm run auth-docs

# Product service docs  
npm run product-docs
```

Access documentation at:
- Auth Service: `http://localhost:3001/api-docs`
- Product Service: `http://localhost:3002/api-docs`

## Service Architecture

### **Authentication Service** (`auth-service`)
- User registration and login
- JWT token management
- OTP verification
- Password reset functionality
- Role-based access control

### **Product Service** (`product-service`)
- Product CRUD operations
- Category management
- Image upload handling
- Inventory management
- Search and filtering

### **Order Service** (`order-service`)
- Order creation and processing
- Payment integration with Stripe
- Order status tracking
- Invoice generation

### **Recommendation Service** (`recommendation-service`)
- Machine learning model training
- User behavior analysis
- Personalized product suggestions
- A/B testing for recommendations

### **Chatting Service** (`chatting-service`)
- WebSocket connections
- Real-time messaging
- Message persistence
- Online status tracking

## Frontend Applications

### **User Interface** (`user-ui`)
- Product browsing and search
- Shopping cart functionality
- Checkout process
- Order tracking
- User profile management

### **Seller Dashboard** (`seller-ui`)
- Product management
- Order fulfillment
- Sales analytics
- Customer communication
- Stripe onboarding

### **Admin Panel** (`admin-ui`)
- Platform oversight
- User and seller management
- System analytics
- Content moderation
- Configuration management

## Development Scripts

```bash
# Development
npm run dev                 # Start all services
npm run user-ui            # Start user interface only
npm run seller-ui          # Start seller dashboard only
npm run admin-ui           # Start admin panel only

# Documentation
npm run auth-docs          # Generate auth service docs
npm run product-docs       # Generate product service docs

# Utilities
npm run postinstall        # Apply patches after install
```

- Built with [NX](https://nx.dev) for monorepo management
- Machine learning powered by [TensorFlow.js](https://www.tensorflow.org/js)
- Real-time features using WebSocket technology
- Payment processing by [Stripe](https://stripe.com)
