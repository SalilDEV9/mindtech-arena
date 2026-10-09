> **Security notice for the Round 2 import:** Upstream contained exposed credentials. This branch omits them. Rotate the original MongoDB and admin credentials; set fresh `MONGO_URI` and `ADMIN_PASSWORD` via a local `.env` or secure hosting secrets before running. Do not deploy without reviewing unauthenticated administrative endpoints.

# ⚡ MIND//MIND Cyber Arena

> **Next-Generation Real-Time Technical Trivia, Code Debugging & Multi-Team Buzzer Competition Platform.**  
> Built with Node.js, Express, MongoDB (Mongoose), Socket.io, and Cyberpunk HUD UI.

---

## 🔗 Live & Local Access Links

| Portal | URL | Access Credentials |
| :--- | :--- | :--- |
| **Candidate Player Arena** | `http://localhost:8000` | Enter any alphanumeric **Team ID** (e.g. `ALPHA_01`) |
| **Admin Host Console** | `http://localhost:8000/dashboard.html` | Password: **set securely with the `ADMIN_PASSWORD` environment variable** |
| **Cloud Production URL** | `https://mindmind.onrender.com` | Deployed on Render |

---

## 🌟 Key Architecture & Highlights

### 1. Dual-Role Competition Engine & Tournament Gatekeeper
- **Admin Role**:
  - Securely authenticated against `ADMIN_PASSWORD` in `.env`.
  - **Tournament Launch Gatekeeper**: Teams cannot enter the competition arena until the Admin starts the quiz. Real-time broadcast unlocks candidate terminals simultaneously.
  - Full control over Round 3 question broadcasting, secret answer inspection, live ascending buzzer queue, point allocation (`+200 PTS`, `-50 PTS`), and leaderboard resets.
- **Team Role**:
  - Teams log in with a unique **Team ID** string.
  - Terminals are locked with a standby notice until the Admin initiates the tournament.
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

### 3. Continuous Global Round Timers
- **Round 1 (Visual Decoding)**: Exactly **30 Minutes (`30:00`)** total countdown for all 15 questions.
- **Round 2 (Spot The Errors)**: Exactly **20 Minutes (`20:00`)** total countdown for all 16 bug hunting challenges.
- Timers run continuously in the cyber HUD and do not reset between questions, testing time management under pressure.

### 4. Real-Time Buzzer Arena (Round 3)
- **Host Broadcast**: Admin selects question from Set 1 or Set 2 and clicks **"DISPLAY QUESTION TO TEAMS"**.
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
   │  15 Structured Questions • 30-Minute Global Timer           │
   │  Logic deduction, pointer tracing, recursion, bitwise,      │
   │  and syntax behavior. (+100 Base PTS + Speed Bonus)         │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  STAGE 2: SPOT THE ERRORS                   │
   │  16 Defective Code Challenges • 20-Minute Global Timer       │
   │  Interactive cyber terminal (Python, C, HTML). Click the    │
   │  defective line to inspect, then deploy the correct patch.  │
   │  (+30 Line PTS + 120 Patch PTS + Speed Bonus)               │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  STAGE 3: BUZZER SHOWDOWN                   │
   │  16 Buzzer Blitz Questions • Host Broadcasted               │
   │  Contenders hit arcade buzzer / [SPACEBAR] upon reading.    │
   │  Ascending millisecond reaction queue. (+200 / -50 PTS)     │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone & Install
```bash
git clone -b round-2 https://github.com/SalilDEV9/mindtech-arena.git
cd mindtech-arena
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root (see `.env.example`):
```env
PORT=8000
MONGO_URI=your_secure_mongodb_connection_string
ADMIN_PASSWORD=YOUR_STRONG_ADMIN_PASSWORD
```

### 3. Start the Server
```bash
npm start
```

Visit:
- Candidate Arena: **`http://localhost:8000`**
- Admin Console: **`http://localhost:8000/dashboard.html`**

---

## 📖 How to Use the App (Tournament Guide)

### 👑 Part 1: Tournament Admin & Host Guide

#### 1. Host Authentication
- Navigate to `http://localhost:8000/dashboard.html`.
- Enter the Master Admin Password (set via `ADMIN_PASSWORD`, configured in your `.env`).
- Once authenticated, you will have access to the **Tournament Launch Gatekeeper**, **Buzzer Showdown Host Controls**, and **Real-Time Leaderboard**.

#### 2. Tournament Launch Gatekeeper
- Prior to tournament kickoff, candidate terminals are held in a **LOCKED STANDBY** state.
- In the top action bar of the Admin Dashboard, click **`🚀 START QUIZ`**.
- This instantly transmits a live WebSocket broadcast (`quiz:started`) that unlocks all candidate arena terminals simultaneously.
- If you ever need to pause tournament entry or hold teams, click **`⏸️ PAUSE / LOCK QUIZ`**.

#### 3. Conducting Stage 3: Buzzer Showdown
- During Round 3, select the designated Question Set (`Set 1` or `Set 2`) and choose the active question index (1 to 16).
- Click **`DISPLAY QUESTION TO TEAMS`**:
  - The question prompt immediately appears on all candidate screens and their physical buzzers unlock.
  - Candidate screens **never display the options or correct answer**.
