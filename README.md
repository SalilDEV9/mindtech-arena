# MindTech Arena — Official Website & Live Leaderboard

A high-performance, responsive event website and real-time MongoDB-backed Leaderboard system built for **MindQuest at IIIT Kottayam** (10–11 October 2026).

---

## 🌟 Key Features

- **Official Event Landing Page**: High-fidelity event overview featuring rounds breakdown, schedule, prize distribution, FAQ disclosures, and registration links.
- **Dedicated Live Leaderboard (`/leaderboard`)**:
  - Real-time team standings sorted by points descending.
  - Centered dark-slate glassmorphism aesthetic with rank badges and ordinals (`1st`, `2nd`, `3rd`, `4th`...).
  - Quick statistics bar displaying total competing teams, top arena score, and live database sync status.
  - Server-side pagination (15 teams per page) with responsive controls.
- **Inline Score Editing & Staged Bulk Updates**:
  - `✏️` Edit action on each team row with `✓ Done` and `✕ Cancel` (keyboard-accessible via `Enter` / `Escape`).
  - Multi-team staging queue allowing administrators to edit several scores before committing.
  - `⚡ Update Scores (N)` bulk commit action protected by admin password authentication.
- **Bulk Team Deletion (`🗑️ Delete Teams`)**:
  - Inline row delete button (`🗑️` / `↩️` toggle) marking rows with strike-through and pending status.
  - Top bar `🗑️ Delete Teams (N)` bulk commit modal protected by admin password authentication.
- **Team Registration Modal (`➕ Add Team`)**:
  - Password-protected registration dialog to add new teams with custom ID, leader name, and initial score.
  - Duplicate team ID validation.

---

## 📁 Repository Structure

```
├── dist/
│   ├── index.html            # Main event landing page
│   ├── style.css             # Landing page styles
│   ├── app.js                # Landing page interactions & countdown
│   ├── leaderboard.html      # Dedicated leaderboard page
│   ├── leaderboard.css       # Scoped leaderboard design system & modal styles
│   ├── leaderboard.js        # Client-side leaderboard logic & state management
│   ├── event-config.js       # Event metadata & date configuration
│   └── assets/               # Fonts, logos, artwork & favicon
├── models/
│   └── Team.js               # Mongoose schema for teams (indexed by points desc)
├── scripts/
│   └── seed.js               # Database seeding script (45 sample teams)
├── server.js                 # Express backend server with MongoDB & API routes
├── .env.example              # Environment variables template
├── package.json              # Project scripts and dependencies
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection URI)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Configure your environment variables:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mindtech_arena?retryWrites=true&w=majority
ADMIN_PASSWORD=testingPass
```

### 4. Seed Initial Data (Optional)
Populate the database with 45 sample competing teams:
```bash
npm run seed
```

### 5. Start the Server
Run the Express application:
```bash
# Production start
npm start

# Development mode with automatic reload
npm run dev
```

Open your browser at:
- **Landing Page**: [http://localhost:8000](http://localhost:8000)
- **Leaderboard**: [http://localhost:8000/leaderboard](http://localhost:8000/leaderboard)

---

## 📡 API Reference

### `GET /api/leaderboard`
Fetches paginated, rank-calculated teams sorted in descending order of points.
- **Query Parameters**:
  - `page` (integer, default: `1`): Current page number.
  - `limit` (integer, default: `15`): Number of teams per page (max: `100`).
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "teams": [
        {
          "_id": "6ac77b1d48202cd8814beaa1",
          "teamName": "Quantum Coders",
          "teamLeader": "Aarav Sharma",
          "teamId": "MTA-101",
          "points": 995,
          "rank": 1,
          "updatedAt": "2026-10-08T12:53:33.756Z"
        }
      ],
      "pagination": {
        "totalTeams": 45,
        "totalPages": 3,
        "currentPage": 1,
        "limit": 15,
        "hasNextPage": true,
        "hasPrevPage": false
      }
    }
  }
  ```

### `POST /api/leaderboard/scores`
Password-protected bulk update of team points.
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "password": "testingPass",
    "updates": [
      { "teamId": "MTA-101", "points": 1000 },
      { "teamId": "MTA-102", "points": 980 }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully updated 2 team score(s).",
    "modifiedCount": 2
  }
  ```

### `POST /api/leaderboard/teams`
Password-protected registration of a new team.
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "password": "testingPass",
    "teamName": "Apex Innovators",
    "teamLeader": "Vikram Malhotra",
    "teamId": "MTA-146",
    "points": 960
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Team \"Apex Innovators\" added successfully.",
    "data": { ... }
  }
  ```

### `DELETE /api/leaderboard/teams` (or `POST /api/leaderboard/teams/delete`)
Password-protected bulk deletion of teams by ID.
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "password": "testingPass",
    "teamIds": ["MTA-101", "MTA-102"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully deleted 2 team(s).",
    "deletedCount": 2
  }
  ```

### `GET /api/health`
Health check for server status and MongoDB connection state.
- **Response**:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "timestamp": "2026-10-08T12:41:25.451Z"
  }
  ```

---

## 🔒 Security & Admin Notes

- All administrative actions (`Update Scores`, `Delete Teams`, and `Add Team`) require valid authentication via `ADMIN_PASSWORD`.
- The `.env` file is excluded from Git tracking via `.gitignore`.
- Database operations utilize atomic bulk writing (`bulkWrite`), atomic multi-document deletes (`deleteMany`), and indexed queries for maximum reliability under high concurrent traffic.

## Vercel deployment

Deploy the `arshal-work` branch from the repository root with the Express framework preset. `vercel.json` installs the locked dependencies and copies `dist` to `public` for Vercel's CDN. `server.js` exports the Express app for API requests.

In Vercel Settings → Environment Variables, configure `MONGODB_URI` with your MongoDB Atlas connection string and `ADMIN_PASSWORD` with a private admin password for Production. Configure Preview separately if needed. Do not commit those values. Redeploy after setting them.

Verify `/api/health` reports `database: connected`, then open `/leaderboard`. An empty database is valid; add actual event teams through the password-protected Add Team form. The sample seed is optional and is not run during deployment.

## Private leaderboard access

`/leaderboard` and `/leaderboard.html` require the existing `ADMIN_PASSWORD` via `/leaderboard/login`. All `/api/leaderboard` routes also require the signed session cookie. Sessions expire after eight hours; use **Lock leaderboard** to sign out. Cookies are HttpOnly, SameSite=Strict, and Secure on Vercel. Password changes invalidate existing sessions. The public event page stays accessible. Private leaderboard HTML is excluded from Vercel CDN output. Existing write actions also retain their password confirmation.
