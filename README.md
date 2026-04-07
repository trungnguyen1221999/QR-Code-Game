# Capybara Quest 🐾

A real-time multiplayer QR code scavenger hunt game where players race through physical checkpoints, scan QR codes, complete mini-games, and compete on a live leaderboard.

**Live Demo:** https://capybara-quest.onrender.com

---

## Team

| Member | Role |
|---|---|
| **Kai** | Backend development, Database design, System architecture, UI, Final game, Deployment |
| **Shun** | Mini-game development, UX flow, UI, Design, Shop system, Ideation, Figma design |
| **Yan** | Game story, UI, Mini-game development, Design, Presentation slides, Ideation |

---

## Overview

Capybara Quest is a location-based multiplayer game designed for physical events. A host creates a game session and places QR codes at checkpoints around a venue. Players scan each QR code on their phone, complete a mini-game to pass the checkpoint, earn coins to spend at in-game shops, and race to finish all checkpoints before time runs out.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| React Router DOM | 7.13 | Client-side routing |
| Vite | 7.3 | Build tool |
| Tailwind CSS | 4.2 | Styling |
| Axios | 1.13 | HTTP client |
| TanStack React Query | 5.90 | Data fetching & caching |
| React Hook Form + Zod | latest | Form validation |
| qr-scanner | 1.4 | QR code scanning via device camera |
| qrcode | latest | QR code generation |
| react-hot-toast | 2.6 | Toast notifications |
| lucide-react | latest | Icons |
| @dnd-kit | latest | Drag-and-drop game ordering |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 4.18 | REST API server |
| MongoDB + Mongoose | 8.0 | Database & ODM |
| bcryptjs | 2.4 | Password hashing |
| Cloudinary | 1.41 | Image uploads (avatars) |
| express-validator | 7.0 | Input validation |
| CORS | 2.8 | Cross-origin resource sharing |

### Deployment
| Service | Usage |
|---|---|
| Render | Backend (Web Service) + Frontend (Static Site) |
| MongoDB Atlas | Cloud database |
| Cloudinary | Avatar image storage |

---

## Features

### For Players
- **Join with a code** — Enter a 6-digit game code and a username to join any active session
- **Custom avatar** — Choose from default avatars or upload a custom photo
- **QR scanning** — Scan physical QR codes at each checkpoint using your phone camera
- **13 mini-games** — Host selects which games to include (see full list below)
- **Lives system** — Losing a mini-game costs one life; 0 lives resets progress to checkpoint 1
- **Difficulty modes** — Easy (infinite lives), Normal (5 lives), Hard (3 lives)
- **Coin economy** — Earn coins by completing games, spend them at checkpoint shops
- **Power-ups** — Buy Time Boost (+10s) or Extra Life at shops between checkpoints
- **Final challenge** — A special final boss game unlocked after all checkpoints are complete
- **Live leaderboard** — Real-time ranking updated as players progress
- **Bilingual** — Full Finnish and English support

### For Hosts
- **Account system** — Register and log in with username/password
- **Create sessions** — Generate a unique 6-digit code, set game duration, difficulty, and scan mode
- **Choose mini-games** — Select any subset of the 13 available mini-games and drag to reorder
- **Download QR codes** — Generate and download QR code images per checkpoint, individually or all at once
- **Live dashboard** — See all players who have joined and monitor game status
- **Start/end control** — Manually start the game and end it at any time
- **Live leaderboard view** — Watch player rankings update in real time

---

## Difficulty Modes

| Mode | Lives | Effect |
|---|---|---|
| **Easy** | ∞ Infinite | Players never lose lives — casual, story-focused experience |
| **Normal** | 5 | Moderate challenge; players can make some mistakes |
| **Hard** | 3 | Strict mode; one mistake at each checkpoint is costly |

---

## Scan Modes

| Mode | Behaviour |
|---|---|
| **Ordered** | Players must scan checkpoints in sequence (1 → 2 → 3 → …) |
| **Random** | Players can scan checkpoints in any order; all must be completed to unlock the final challenge |

---

## Mini-Games

| Game | Emoji | Description |
|---|---|---|
| **Memory Cards** | 🃏 | Flip and match pairs of emoji cards |
| **Simon Says** | 🎯 | Repeat a growing color/sound sequence |
| **Puzzle** | 🧩 | Drag and drop pieces to complete a jigsaw |
| **Whack-A-Mole** | 🔨 | Hit animals as they pop up from holes |
| **Tower Builder** | 🏗️ | Stack platforms to build a tower without falling |
| **Word Quiz** | 📝 | Match pictures to Finnish compound words |
| **Click Counter** | 👆 | Click as fast as possible to hit the target count |
| **Color Clicker** | 🎨 | Click the correct color as it changes randomly |
| **Snake** | 🐍 | Classic snake — eat food, avoid walls and yourself |
| **Shoot Targets** | 🎯 | Click on moving targets before they disappear |
| **Maze** | 🧭 | Navigate through a maze to reach the exit |
| **Shape Matcher** | ⏺️ | Match shapes by dragging them to the correct slots |
| **Cross Road** | 🚗 | Cross a busy road without getting hit |

