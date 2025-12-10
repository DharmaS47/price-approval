# Price Approval System

A full-stack price approval application built with Angular, Node.js/Express, and PostgreSQL.

## Tech Stack

- **Frontend**: Angular 17+
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Hosting**: Render Platform

## Project Structure

```
price-approval/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/    # Database and app configuration
│   │   ├── routes/    # API routes
│   │   ├── controllers/ # Route handlers
│   │   ├── models/    # Database models
│   │   ├── middleware/ # Custom middleware
│   │   └── migrations/ # Database migrations
│   └── package.json
├── frontend/          # Angular application
│   └── ...
└── README.md
```

## Features

- ✅ Price approval workflow
- ✅ User authentication
- ✅ Role-based access control
- ✅ Approval history tracking
- ✅ RESTful API
- ✅ Responsive UI

## Local Development

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Angular CLI

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

The frontend will run on `http://localhost:4200` and backend on `http://localhost:3000`.

## Environment Variables

### Backend (.env)

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/priceapproval
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:4200
```

## Deployment on Render

### 1. Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Name: `price-approval-db`
4. Select Free tier
5. Click "Create Database"
6. Save the Internal Database URL

### 2. Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - Name: `price-approval-api`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Add Environment Variables:
     - `DATABASE_URL`: (Internal Database URL from step 1)
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: (generate a secure secret)
     - `CORS_ORIGIN`: `https://price-approval.onrender.com`
4. Click "Create Web Service"

### 3. Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Settings:
   - Name: `price-approval`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist/price-approval/browser`
4. Add Environment Variable:
   - `API_URL`: (Your backend URL from step 2)
5. Click "Create Static Site"

### 4. Run Migrations

After backend deployment, go to the Shell tab in Render and run:

```bash
npm run migrate
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Price Approvals
- `GET /api/approvals` - Get all approvals
- `GET /api/approvals/:id` - Get single approval
- `POST /api/approvals` - Create new approval
- `PUT /api/approvals/:id` - Update approval
- `DELETE /api/approvals/:id` - Delete approval
- `POST /api/approvals/:id/approve` - Approve a request
- `POST /api/approvals/:id/reject` - Reject a request

## License

MIT
