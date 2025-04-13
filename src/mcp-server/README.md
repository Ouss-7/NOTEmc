# MCP Server

The Model-Control-Processing (MCP) Server is a core component of the Note Check-in Application. It provides AI-powered text processing capabilities through a microservices architecture.

## Features

- Text summarization
- Sentiment analysis
- Grammar checking
- Job queue processing
- Redis caching
- MongoDB data storage
- JWT authentication
- Rate limiting
- API documentation

## Prerequisites

- Node.js v16+
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the configuration:
   ```bash
   cp .env.example .env
   ```
4. Start Redis server:
   ```bash
   redis-server
   ```
5. Seed the database with initial data:
   ```bash
   npm run seed
   ```

## Development

Start the development server with hot-reloading:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── scripts/        # Utility scripts
```

## Environment Variables

- `PORT`: Server port (default: 3005)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URI`: Redis connection string
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRES_IN`: JWT expiration time
- `LOG_LEVEL`: Logging level
- `RATE_LIMIT_WINDOW`: Rate limit window in minutes
- `RATE_LIMIT_MAX`: Maximum requests per window
- `CACHE_TTL`: Cache time-to-live in seconds

## License

MIT
