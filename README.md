# Note Application with AI Processing

A modern note-taking application with AI-powered text processing capabilities.

## Project Structure

- **note-client**: React frontend with Redux state management and Tailwind CSS
- **mcp-server**: Node.js backend with MongoDB integration

## Features

- Note creation, editing, and organization
- AI-powered text processing tools (sentiment analysis, summarization)
- Real-time processing status updates
- Analysis results visualization
- Glassmorphism UI design with responsive layouts

## Tech Stack

### Frontend
- React 18
- Redux Toolkit
- TypeScript
- Material UI
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB
- Bull (for job processing)
- Natural language processing libraries

## Setup Instructions

### Prerequisites
- Node.js 14+
- MongoDB

### Frontend Setup
```bash
cd src/note-client
npm install
npm start
```

### Backend Setup
```bash
cd src/mcp-server
npm install
npm run dev
```

## UI Design

The application uses a modern glassmorphism design with:
- Backdrop blur effects
- Semi-transparent backgrounds
- Subtle hover animations
- Responsive grid layouts
- Consistent spacing and padding
- White text with varying opacity for visual hierarchy
- Dark mode support

See `STYLING_GUIDELINES.md` for detailed styling information.

## Development Status

This project is currently in active development. See the TODO section for upcoming features.

## TODO

1. Complete frontend-backend integration with proper API endpoints
2. Implement authentication and user management
3. Add testing for frontend components
4. Enhance the UI with search, filtering, and sorting
5. Implement real-time updates for processing status
6. Add error handling and form validation
7. Prepare for deployment with proper environment configuration

## License

MIT
