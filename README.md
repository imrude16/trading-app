# Signalist Trading App

A full-stack trading dashboard built with Next.js, TypeScript, MongoDB, Better Auth, TradingView widgets, Finnhub market data, Inngest background jobs, Gemini AI summaries, and Nodemailer email delivery. The project provides authenticated market dashboards, stock search, stock detail pages, TradingView-powered charts and analysis, user onboarding, personalized welcome emails, watchlist-backed news personalization, and scheduled daily market news summaries.

> Maintainer: `https://github.com/imrude16`<br>
> Repository: `https://github.com/imrude16/trading-app`<br>
> Project Type: Full-stack stock market dashboard and personalized market intelligence app

---

## Table of Contents

- [Project Overview](#project-overview)
- [How the Project Works](#how-the-project-works)
- [Core Workflows](#core-workflows)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Available Scripts](#available-scripts)
- [Route Overview](#route-overview)
- [Data and Integrations](#data-and-integrations)
- [Security and Validation](#security-and-validation)
- [Deployment Notes](#deployment-notes)
- [Future Improvements](#future-improvements)
- [Project Status](#project-status)

---

## Project Overview

Signalist is designed as a personalized stock market tracking platform. It lets users create an account, select investment preferences, explore live market dashboards, search for stocks, open individual stock analysis pages, and receive AI-generated email updates.

The application is built as a single Next.js App Router project. It uses server components, client components, server actions, middleware, route handlers, and background job functions inside one codebase instead of splitting into separate frontend and backend folders.

The project combines four major layers:

- `app/`: Next.js routes, layouts, authenticated dashboard pages, auth pages, and API route handlers.
- `components/`: Reusable UI, forms, dashboard header, stock search, TradingView widget wrapper, and watchlist controls.
- `lib/`: Server actions, Better Auth configuration, Finnhub integration, Inngest jobs, email templates, constants, and utility helpers.
- `database/`: MongoDB connection management and Mongoose models.

> Note: This project displays market information and news for educational/product purposes. It should not be treated as financial advice.

---

## How the Project Works

### Application Shell

The root layout loads global styles, Geist fonts, dark theme defaults, and the Sonner toast system. Authenticated pages use the `(root)` layout, which checks the current Better Auth session on the server before rendering the dashboard UI.

If a user is not authenticated, protected routes redirect to `/sign-in`.

### Authentication Flow

1. A new user opens `/sign-up`.
2. The user provides name, email, password, country, investment goals, risk tolerance, and preferred industry.
3. The frontend form uses React Hook Form for validation and submission state.
4. The form calls the `signUpWithEmail` server action.
5. Better Auth creates the user using email and password authentication.
6. After successful signup, the app sends an `app/user.created` event to Inngest.
7. Inngest generates a personalized welcome intro with Gemini and sends a welcome email through Nodemailer.
8. Better Auth signs the user in automatically and the app redirects to the dashboard.

### Sign-In Flow

1. A returning user opens `/sign-in`.
2. The user enters email and password.
3. The form calls the `signInWithEmail` server action.
4. Better Auth validates credentials and creates a session.
5. The user is redirected to the authenticated dashboard.

### Protected Dashboard Flow

1. The `(root)` layout checks the user session using Better Auth.
2. The layout builds a simplified user object with `id`, `name`, and `email`.
3. The Header loads popular stock results from Finnhub.
4. The dashboard renders TradingView widgets for market overview, heatmap, top stories, and market quotes.
5. The user can search stocks from the header using the command dialog.

### Stock Search Flow

1. The user opens the search command from navigation or with `Ctrl/Cmd + K`.
2. Search input is debounced by 300 ms.
3. The client calls the `searchStocks` server action.
4. If no query is provided, the app loads popular stock profiles.
5. If a query is provided, the app calls the Finnhub search API.
6. Results are normalized into stock records with symbol, name, exchange, type, and watchlist status.
7. Selecting a result navigates to `/stock/:symbol`.

### Stock Detail Flow

1. A user visits `/stock/[symbol]`.
2. The stock detail page renders multiple TradingView widgets for the selected symbol.
3. The page includes symbol information, candlestick chart, baseline chart, technical analysis, company profile, and financials.
4. A watchlist button is shown for adding or removing the stock in the UI.

### Background Email Flow

The app uses Inngest for background workflows:

1. Signup triggers `app/user.created`.
2. The welcome email job builds a user profile prompt.
3. Gemini generates a personalized HTML paragraph.
4. Nodemailer sends a branded welcome email.
5. A scheduled daily job runs at `0 12 * * *`.
6. The job loads users from MongoDB.
7. For each user, it checks watchlist symbols and fetches related Finnhub news.
8. Gemini summarizes the news into email-ready HTML.
9. Nodemailer sends the daily market news summary.

---

## Core Workflows

### Dashboard Market Overview

The home dashboard is composed from TradingView embed widgets:

- Market Overview
- Stock Heatmap
- Market News / Top Stories
- Market Quotes

Widget configuration is centralized in `lib/constants.ts`, while rendering and script injection are handled through `components/TradingViewWidget.tsx` and `components/hooks/useTradingViewWidget.tsx`.

### User Personalization

During signup, the user selects:

- Country
- Investment goals
- Risk tolerance
- Preferred industry

These values are not just form fields. They are passed into the Inngest signup workflow so the welcome email can be personalized around the user's investing profile.

### Market News Summary

Daily news emails are generated through a multi-step background workflow:

1. Fetch all users from Better Auth's MongoDB `user` collection.
2. Load watchlist symbols for each user.
3. Fetch company-specific news from Finnhub when watchlist symbols exist.
4. Fall back to general market news when needed.
5. Ask Gemini to convert raw news into readable HTML sections.
6. Send the final email through Gmail/Nodemailer.

### Watchlist Data Flow

The watchlist model stores:

| Field | Purpose |
| --- | --- |
| `userId` | Owner of the watchlist item. |
| `symbol` | Uppercase stock ticker. |
| `company` | Company display name. |
| `addedAt` | Timestamp for when the item was added. |

The Mongoose schema also creates a unique index on `{ userId, symbol }` to prevent duplicate watchlist entries for the same user.

### Middleware Protection

The middleware checks for a Better Auth session cookie. Protected application paths are blocked when the cookie is missing and redirected to `/`.

The matcher excludes:

- API routes
- Next static assets
- Next image assets
- Favicon
- Sign-in page
- Sign-up page
- Public assets

---

## Features

### Authentication Features

- Email and password signup.
- Email and password sign-in.
- Automatic sign-in after registration.
- Better Auth session management.
- Server-side session checks in protected layouts.
- Auth middleware for protected routes.
- User dropdown and sign-out action.

### Dashboard Features

- Authenticated market dashboard.
- TradingView market overview widget.
- TradingView stock heatmap widget.
- TradingView timeline/top stories widget.
- TradingView market quotes widget.
- Sticky header with navigation.
- Dark visual theme.

### Stock Discovery Features

- Command-dialog stock search.
- `Ctrl/Cmd + K` keyboard shortcut.
- Debounced search input.
- Popular stock suggestions when no query is entered.
- Finnhub-powered stock search.
- Stock result metadata including symbol, company name, exchange, and type.
- Navigation to individual stock detail pages.

### Stock Detail Features

- Dynamic route for `/stock/[symbol]`.
- Symbol information widget.
- Candlestick chart widget.
- Baseline chart widget.
- Technical analysis widget.
- Company profile widget.
- Company financials widget.
- Watchlist toggle UI.

### Email and Automation Features

- Inngest event for new user signup.
- Gemini-generated personalized welcome email intro.
- Nodemailer welcome email delivery.
- Scheduled daily market news workflow.
- Per-user watchlist-aware news fetching.
- Gemini-generated market news summary HTML.
- Daily market summary email delivery.

### Data Features

- MongoDB database connection through Mongoose.
- Cached MongoDB connection for Next.js runtime reuse.
- Better Auth MongoDB adapter.
- Watchlist Mongoose model.
- User lookup from Better Auth's `user` collection.
- Finnhub news and stock search integration.

---

## Tech Stack

### Framework

- Next.js 15
- React 19
- TypeScript
- App Router
- Server Components
- Server Actions
- Route Handlers
- Middleware

### UI

- Tailwind CSS 4
- Radix UI primitives
- Lucide React
- Sonner
- React Hook Form
- React Select Country List
- shadcn-style component structure

### Authentication and Database

- Better Auth
- Better Auth MongoDB adapter
- MongoDB
- Mongoose

### Market Data and Charts

- TradingView embedded widgets
- Finnhub API

### Background Jobs and Email

- Inngest
- Gemini AI through Inngest AI inference
- Nodemailer
- Gmail SMTP

### Tooling

- npm
- ESLint
- TypeScript
- Turbopack
- Git

---

## Folder Structure

```text
trading-app/
|-- README.md
|-- package.json
|-- next.config.ts
|-- tsconfig.json
|-- components.json
|-- eslint.config.mjs
|-- postcss.config.mjs
|-- app/
|   |-- layout.tsx
|   |-- globals.css
|   |-- api/
|   |   `-- inngest/
|   |       `-- route.ts
|   |-- (auth)/
|   |   |-- layout.tsx
|   |   |-- sign-in/
|   |   |   `-- page.tsx
|   |   `-- sign-up/
|   |       `-- page.tsx
|   `-- (root)/
|       |-- layout.tsx
|       |-- page.tsx
|       `-- stock/
|           `-- [symbol]/
|               `-- page.tsx
|-- components/
|   |-- Header.tsx
|   |-- NavItems.tsx
|   |-- SearchCommand.tsx
|   |-- TradingViewWidget.tsx
|   |-- UserDropdown.tsx
|   |-- WatchListButton.tsx
|   |-- forms/
|   |-- hooks/
|   `-- ui/
|-- database/
|   |-- mongoose.ts
|   `-- models/
|       `-- watchlist.model.ts
|-- lib/
|   |-- constants.ts
|   |-- utils.ts
|   |-- actions/
|   |   |-- auth.actions.ts
|   |   |-- finnhub.action.ts
|   |   |-- user.action.ts
|   |   `-- watchlist.action.ts
|   |-- better-auth/
|   |   `-- auth.ts
|   |-- inngest/
|   |   |-- client.ts
|   |   |-- functions.ts
|   |   `-- prompts.ts
|   `-- nodemailer/
|       |-- index.ts
|       `-- templates.ts
|-- middleware/
|   `-- index.ts
|-- public/
|   `-- assets/
|       |-- icons/
|       `-- images/
`-- types/
    `-- global.d.ts
```

---

## Environment Variables

Create a `.env` file in the project root. Do not commit real secrets.

```env
NODE_ENV=development

NEXT_PUBLIC_BASE_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

BETTER_AUTH_URL=http://localhost:3000
BTTER_AUTH_SECRET=<long-random-auth-secret>

GEMINI_API_KEY=<gemini-api-key>

NODEMAILER_EMAIL=<gmail-address>
NODEMAILER_PASSWORD=<gmail-app-password>

FINNHUB_API_KEY=<server-side-finnhub-api-key>
NEXT_PUBLIC_FINNHUB_API_KEY=<public-finnhub-api-key>
```

Required variables:

- `MONGODB_URI`
- `BETTER_AUTH_URL`
- `BTTER_AUTH_SECRET`
- `NODEMAILER_EMAIL`
- `NODEMAILER_PASSWORD`
- `GEMINI_API_KEY`
- `FINNHUB_API_KEY` or `NEXT_PUBLIC_FINNHUB_API_KEY`

Important implementation note:

- The current auth configuration reads `process.env.BTTER_AUTH_SECRET`. If the variable name is corrected in code to `BETTER_AUTH_SECRET`, update the `.env` key accordingly.

---

## Local Setup

### Prerequisites

- Node.js
- npm
- MongoDB database
- Finnhub API key
- Gmail app password or compatible SMTP credentials
- Gemini API access for AI-generated email content

### 1. Clone the Repository

```bash
git clone https://github.com/imrude16/trading-app.git
cd trading-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create:

```text
.env
```

Use the placeholder values from the [Environment Variables](#environment-variables) section.

### 4. Start the Development Server

```bash
npm run dev
```

The app runs on:

```text
http://localhost:3000
```

### 5. Open the App

Use the browser to visit:

```text
http://localhost:3000/sign-up
```

Create an account, then sign in and open the dashboard.

---

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server with Turbopack.

```bash
npm run build
```

Builds the Next.js application for production with Turbopack.

```bash
npm start
```

Starts the production server after a successful build.

```bash
npm run lint
```

Runs ESLint checks.

---

## Route Overview

### Public and Auth Routes

| Route | Description |
| --- | --- |
| `/sign-up` | User registration and personalization form. |
| `/sign-in` | Email/password login page. |

### Protected App Routes

| Route | Description |
| --- | --- |
| `/` | Authenticated market dashboard. |
| `/stock/[symbol]` | Stock detail page for a selected ticker symbol. |

### API Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/inngest` | Inngest serve endpoint. |
| `POST` | `/api/inngest` | Receives Inngest events and function execution requests. |
| `PUT` | `/api/inngest` | Supported by the Inngest Next.js handler. |

---

## Data and Integrations

### MongoDB

MongoDB stores Better Auth user/session data and the app's watchlist collection. The database connection is cached through `global.mongooseCache` to avoid creating new connections on every server action or render.

### Better Auth

Better Auth handles:

- User creation
- Email/password sign-in
- Session cookies
- Session lookup in protected layouts
- Sign-out
- MongoDB-backed auth persistence

### Finnhub

Finnhub is used for:

- Stock search
- Popular stock profile lookup
- Company news by symbol
- General market news fallback

Finnhub fetches use cache and revalidation settings where appropriate.

### TradingView

TradingView widgets are embedded through external script injection. The app uses configuration objects for market dashboard widgets and stock-specific detail widgets.

### Inngest

Inngest runs:

- `send-sign-up-email`
- `daily-news-summary`

The daily news summary can be triggered by event or by cron schedule.

### Gemini AI

Gemini is called through Inngest AI inference to generate:

- Personalized welcome email intro text.
- Human-readable HTML market news summaries.

### Nodemailer

Nodemailer sends:

- Welcome emails.
- Daily market news summary emails.

---

## Security and Validation

- Protected pages are guarded by Better Auth sessions.
- Middleware redirects unauthenticated users away from protected routes.
- Server layout also verifies session state before rendering dashboard pages.
- Better Auth enforces password length between 8 and 128 characters.
- Signup and sign-in forms use React Hook Form validation.
- MongoDB credentials, auth secrets, email passwords, Gemini keys, and Finnhub keys must stay in `.env`.
- The README intentionally uses placeholders and should never contain real secrets.
- Watchlist schema prevents duplicate symbols for the same user.
- External API failures are caught and logged so the UI can degrade gracefully.

---

## Deployment Notes

### Vercel Deployment

The app can be deployed to Vercel as a standard Next.js project.

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Production notes:

- Set `NEXT_PUBLIC_BASE_URL` to the deployed frontend URL.
- Set `BETTER_AUTH_URL` to the deployed app URL.
- Configure `MONGODB_URI` with a production database.
- Configure Finnhub, Gemini, and Nodemailer credentials in the hosting dashboard.
- Configure Inngest with the deployed `/api/inngest` endpoint.
- Confirm scheduled Inngest jobs are enabled in production.
- Use a strong auth secret and rotate it if it has ever been exposed.

### TradingView and Finnhub Notes

TradingView widgets load from external TradingView scripts. Finnhub API responses depend on API key limits, symbols, and available market/news data.

---

## Future Improvements

- Persist watchlist add/remove actions from the UI into MongoDB.
- Add dedicated `/watchlist` and `/search` pages to match the navigation constants.
- Show actual watchlist state on stock detail pages.
- Add price alerts using the existing alert type and condition constants.
- Add email preference controls for daily news summaries.
- Add account settings and profile editing.
- Add loading, error, and empty states for every widget section.
- Add tests for server actions, auth flows, and utility functions.
- Add rate limiting around external API-backed actions.
- Add clearer production logging without exposing sensitive values.
- Fix the auth secret environment variable spelling for consistency.

---

## Project Status

The project currently includes a working Next.js app structure, Better Auth integration, MongoDB connection support, signup and sign-in pages, authenticated dashboard layout, TradingView market widgets, Finnhub-powered stock search, dynamic stock detail pages, watchlist schema, Inngest background jobs, Gemini-generated email content, and Nodemailer email delivery.
