# Rick & Morty Character Explorer

A responsive React application for exploring characters from the Rick and Morty API.

## Features

- Browse characters with pagination.
- Search by name and filter by status and gender.
- Keep search, filters, and page number in the URL.
- View character details and episode information.
- Return to the list with the previous filters.
- Display loading, empty, and error states.
- Retry failed requests.

## Tech Stack

- React 18
- TypeScript 5
- Vite
- React Router v6
- Plain CSS
- Fetch API

## Getting Started

Requirements: Node.js 20.19+ (20.x) or 22.12+, and npm.

Open a terminal in the project folder and run:

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Production Build

```bash
npm run build
```

This checks TypeScript and generates the production files in `dist`.

To preview the production build locally:

```bash
npm run preview
```

## Implementation Decisions

- Search and filtering are performed by the API.
- URL query parameters store the applied search, filters, and page.
- React state manages data, loading, and errors.
- AbortController cancels pending requests when leaving a page or starting a replacement request.
- Episode details are fetched together using their IDs.
- Filter options are loaded independently of the active search.

## Challenges and Limitations

- Refreshing a filtered URL previously reduced the available filter options. A separate request now loads options from the first and last unfiltered character pages.
- Those two pages are not guaranteed to contain every possible status or gender if the API data changes. Values from browsed results are also added to the options.
- The API can reject requests when rate limits are reached. List actions include a short cooldown, and failed list requests introduce a longer wait before retrying.
- The application requires an internet connection and an available API.

## Live Demo

[Open Rick & Morty Character Explorer](https://rick-morty-explorer-blush.vercel.app/)