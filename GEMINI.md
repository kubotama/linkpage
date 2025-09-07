# Project Overview

This project, "linkpage," is a web application for managing bookmarks. It is built with Next.js, TypeScript, and Tailwind CSS, following a client-server architecture. The server, built with Next.js, provides a RESTful API for managing bookmarks and keywords. The client, built with React, consumes this API to display and manage the bookmarks in the web browser. The application uses SQLite as its database.

# Building and Running

For details on installation, running the application, testing, and linting, please refer to the main `README.md` file.

# Development Conventions

## Coding Style

The project uses TypeScript and follows the standard Next.js project structure. It also uses ESLint for linting, and a `.prettierrc` file is present in the `src` directory, suggesting that Prettier is used for code formatting.

## Testing Practices

The project uses Vitest for testing. Test files are located alongside the files they test, with a `.test.tsx` or `.test.ts` extension. The tests use `@testing-library/react` for testing React components.

## API

The application uses a RESTful API to manage bookmarks and keywords. The API endpoints are defined in `src/app/constants/apiEndpoints.ts`. The API is well-documented in the `README.md` file, with examples of requests and responses. See `README.md` for detailed API specifications.

## Real-time Updates

The application uses Server-Sent Events (SSE) to receive real-time updates from the server. The `useBookmarkManager` hook establishes a connection to the `/api/events` endpoint to receive notifications when bookmarks are updated.

## Database

The application uses SQLite to store bookmarks and keywords. The database schema is defined in the `README.md` file. The `better-sqlite3` library is used to interact with the database. See `README.md` for the detailed schema.
