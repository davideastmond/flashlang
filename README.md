# FlashLang

## Description

FlashLang is a web application that allows users to create flashcards they can use to aid in language learning (vocabulary, grammar, etc),
trivia or other educational purposes.

Users can create, edit, and organize flashcards into decks, and then use those decks to study and review the material.
Users can also use AI to generate decks based on specific topics or themes.

## Features

- User authentication
- Flashcard creation and editing
- AI Flashcard generation
- Statistics tracking

## Technologies Used

- Nuxt4, Vue 3 and Vite
- Tailwind CSS
- NeonDB, Postgres
- Drizzle ORM
- Gemini-Flash API
- @sidebase/nuxt-auth
- Vercel for deployment

## Requirements

- Node.js v18 or higher
- A NeonDB account and connection string (for database hosting)
- Credentials for Gemini-Flash API

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
# Database connection string
DATABASE_URL=*your_neon_db_connection_string*
AUTH_SECRET=*your_secret_key - you can generate a string*
AUTH_ORIGIN=http://localhost:3000/api/auth
GEMINI_API_KEY=*obtain from google console*
```

## Migrations

Run database migrations using Drizzle ORM:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Screenshots

Forthcoming...