The host chooses any number of these games and can reorder them before the session starts.

---

## Game Flow

```
Host creates session
  → sets game name, duration, difficulty (Easy/Normal/Hard), scan mode (Ordered/Random)
  → selects mini-games and drags to reorder
  → downloads QR codes and places them at physical checkpoints
        ↓
Players join with 6-digit code
  → pick username & avatar → enter waiting room
        ↓
Host starts game
        ↓
Players scan QR codes at checkpoints
  (Ordered: must scan 1 → 2 → 3 in sequence)
  (Random: scan any unvisited checkpoint in any order)
        ↓
Complete mini-game → earn coins → visit shop → buy power-ups
        ↓
After all checkpoints: Final Challenge boss game
        ↓
Win story cutscene → Live leaderboard & podium
```

**Losing a mini-game** costs 1 life. If all lives are lost, the player resets to checkpoint 1 (or can buy an Extra Life from the shop).

---

## Data Models

### GameSession
- `code` — unique 6-character uppercase code
- `status` — `waiting` | `in_progress` | `finished`
- `difficulty` — `easy` | `normal` | `hard`
- `gameMode` — `ordered` | `random`
- `gameOrder` — ordered array of mini-game routes selected by the host
- `totalTime` — session duration (seconds)
- `startedAt`, `expiresAt` — timestamps

### PlayerSession
- `money` — coins earned
- `lives` — remaining lives
- `currentCheckpointIndex` — progress tracker
- `completedList` — array of completed checkpoint numbers (used in random mode)
- `purchasedItems` — power-ups bought
- `score`, `rank` — final results
- `status` — `waiting` | `active` | `eliminated` | `finished`

### Checkpoint
- `level` — checkpoint number
- `qrCode` — unique QR code identifier
- `miniGameId` — linked mini-game

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/hosts` | Register host |
| POST | `/api/hosts/login` | Host login |
| POST | `/api/sessions` | Create game session |
| GET | `/api/sessions/code/:code` | Validate game code |
| POST | `/api/sessions/:id/start` | Start game |
| GET | `/api/sessions/:id/leaderboard` | Get leaderboard |
| POST | `/api/player-sessions/join` | Player joins game |
| PATCH | `/api/player-sessions/:id/checkpoint` | Update checkpoint progress |
| PATCH | `/api/player-sessions/:id/buy` | Purchase item |
| PATCH | `/api/player-sessions/:id/earn-money` | Add coins |
| PATCH | `/api/player-sessions/:id/lose-life` | Lose a life |
| PATCH | `/api/player-sessions/:id/finish` | Mark player finished |
| GET | `/api/users/leaderboard` | All-time leaderboard |
| POST | `/api/upload/avatar` | Upload avatar image |

---

## Project Structure

```
QR-Code-Game/
├── backend/
│   ├── config/          # Database & Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets, images, audio
│   └── src/
│       ├── components/
│       │   └── ui/      # Reusable UI components (Card, GameSettingsCard, StoryModal, …)
│       ├── context/     # React contexts (Language, etc.)
│       ├── pages/       # All page components + mini-games
│       ├── translations/ # EN/FI translation strings
│       └── utils/
│           ├── api.js           # Axios API client
│           └── checkpointShop.js # Lives, coins, progress helpers
└── render.yaml          # Render deployment config
```

---

## Local Development

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend
```bash
cd backend
# Create .env file with your credentials (see .env.example)
npm install
npm run dev
```

### Frontend
```bash
cd frontend
# Create .env file:
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

### Environment Variables

**Backend `backend/.env`**
```
PORT=
NODE_ENV=
MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
```

**Frontend `frontend/.env`**
```
VITE_API_URL=
```

---

## Deployment (Render)

The project is deployed using `render.yaml` at the root:

- **Backend** — Render Web Service, root dir `backend`, start command `npm start`
- **Frontend** — Render Static Site, root dir `frontend`, build command `npm install && npm run build`, publish dir `dist`

Set the following environment variables in Render dashboard:
- Backend: `MONGODB_URI`, `CLOUDINARY_*`, `FRONTEND_URL`
- Frontend: `VITE_API_URL`
