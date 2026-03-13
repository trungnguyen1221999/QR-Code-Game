# QR Code Game — API Documentation

Base URL: `http://localhost:5000/api`

---

## Table of Contents

1. [Host](#1-host)
2. [Game Session](#2-game-session)
3. [Player Session](#3-player-session)
4. [Checkpoint](#4-checkpoint)
5. [Shop](#5-shop)
6. [Item](#6-item)
7. [Minigame](#7-minigame)
8. [User](#8-user)

---

## 1. Host

### Register host
`POST /hosts`

**Body:**
```json
{
  "username": "host01",
  "name": "Nguyen Van A",
  "password": "123456"
}
```

**Response `201`:**
```json
{
  "message": "Host created successfully",
  "host": {
    "_id": "...",
    "username": "host01",
    "name": "Nguyen Van A",
    "avatar": ""
  }
}
```

---

### Login host
`POST /hosts/login`

**Body:**
```json
{
  "username": "host01"
}
```

**Response `200`:**
```json
{
  "message": "Login successful",
  "host": {
    "_id": "...",
    "username": "host01",
    "name": "Nguyen Van A",
    "avatar": ""
  }
}
```

---

### Get host by ID
`GET /hosts/:id`

**Response `200`:**
```json
{
  "_id": "...",
  "username": "host01",
  "name": "Nguyen Van A",
  "avatar": ""
}
```

---

### Update host
`PUT /hosts/:id`

**Body** (only include fields to update):
```json
{
  "name": "New Name",
  "avatar": "https://..."
}
```

---

## 2. Game Session

### Create a game session (host creates a room)
`POST /sessions`

**Body:**
```json
{
  "hostId": "<host_id>",
  "name": "Capy Quest #1",
  "totalTime": 60
}
```
> `totalTime` is in **minutes**

**Response `201`:**
```json
{
  "_id": "...",
  "hostId": "...",
  "name": "Capy Quest #1",
  "code": "CAPY42",
  "totalTime": 60,
  "status": "waiting",
  "checkpointIds": [],
  "startedAt": null,
  "expiresAt": null,
  "createdAt": "..."
}
```
> Store the `code` on the frontend to display to players

---

### Check if a code is valid
`GET /sessions/code/:code`

> Call this when a player enters a code, to verify the game exists before joining

**Response `200`:**
```json
{
  "id": "...",
  "name": "Capy Quest #1",
  "status": "waiting",
  "code": "CAPY42"
}
```

**Errors:**
- `404` — Game not found
- `410` — Game has already ended or expired

---

### Get session details
`GET /sessions/:id`

**Response `200`:** Full session object with `checkpointIds` populated.

---

### Start game (host)
`POST /sessions/:id/start`

> Called when the host presses **"Start Game"**. Automatically sets `status = in_progress`, calculates `expiresAt`, and moves all `waiting` players to `active`.

**Response `200`:** Updated session object

---

### Finish game (host)
`POST /sessions/:id/finish`

**Response `200`:** Session object with `status = finished`

---

### Get all players in a session (host polling)
`GET /sessions/:id/players`

> Host uses this endpoint to poll every 2s — displays the player list in the waiting room / dashboard

**Response `200`:**
```json
[
  {
    "_id": "...",
    "userId": {
      "_id": "...",
      "username": "player1",
      "avatar": "https://..."
    },
    "score": 0,
    "lives": 3,
    "status": "waiting",
    "completedCheckpoints": [],
    "joinedAt": "..."
  }
]
```

---

### Session leaderboard
`GET /sessions/:id/leaderboard`

> Both players and host use this endpoint to poll the live leaderboard

**Response `200`:**
```json
[
  {
    "rank": 1,
    "username": "player1",
    "avatar": "https://...",
    "score": 350,
    "status": "finished",
    "completedCheckpoints": 3
  },
  {
    "rank": 2,
    "username": "player2",
    "avatar": "",
    "score": 200,
    "status": "active",
    "completedCheckpoints": 2
  }
]
```

---

### Get all sessions by host
`GET /sessions/host/:hostId`

**Response `200`:** Array of sessions, sorted newest first

---

## 3. Player Session

### Join a game
`POST /player-sessions/join`

> The most important endpoint. Automatically creates a User if not found, creates a PlayerSession, and returns a redirect target.

**Body:**
```json
{
  "username": "capybara123",
  "code": "CAPY42"
}
```

**Response `200`:**
```json
{
  "redirect": "waiting-room",
  "user": {
    "id": "...",
    "username": "capybara123",
    "avatar": ""
  },
  "playerSession": {
    "id": "...",
    "status": "waiting"
  },
  "session": {
    "id": "...",
    "name": "Capy Quest #1",
    "status": "waiting",
    "expiresAt": null
  }
}
```

> `redirect` value:
> - `"waiting-room"` — game has not started yet
> - `"game"` — game is in progress and code is still valid

**Errors:**
- `404` — Code not found
- `410` — Game has ended or expired

---

### Get player session
`GET /player-sessions/:id`

> Player uses this to poll their own state (lives, score, status, items...)

**Response `200`:**
```json
{
  "_id": "...",
  "userId": { "username": "capybara123", "avatar": "" },
  "sessionId": "...",
  "money": 150,
  "lives": 3,
  "score": 100,
  "currentCheckpointIndex": 1,
  "completedCheckpoints": ["<checkpoint_id>"],
  "purchasedItems": [],
  "status": "active",
  "joinedAt": "..."
}
```

> **Polling tip:** In the waiting room, the player polls this endpoint every 2s. When `status` changes from `waiting` → `active`, navigate to `/game`.

---

### Update checkpoint after scanning QR
`PATCH /player-sessions/:id/checkpoint`

> Called after the player successfully scans a QR code and passes the minigame

**Body:**
```json
{
  "checkpointId": "<checkpoint_id>",
  "scoreEarned": 100
}
```

**Response `200`:** Updated player session

---

### Buy an item from the shop
`PATCH /player-sessions/:id/buy`

**Body:**
```json
{
  "itemId": "<item_id>",
  "price": 50
}
```

**Response `200`:** Updated player session (money deducted, item added)

**Error `400`:** Not enough money

---

### Earn money from a minigame
`PATCH /player-sessions/:id/earn-money`

**Body:**
```json
{
  "amount": 100
}
```

**Response `200`:** Updated player session

---

### Lose a life
`PATCH /player-sessions/:id/lose-life`

> Called when the player answers wrong or runs out of time at a checkpoint

**Body:** none

**Response `200`:**
```json
{
  "lives": 2,
  "status": "active"
}
```
> If `lives` reaches 0, `status` is automatically set to `"eliminated"`

---

### Finish the final game
`PATCH /player-sessions/:id/finish`

> Called when the player completes the final game

**Body:**
```json
{
  "finalScore": 500
}
```

**Response `200`:** Player session with `status = "finished"`. Also increments `totalScore` and `gamesPlayed` on the User.

---

## 4. Checkpoint

### Create a checkpoint
`POST /checkpoints`

**Body:**
```json
{
  "sessionId": "<session_id>",
  "name": "Checkpoint 1 - Library",
  "level": 1,
  "qrCode": "CP-SESSION123-LVL1",
  "miniGameId": "<minigame_id>"
}
```

---

### Get all checkpoints
`GET /checkpoints`

---

### Get checkpoint by ID
`GET /checkpoints/:id`

---

### Get checkpoint by QR code
`GET /checkpoints/qr/:qrCode`

> Called by the frontend after scanning a QR code to identify which checkpoint it is

**Response `200`:**
```json
{
  "_id": "...",
  "sessionId": "...",
  "name": "Checkpoint 1 - Library",
  "level": 1,
  "qrCode": "CP-SESSION123-LVL1",
  "miniGameId": "..."
}
```

---

### Scan QR (legacy)
`POST /checkpoints/scan/:qrCode`

**Body:**
```json
{
  "userId": "<user_id>"
}
```

---

### Update checkpoint
`PUT /checkpoints/:id`

---

### Delete checkpoint
`DELETE /checkpoints/:id`

---

## 5. Shop

### Create a shop
`POST /shops`

**Body:**
```json
{
  "checkpointLevel": 1
}
```

---

### Get shop by checkpoint level
`GET /shops/checkpoint/:level`

> Called after a player passes a checkpoint to display the shop

---

### Get shop by ID
`GET /shops/:id`

---

### Add item to shop
`POST /shops/:id/items/:itemId`

---

### Remove item from shop
`DELETE /shops/:id/items/:itemId`

---

## 6. Item

### Create an item
`POST /items`

**Body:**
```json
{
  "name": "Extra Life",
  "desc": "+1 HP for the player",
  "price": 200
}
```

---

### Get all items
`GET /items`

---

### Get item by ID
`GET /items/:id`

---

### Update item
`PUT /items/:id`

---

### Delete item
`DELETE /items/:id`

---

## 7. Minigame

### Create a minigame
`POST /minigames`

**Body:**
```json
{
  "name": "Quick Quiz",
  "type": "multiple_choice",
  "timeLimit": 30,
  "reward": { "money": 100 },
  "checkpointId": "<checkpoint_id>"
}
```

---

### Get all minigames
`GET /minigames`

---

### Get minigame by ID
`GET /minigames/:id`

---

### Get minigames by type
`GET /minigames/type/:type`

---

### Get a random minigame
`GET /minigames/random`

---

### Get a random minigame by type
`GET /minigames/random/:type`

---

## 8. User

### Get all users
`GET /users`

---

### Get user by ID
`GET /users/:id`

---

### Global leaderboard
`GET /users/leaderboard`

> Sorted by `totalScore` descending

---

---

## Overall Flow

```
HOST:
  POST /hosts/login
  POST /sessions                      → receive code "CAPY42"
  POST /checkpoints × N               → create checkpoints for the session
  [polling] GET /sessions/:id/players (every 2s — see who has joined)
  POST /sessions/:id/start            → game begins

PLAYER:
  GET  /sessions/code/CAPY42          → validate the code
  POST /player-sessions/join          → receive { redirect, playerSession.id }

  If redirect = "waiting-room":
    [polling] GET /player-sessions/:id  (every 2s — wait for status → "active")

  When active:
    [scan QR]    GET  /checkpoints/qr/:qrCode
    [pass game]  PATCH /player-sessions/:id/earn-money
                 PATCH /player-sessions/:id/checkpoint
    [shop]       PATCH /player-sessions/:id/buy
    [wrong/timeout] PATCH /player-sessions/:id/lose-life

  PATCH /player-sessions/:id/finish   → game over

LEADERBOARD:
  [polling] GET /sessions/:id/leaderboard  (every 2s)
```