- As teams slam their buzzers, their reaction times are registered down to the millisecond and streamed to the **Ascending Buzz Queue**:
  - `🥇 1st Place: TEAM_ALPHA (+0.218s)`
  - `🥈 2nd Place: TEAM_BETA (+0.485s)`
- Click **`SHOW ANSWER`** to inspect the verified answer key on your host dashboard without candidate screens seeing it.
- Call on the fastest team to answer verbally:
  - If correct: Click **`+200 PTS`** to award points directly to their MongoDB record.
  - If incorrect: Click **`-50 PTS`** penalty.
- Click **`CLEAR / RESET BUZZER`** to reset buzz state for the next question.

#### 4. Managing Tournament Leaderboards
- The live leaderboard updates in real-time as candidates score points across Rounds 1, 2, and 3.
- To start a new tournament bracket or clear all team registrations, click **`RESET ALL SCORES`** in the dashboard. This clears the MongoDB records, empties buzzer queues, and re-locks the gatekeeper.

---

### 🎮 Part 2: Candidate Teams & Players Guide

#### 1. Arena Entry & Registration
- Navigate to `http://localhost:8000`.
- Enter your designated **Team ID** (e.g., `CYBER_TITANS`, `ALPHA_01`) and select your assigned **Question Set** (`Set 1 (Alpha)` or `Set 2 (Beta)`).
- Click **`ENTER ARENA ▶`**:
  - If the Admin has not yet started the tournament, a security banner will inform you that the quiz is locked. Stand by on this page — the arena will automatically unlock the second the Admin begins the tournament!

#### 2. Stage 1: Visual Decoding (15 Questions • 30:00 Timer)
- **Time Limit**: A global countdown of **30 Minutes (`30:00`)** starts the instant Round 1 begins. The timer ticks continuously across all 15 questions without resetting.
- **Questions**: Analytical deduction, pointer tracing, recursive function outcomes, bitwise shifts, and Python closures.
- **Controls**: Click the options (A, B, C, D) or press keyboard keys `[1]`, `[2]`, `[3]`, `[4]`.
- **Armory Perks**:
  - `50/50 Purge`: Eliminates 2 incorrect options.
  - `Diagnostic Hint`: Reveals analytical clues.
  - `Chronos Freeze`: Halts the countdown timer for 10 seconds.
- **Scoring**: `+100 Base PTS` + up to `+10 PTS` speed bonus for fast answers.

#### 3. Stage 2: Spot The Errors (16 Bug Challenges • 20:00 Timer)
- **Time Limit**: A global countdown of **20 Minutes (`20:00`)** runs continuously across all 16 bug challenges.
- **Two-Step Cyber Debugging**:
  1. **Line Identification**: Inspect the code in the cyber IDE terminal and click directly on the defective line containing the syntax or logic bug (`+30 Base PTS` + speed bonus).
  2. **Patch Deployment**: Once the line is confirmed, select the verified fix from Patch Options A, B, C, D using mouse or keys `[1]-[4]` (`+120 Base PTS` + speed bonus).
- All points atomically increment your single cumulative team tournament score.

#### 4. Stage 3: Buzzer Showdown (16 Questions • Live Host)
- Stand by on the buzzer screen until the Tournament Host broadcasts a question.
- The instant the question prompt appears, read swiftly and hit the **ARCADE BUZZER** or tap **`[SPACEBAR]`**.
- Your reaction time is measured to the millisecond.
- If your team is ranked #1 in the queue, provide your answer verbally to the Host when called upon.

---

## 📡 REST API & Real-Time Endpoints

### Tournament Gatekeeper & Scores
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Validates admin password against `.env` |
| `GET` | `/api/quiz/status` | Returns whether Admin has launched the tournament (`quizStarted`) |
| `POST` | `/api/quiz/start` | Admin launches the quiz and unlocks all candidate arenas |
| `POST` | `/api/quiz/stop` | Admin pauses / locks candidate arena entry |
| `POST` | `/api/teams/login` | Registers / logs in team by `teamId` |
| `POST` | `/api/scores/add` | Atomically adds/deducts points from the team's single `score` field |
| `GET` | `/api/scores` | Returns the live tournament leaderboard sorted by score |
| `POST` | `/api/scores/reset` | Resets all scores, quiz lock state, and active buzzer rounds |

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
   - `MONGO_URI`: `your_secure_mongodb_connection_string`
   - `ADMIN_PASSWORD`: `YOUR_STRONG_ADMIN_PASSWORD`
   - `PORT`: `8000`
4. Click **Deploy**.

---

## 🛡️ Security & Reliability
- Accidental tab refresh protection (`beforeunload`) active during live competition rounds.
- In-memory persistence fallback ensures zero tournament interruption even if database connectivity drops.
- `.env` and `node_modules` are protected in `.gitignore`.

---

© MIND//MIND Cyber Arena • Built for high-stakes technical coding and trivia tournaments.
