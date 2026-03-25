# Capybara Quest 🐾

A real-time multiplayer QR code scavenger hunt game where players race through physical checkpoints, scan QR codes, complete mini-games, and compete on a live leaderboard.

**Live Demo:** https://capybara-quest.onrender.com

---

## Team

| Member | Role |
|---|---|
| **Kai** | Backend development, Database design, System architecture, UI, Final challenge game, Deployment |
| **Shun** | Mini-game development, UX flow, UI, Design, Shop system, Ideation, Figma design |
| **Yan** | Game story & concept, UI, Mini-game development, Design, Presentation slides, Ideation |

---

## Overview

Capybara Quest is a location-based multiplayer game designed for physical events. A host creates a game session and places QR codes at 6 checkpoints around a venue. Players scan each QR code on their phone, complete a mini-game to pass the checkpoint, earn coins to spend at in-game shops, and race to finish all 6 checkpoints before time runs out.

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
| react-hot-toast | 2.6 | Toast notifications |
| lucide-react | latest | Icons |

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
- **6 unique mini-games** — One different game per checkpoint (see below)
- **Lives system** — Start with 3 lives; losing a mini-game costs one life; 0 lives resets progress to checkpoint 1
- **Coin economy** — Earn coins by completing games, spend them at checkpoint shops
- **Power-ups** — Buy Time Boost (+10s) or Extra Life at shops between checkpoints
- **Final challenge** — A special final game unlocked after all 6 checkpoints
- **Live leaderboard** — Real-time ranking updated as players progress

### For Hosts
- **Account system** — Register and log in with username/password
- **Create sessions** — Generate a unique 6-digit code and set game duration
- **Live dashboard** — See all players who have joined and monitor game status
- **Start/end control** — Manually start the game and end it at any time
- **Live leaderboard view** — Watch player rankings update in real time

---

## Mini-Games

| Checkpoint | Game | Description |
|---|---|---|
| 1 | **Tower Builder** | Stack platforms to build a tower without falling |
| 2 | **Whack-A-Mole** | Hit animals (cat, bird, frog, rabbit) as they pop up from 9 holes |
| 3 | **Word Quiz** | Match pictures to Finnish compound words |
| 4 | **Memory Cards** | Flip and match pairs of emoji cards |
| 5 | **Puzzle** | Drag and drop pieces to complete a jigsaw |
| 6 | **Simon Says** | Repeat a growing color sequence |

---

## Game Flow

```
Host creates session (6-digit code)
        ↓
Players join with code → select avatar → waiting room
        ↓
Host starts game
        ↓
Player scans QR at Checkpoint 1
        ↓
Play mini-game → Win → Visit shop → buy power-ups
        ↓
Repeat for Checkpoints 2–6
        ↓
Final shop → Final challenge
        ↓
Champion reveal & podium
```

**Losing a mini-game** costs 1 life. If all lives are lost, the player resets to checkpoint 1 (or can buy an Extra Life from the shop).

---

## Data Models

### GameSession
- `code` — unique 6-character uppercase code
- `status` — `waiting` | `in_progress` | `finished`
- `totalTime` — session duration (seconds)
- `startedAt`, `expiresAt` — timestamps
- `checkpointIds` — array of 6 checkpoint references

### PlayerSession
- `money` — coins earned
- `lives` — remaining lives (default 3)
- `currentCheckpointIndex` — progress (0–6)
- `purchasedItems` — power-ups bought
- `score`, `rank` — final results
- `status` — `waiting` | `active` | `eliminated` | `finished`

### Checkpoint
- `level` — 1–6
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
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets, images, audio
│   └── src/
│       ├── components/
│       │   └── ui/      # Reusable UI components
│       ├── pages/       # All page components
│       └── utils/
│           └── api.js   # Axios API client
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
