# AI-Powered Expense Tracker

A production-ready full-stack expense tracking application with AI-powered invoice extraction using Google Gemini 2.5 Flash.

## Tech Stack

- **Frontend**: React 18, React Router v6, Recharts, Axios, React Dropzone
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **AI**: Google Gemini 2.5 Flash via `@google/genai` SDK
- **Port**: Backend runs on `8080`, Frontend on `3000`

---

## Project Structure

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # MongoDB connection
│   │   │   └── multer.js         # File upload config
│   │   ├── controllers/
│   │   │   └── expenseController.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── Expense.js
│   │   ├── routes/
│   │   │   └── expenseRoutes.js
│   │   ├── services/
│   │   │   ├── expenseService.js
│   │   │   └── geminiService.js  # Gemini AI integration
│   │   └── server.js
│   ├── uploads/                  # Uploaded invoices (auto-created)
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard/        # Dashboard + charts
    │   │   ├── Expenses/         # CRUD + Upload
    │   │   ├── Insights/         # AI insights
    │   │   ├── Layout/           # Sidebar + Topbar
    │   │   └── UI/               # Reusable components
    │   ├── services/
    │   │   └── api.js            # Axios API client
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    ├── .env
    └── package.json
```

---

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Google Gemini API Key ([get one here](https://aistudio.google.com/app/apikey))

---

## Setup & Installation

### 1. Clone or extract the project

```bash
cd expense-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env`:
```env
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense_tracker
GEMINI_API_KEY=your_actual_gemini_api_key_here
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
```

Start the backend:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/expenses` | List expenses (with filters) |
| POST | `/api/expenses` | Create expense manually |
| GET | `/api/expenses/:id` | Get single expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| POST | `/api/expenses/upload` | Upload invoice (AI extraction) |
| GET | `/api/expenses/dashboard` | Dashboard stats |
| GET | `/api/expenses/insights` | AI-generated insights |

### Query Parameters for GET /expenses
- `category`: Filter by category (Food, Utility, Subscriptions, Others)
- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `sort`: Sort field (default: -date)

---

## Features

### Invoice Upload
Upload JPEG, PNG, WEBP, or PDF files. Gemini 2.5 Flash extracts:
- Expense name/description
- Vendor/merchant name
- Total amount
- Date
- Auto-classified category

### Dashboard
- Total, monthly, weekly expense summaries
- Monthly trend area chart
- Category breakdown pie chart
- Recent transactions list

### Expense Management
- Full CRUD with inline editing
- Category filtering
- Search by name/vendor
- AI-extracted flag on auto-created expenses

### AI Insights
- Spending pattern analysis
- Overspending detection
- Budget recommendations
- Category breakdowns
- Subscription review

---

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Server port |
| NODE_ENV | development | Environment |
| MONGODB_URI | mongodb://localhost:27017/expense_tracker | MongoDB connection string |
| GEMINI_API_KEY | — | Google Gemini API key (required) |
| UPLOAD_DIR | uploads | Upload directory |
| MAX_FILE_SIZE | 10485760 | Max file size in bytes (10MB) |
| CORS_ORIGIN | http://localhost:3000 | Allowed CORS origin |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| REACT_APP_API_URL | http://localhost:8080/api | Backend API URL |
