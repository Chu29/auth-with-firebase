# Tasky

A modern task management application built with Next.js, Firebase Authentication, and MongoDB, featuring real-time task tracking, activity timelines, and user profile management.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg)
![React](https://img.shields.io/badge/React-19.2-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.10-orange.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.1-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Error Handling](#-error-handling)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## ✨ Features

### Core Functionality

- **User Authentication** - Firebase-based authentication with email/password login
- **Task Management** - Create, read, update, and delete tasks with status tracking
- **Activity Timeline** - Real-time activity tracking and history visualization
- **User Profiles** - Comprehensive profile management with user information
- **Dashboard** - Overview of tasks and activities in a centralized view
- **Theme Toggle** - Dark/light mode support for better user experience
- **Session Management** - Secure session handling with sign-out capabilities

### Technical Features

- **Modern Stack** - Built with Next.js 16 and React 19 for optimal performance
- **TypeScript** - Full type safety throughout the application
- **Firebase Integration** - Client-side and server-side Firebase authentication
- **MongoDB Database** - Robust data persistence with Mongoose ODM
- **API Routes** - RESTful API endpoints for task and user management
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Real-time Updates** - Efficient state management for live data updates
- **Environment Configuration** - Secure environment variable management

## 🛠 Tech Stack

### Frontend

- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19.2.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Authentication:** Firebase Client SDK 12.10.0

### Backend

- **Runtime:** Node.js (via Next.js)
- **Database:** MongoDB 7.1.0
- **ODM:** Mongoose 9.3.0
- **Authentication:** Firebase Admin SDK 13.7.0
- **API:** Next.js API Routes

### Development Tools

- **Package Manager:** pnpm 11.5.1
- **Linting:** ESLint 9 with Next.js config
- **PostCSS:** Tailwind CSS PostCSS plugin

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm** v8.0.0 or higher ([Installation](https://pnpm.io/installation))
- **MongoDB** Atlas account or local MongoDB instance ([Setup](https://www.mongodb.com/try))
- **Firebase** project with Authentication enabled ([Setup](https://console.firebase.google.com/))

You can verify your installations:

```bash
node --version    # Should show v18.0.0 or higher
pnpm --version    # Should show v8.0.0 or higher
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tasky
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:

- Next.js and React
- Firebase Client and Admin SDKs
- MongoDB and Mongoose
- Tailwind CSS and PostCSS
- TypeScript and ESLint
- And more...

## ⚙️ Configuration

### Create Environment File

Create a `.env` file in the root directory based on `.env.example`:

```env
# MongoDB (used by the app server)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

# Firebase (client-side / exposed to browser - must start with NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (server-side - keep secret)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Optional / standard
NODE_ENV=development
```

### Environment Variables Explained

| Variable                                   | Description                          | Required | Notes                        |
| ------------------------------------------ | ------------------------------------ | -------- | ---------------------------- |
| `MONGODB_URI`                              | MongoDB connection string            | Yes      | Get from MongoDB Atlas       |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API key (public)            | Yes      | From Firebase Console        |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                 | Yes      | Your project.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID                  | Yes      | From Firebase Console        |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket              | Yes      | From Firebase Console        |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID         | Yes      | From Firebase Console        |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID                      | Yes      | From Firebase Console        |
| `FIREBASE_PROJECT_ID`                      | Firebase project ID (server)         | Yes      | Same as public               |
| `FIREBASE_CLIENT_EMAIL`                    | Firebase admin service account email | Yes      | From service account JSON    |
| `FIREBASE_PRIVATE_KEY`                     | Firebase admin private key           | Yes      | Escape newlines with \n      |
| `NODE_ENV`                                 | Environment mode                     | No       | development/production       |

**⚠️ Security Note:** Never commit the `.env` file to version control. Keep Firebase Admin credentials (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) secret and never expose them to the client.

## 🗄️ Database Setup

### 1. Set Up MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from the "Connect" button

### 2. Configure Database Connection

Add your MongoDB connection string to the `.env` file:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tasky?retryWrites=true&w=majority
```

### 3. Database Collections

The application automatically creates the following collections:

- **users** - User profiles and authentication data
- **tasks** - Task records with status and metadata
- **activities** - Activity timeline entries

**Note:** The database schema is managed by Mongoose models. No manual SQL scripts are required.

## 🏃 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Mode

Build and start the production server:

```bash
pnpm build
pnpm start
```

### Verify Server is Running

You should see output similar to:

```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

Visit `http://localhost:3000` to access the application.

## 📚 API Documentation

### Quick API Reference

| Method | Endpoint                 | Description                    | Auth Required |
| ------ | ------------------------ | ------------------------------ | ------------- |
| GET    | `/api/tasks`             | Get all tasks for current user | Yes           |
| POST   | `/api/tasks`             | Create a new task              | Yes           |
| PUT    | `/api/tasks`             | Update an existing task        | Yes           |
| DELETE | `/api/tasks`             | Delete a task                  | Yes           |
| GET    | `/api/users`             | Get current user profile       | Yes           |
| PUT    | `/api/users`             | Update user profile            | Yes           |
| POST   | `/api/auth/session`      | Get current session            | Yes           |
| POST   | `/api/auth/sign-out-all` | Sign out from all devices      | Yes           |

## 📁 Project Structure

```
tasky/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── activities/           # Activity endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── tasks/                # Task management endpoints
│   │   └── users/                # User management endpoints
│   ├── dashboard/                # Dashboard page
│   ├── login/                    # Login page
│   ├── profile/                  # User profile page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── global.css                # Global styles
├── components/                   # React components
│   ├── ThemeToggle.tsx           # Dark/light mode toggle
│   ├── activityTimeline.tsx      # Activity timeline component
│   ├── signOutButton.tsx         # Sign out button
│   ├── skeletons.tsx             # Loading skeletons
│   ├── tasks/                    # Task-related components
│   └── tasksPanel.tsx            # Tasks panel component
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── firebase/                 # Firebase configuration
│   ├── mongodb/                  # MongoDB connection
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── .env                          # Environment variables (not in repo)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint configuration
├── middleware.ts                 # Next.js middleware
├── next.config.ts                # Next.js configuration
├── package.json                  # Project dependencies
├── pnpm-lock.yaml                # pnpm lock file
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

### Architecture Pattern

The project follows a **modern Next.js architecture** with:

- **App Router** - File-based routing with React Server Components
- **API Routes** - Serverless API endpoints for backend logic
- **Firebase Auth** - Client and server-side authentication
- **Mongoose Models** - Structured data models with validation
- **Component Composition** - Reusable UI components
- **Custom Hooks** - Encapsulated business logic

## 📜 Available Scripts

| Script    | Command      | Description                              |
| --------- | ------------ | ---------------------------------------- |
| **Dev**   | `pnpm dev`   | Start development server with hot-reload |
| **Build** | `pnpm build` | Build production bundle                  |
| **Start** | `pnpm start` | Start production server                  |
| **Lint**  | `pnpm lint`  | Run ESLint to check code quality         |

### Script Details

#### Development Server

```bash
pnpm dev
```

- Starts Next.js development server
- Enables hot module replacement
- Runs on port 3000 by default
- Provides detailed error messages

#### Production Build

```bash
pnpm build
```

- Creates optimized production build
- Minifies JavaScript and CSS
- Generates static pages where possible
- Outputs to `.next` directory

#### Production Server

```bash
pnpm start
```

- Serves the production build
- Uses Node.js server
- Optimized for performance

#### Linting

```bash
pnpm lint
```

- Runs ESLint on all files
- Checks for code quality issues
- Enforces consistent code style

## 🧪 Testing

Currently, the project does not include automated tests. To add testing:

1. Install testing dependencies:

```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom
```

2. Create test files alongside components
3. Run tests with:

```bash
pnpm test
```

## 🎯 API Endpoints Overview

### Tasks (`/api/tasks`)

| Endpoint     | Method | Description                          | Auth |
| ------------ | ------ | ------------------------------------ | ---- |
| `/api/tasks` | GET    | Get all tasks for authenticated user | Yes  |
| `/api/tasks` | POST   | Create a new task                    | Yes  |
| `/api/tasks` | PUT    | Update an existing task              | Yes  |
| `/api/tasks` | DELETE | Delete a task                        | Yes  |

### Users (`/api/users`)

| Endpoint     | Method | Description              | Auth |
| ------------ | ------ | ------------------------ | ---- |
| `/api/users` | GET    | Get current user profile | Yes  |
| `/api/users` | PUT    | Update user profile      | Yes  |

### Authentication (`/api/auth`)

| Endpoint                 | Method | Description                  | Auth |
| ------------------------ | ------ | ---------------------------- | ---- |
| `/api/auth/session`      | POST   | Get current Firebase session | Yes  |
| `/api/auth/sign-out-all` | POST   | Sign out from all devices    | Yes  |

### Activities (`/api/activities`)

| Endpoint          | Method | Description           | Auth |
| ----------------- | ------ | --------------------- | ---- |
| `/api/activities` | GET    | Get activity timeline | Yes  |

## 🚨 Error Handling

### Error Response Format

API errors follow a consistent JSON format:

```json
{
  "error": "Error description",
  "status": 400
}
```

### HTTP Status Codes

| Code | Description           | Common Causes                     |
| ---- | --------------------- | --------------------------------- |
| 200  | OK                    | Successful request                |
| 201  | Created               | Resource created successfully     |
| 400  | Bad Request           | Invalid input data                |
| 401  | Unauthorized          | Missing or invalid authentication |
| 403  | Forbidden             | Insufficient permissions          |
| 404  | Not Found             | Resource doesn't exist            |
| 500  | Internal Server Error | Server-side error                 |

## 🔒 Security

- **Firebase Authentication** - Secure authentication with JWT tokens
- **Environment Variables** - Sensitive data stored in environment variables
- **MongoDB Security** - Connection string with authentication
- **Input Validation** - Mongoose schema validation
- **CORS Protection** - Next.js built-in CORS handling
- **Middleware** - Route protection via middleware

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Developed by:** MUEGHE ABUEMKEZE CHU

Connect with me:

- 🐙 GitHub: [@chu29](https://github.com/chu29)
- 🐦 Twitter: [@unku_chu](https://twitter.com/unku_chu)
- 💼 LinkedIn: [MUEGHE ABUEMKEZE CHU](https://linkedin.com/in/chu-abuemkeze)
- 📧 Email: chu.amk22@gmail.com
