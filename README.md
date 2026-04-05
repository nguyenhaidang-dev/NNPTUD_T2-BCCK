# Drugstore Management System - Backend

A Node.js backend API for a Drugstore Management System built with Express and MongoDB.

## Project Structure

```
drugstore-management-system/
├── server.js              # Entry point
├── package.json          # Dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── config/               # Configuration files
│   └── database.js       # MongoDB connection
├── routes/               # API routes
│   └── drugRoutes.js     # Drug endpoints
├── controllers/          # Business logic
│   └── drugController.js # Drug operations
├── schemas/              # Mongoose schemas
│   └── Drug.js           # Drug schema
└── utils/                # Utility functions
    ├── errorHandler.js   # Error handling
    └── validators.js     # Input validators
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB connection string and port

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Drugs
- `GET /api/drugs` - Get all drugs
- `GET /api/drugs/:id` - Get a specific drug
- `POST /api/drugs` - Create a new drug
- `PUT /api/drugs/:id` - Update a drug
- `DELETE /api/drugs/:id` - Delete a drug

## Technologies Used

- **Express.js** - Web framework
- **Mongoose** - MongoDB object modeling
- **dotenv** - Environment variable management
- **Node.js** - JavaScript runtime

## Features

- Express MVC architecture
- MongoDB integration with Mongoose
- Environment variable configuration
- Error handling middleware
- Input validation utilities
- RESTful API design
- CommonJS module system

## Development

To add new features:

1. Create schema in `schemas/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Import routes in `server.js`

## License

ISC
