# ⚡ MIND//MIND Cyber Arena

> **Next-Generation Real-Time Technical Trivia, Code Debugging & Multi-Team Buzzer Competition Platform.**  
> Built with Node.js, Express, MongoDB (Mongoose), Socket.io, and Cyberpunk HUD UI.

---

## 🔗 Live & Local Access Links

| Portal | URL | Access Credentials |
| :--- | :--- | :--- |
| **Candidate Player Arena** | `http://localhost:8000` | Enter any alphanumeric **Team ID** (e.g. `ALPHA_01`) |
| **Admin Host Console** | `http://localhost:8000/dashboard.html` | Password: **`Karunya2007`** (configurable in `.env`) |
| **Cloud Production URL** | `https://mindmind.onrender.com` | Deployed on Render |

---

## 🌟 Key Architecture & Highlights

### 1. Dual-Role Competition Engine
- **Admin Role**:
  - Securely authenticated against `ADMIN_PASSWORD` in `.env`.
  - Full control over Round 3 question broadcasting, secret answer inspection, live ascending buzzer queue, point allocation (`+200 PTS`, `-50 PTS`), and leaderboard resets.
- **Team Role**:
  - Teams log in with a unique **Team ID** string.
  - Automatically registered and tracked in MongoDB Atlas.

### 2. Single Unified MongoDB Scoring (`Mongoose`)
- Every team's tournament standing is stored in a clean, unified MongoDB schema:
  ```javascript
  {
    teamId: "CYBER_TITANS",  // Unique String
    score: 550,              // Single unified score across ALL rounds
    currentRound: 3,         // Active round stage
    updatedAt: ISODate(...)
  }
  ```
- **Round 1 (Visual Decoding)**, **Round 2 (Spot the Errors)**, and **Round 3 (Buzzer Blitz)** all atomically update (`$inc`) this **exact same single score field**.

### 3. Real-Time Buzzer Arena (Round 3)
- **Host Broadcast**: Admin selects question from Sets 1–4 and clicks **"DISPLAY QUESTION TO TEAMS"**.
- **Answer Secrecy**:
  - **Candidates NEVER see options or answers.** Only the question prompt and the physical buzzer are rendered.
  - **Admin ONLY sees the answer** after explicitly clicking **"SHOW ANSWER"** to prevent accidental spoilers.
- **Millisecond Precision & Ascending Queue**:
  - Reaction time ($\Delta t = t_{\text{buzz}} - t_{\text{activated}}$) is measured down to the millisecond.
  - Admin view sorts teams in **ascending order (fastest first)**: `🥇 1st (+0.205s)`, `🥈 2nd (+0.511s)`, etc.
- **Dual WebSocket + HTTP Resilience**:
  - Runs on Socket.io for instantaneous sub-millisecond push notifications.
  - Automatic HTTP polling fallback ensures 100% functionality even on networks where WebSockets are blocked.

---

## 🎮 The 3 Competition Stages

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  STAGE 1: VISUAL DECODING                   │
   │  Algorithm paths, seating logic, calendar deductions,       │
   │  and memory pointer trace questions. (Base PTS + Speed)     │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  STAGE 2: SPOT THE ERRORS                   │
   │  Interactive code terminal (Python, C, HTML). Click the     │
   │  defective line to inspect, then deploy the correct patch.  │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  STAGE 3: BUZZER SHOWDOWN                   │
   │  Host-broadcasted live buzzer showdown. Contenders hit      │
   │  the arcade buzzer / [SPACEBAR]. Ascending reaction queue.  │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone & Install
```bash
git clone https://github.com/karunya-lol/mindmind.git
cd mindmind
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root (see `.env.example`):
```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
ADMIN_PASSWORD=Karunya2007
```

### 3. Start the Server
```bash
npm start
```

Visit:
- Candidate Arena: **`http://localhost:8000`**
- Admin Console: **`http://localhost:8000/dashboard.html`**

---

## 📡 REST API & Real-Time Endpoints

### Authentication & Scores
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Validates admin password against `.env` |
| `POST` | `/api/teams/login` | Registers / logs in team by `teamId` |
| `POST` | `/api/scores/add` | Atomically adds/deducts points from the team's single `score` field |
| `GET` | `/api/scores` | Returns the live tournament leaderboard sorted by score |
| `POST` | `/api/scores/reset` | Resets all scores and active buzzer rounds |

### Real-Time Buzzer
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/buzzer/state` | Returns the currently active question and buzzed queue |
| `POST` | `/api/buzzer/display` | Admin broadcasts question to candidate screens and unlocks buzzers |
| `POST` | `/api/buzzer/buzz` | Team submits buzz; calculates reaction time and rank |
| `POST` | `/api/buzzer/clear` | Clears buzzer queue and resets buzz state for next question |
| `GET` | `/healthz` | Service health status and MongoDB connectivity check |

---

## ☁️ Deployment Guide (Render / Cloud)

1. Connect your GitHub repository to [Render.com](https://render.com).
2. Create a new **Web Service** with:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables in Render Dashboard:
   - `MONGO_URI`: `mongodb+srv://...`
   - `ADMIN_PASSWORD`: `Karunya2007`
   - `PORT`: `8000`
4. Click **Deploy**.

---

## 🛡️ Security & Reliability
- Accidental tab refresh protection (`beforeunload`) active during live competition rounds.
- In-memory persistence fallback ensures zero tournament interruption even if database connectivity drops.
- `.env` and `node_modules` are protected in `.gitignore`.

---

© MIND//MIND Cyber Arena • Built for high-stakes technical coding and trivia tournaments.
