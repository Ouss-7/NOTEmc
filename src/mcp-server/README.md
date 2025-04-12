# MCP (Model-Control-Processing) Server

The MCP Server is a critical component of the Note Check-in Application, serving as the orchestration layer between the core note service and various AI tools.

## Features

- Tool Registry Management
- Processing Pipeline Orchestration
- Result Caching
- Rate Limiting
- Error Handling
- Logging and Monitoring

## Prerequisites

- Node.js v16+
- MongoDB v5+
- Redis v6+
- Docker (optional)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure environment variables:
   ```bash
   cp .env.example .env
   ```

## Development

Start the server in development mode:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

## API Documentation

### Tool Management

- `GET /api/tools` - List all available tools
- `POST /api/tools` - Register a new tool
- `GET /api/tools/:id` - Get tool details
- `PUT /api/tools/:id` - Update tool configuration
- `DELETE /api/tools/:id` - Remove a tool

### Processing

- `POST /api/process` - Submit content for processing
- `GET /api/process/:id` - Get processing status
- `GET /api/process/:id/result` - Get processing results

## Architecture

The MCP Server follows a microservices architecture pattern with:

- Express.js for API endpoints
- MongoDB for tool registry and results storage
- Redis for caching and job queues
- Bull for processing queue management

## Contributing

1. Create a feature branch
2. Commit changes
3. Submit a pull request

## License

MIT
