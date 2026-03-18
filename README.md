# tictactoe
A modern Tic Tac Toe game built with React, featuring three game modes:

- **Player vs AI** — Play against an AI (with multiple difficulty levels).
- **Player vs Player (Local)** — Play with a friend locally on the same computer.
- **Player vs Player (Online)** — Play with a friend online using a room code (peer-to-peer via socket server).

## Features

- 💡 **Challenge the AI:** Choose your symbol (**X** or **O**) and AI difficulty (**easy** or **hard**).
- 🧑‍🤝‍🧑 **PVP Modes:** Play locally, or remotely by joining/creating an online room.
- 🏆 **Real-Time Multiplayer:** Seamless online play via WebSockets (Node.js backend).
- 🎨 **Modern UI:** Beautiful, minimal interface with gradients and smooth transitions.
- 🖥️ **Responsive:** Looks great on desktop & mobile devices.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the Vite dev server

```bash
npm run dev
```

### 3. (Optional) Start the Socket.IO Multiplayer Server

For online mode, you need to run the backend server:

```bash
cd server
npm install
npm start
```
By default, the server runs on port `3001`.

## File Structure

- `src/App.jsx` — Main React app, mode selection, routing.
- `src/components/GameVsAI.jsx` — Core Player vs AI game logic.
- `src/components/GamePVP.jsx` — Local player-vs-player logic.
- `src/components/GamePVPOnline.jsx` — Online multiplayer game with Socket.IO.
- `server/socket-server.js` — Node.js Express server for online multiplayer rooms.

## Environment Variables

To point the frontend to your multiplayer socket server, you can set:

```
VITE_SOCKET_URL=http://localhost:3001
```

## License

MIT

---
*Play, learn, and challenge your friends or AI! Have fun! 😀*
