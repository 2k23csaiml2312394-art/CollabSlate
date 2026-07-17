 
# 🎨 SyncCanvas Real-Time Collaborative Whiteboard

<div align="center">

### A Production-Grade Real-Time Collaborative Whiteboard

Build ideas together in real time with an infinite canvas, live cursors, room-based collaboration, and a modern SaaS-inspired interface.

Built with **React 19**, **TypeScript**, **HTML5 Canvas**, **Socket.IO**, **Zustand**, **Framer Motion**, and **TailwindCSS**.


![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge&logo=socketdotio)

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

# 🚀 Live Demo

Frontend

> https://your-vercel-url.vercel.app

Backend

> https://synccanvas-biik.onrender.com

---

# 🎥 Project Demo

> Replace this section with a GIF after deployment.

```text
assets/demo.gif
```

```markdown
![Demo](assets/demo.gif)
```

---

# 📸 Screenshots

| Home | Whiteboard |
|------|------------|
| ![](assets/home.png) | ![](assets/canvas.png) |

| Collaboration | Room Lobby |
|--------------|------------|
| ![](assets/collaboration.png) | ![](assets/lobby.png) |

---

# ✨ Overview

SyncCanvas is a production-inspired collaborative whiteboard designed to simulate the experience of modern design tools such as Figma and Excalidraw.

The project focuses on frontend engineering, performance optimization, scalable architecture, and real-time collaboration rather than simply implementing drawing functionality.

---

# 🎯 Why I Built This

Most whiteboard applications demonstrate drawing capabilities but overlook software engineering practices.

This project emphasizes:

- Clean architecture
- Modular design
- Real-time synchronization
- High-performance canvas rendering
- Reusable custom hooks
- Optimized React rendering
- Production-ready folder structure
- Scalable state management

---

# 🏗 Architecture

---
``
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐   │
│  │  Router  │→ │Whiteboard  │→ │   Canvas (rAF loop)  │   │
│  │ (React   │  │   Page     │  │   HTML5 Canvas API   │   │
│  │  Router) │  └────────────┘  └──────────────────────┘   │
│  └──────────┘       │                      ↑               │
│                     │                      │               │
│          ┌──────────┴──────────┐           │               │
│          │    Zustand Stores   │           │               │
│          │  ┌────────────────┐ │   ┌───────────────────┐  │
│          │  │  canvasStore   │─┼──→│   useCanvas hook  │  │
│          │  │  historyStore  │ │   │   useZoom hook    │  │
│          │  │  roomStore     │ │   │   useHistory hook │  │
│          │  │  userStore     │ │   │   useAutosave     │  │
│          │  │  toastStore    │ │   └───────────────────┘  │
│          │  └────────────────┘ │                           │
│          └─────────────────────┘                           │
│                     │                                       │
│          ┌──────────┴──────────┐                           │
│          │  socketService      │                           │
│          │  (Socket.IO client) │                           │
│          └──────────┬──────────┘                           │
└─────────────────────┼───────────────────────────────────────┘
                      │ WebSocket
┌─────────────────────┼───────────────────────────────────────┐
│                     │ Node.js Server                        │
│          ┌──────────┴──────────┐                           │
│          │   Express + Socket.IO│                           │
│          │   Room Management    │                           │
│          │   In-memory state    │                           │
│          └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

# 📂 Project Structure

```
SyncCanvas
│
├── server
│   ├── index.js
│   └── package.json
│
├── src
│
├── components
│   ├── WhiteboardCanvas
│   ├── DrawingToolbar
│   ├── WorkspaceHeader
│   ├── RoomLobby
│   ├── LiveCursors
│   ├── EmptyState
│   └── Toast
│
├── hooks
│   ├── useCanvas
│   ├── useSocket
│   ├── useZoom
│   ├── useHistory
│   ├── useRoom
│   └── useAutosave
│
├── services
│
├── store
│
├── pages
│
├── utils
│
├── types
│
├── App.tsx
└── main.tsx
```

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19 |
| Language | TypeScript |
| Bundler | Vite |
| Styling | TailwindCSS |
| Animations | Framer Motion |
| State Management | Zustand |
| Realtime | Socket.IO |
| Canvas | HTML5 Canvas API |
| Backend | Express.js |
| Testing | Vitest |

---

# 🎨 Features

### Drawing Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Select | V | Click to select, drag to move |
| Pencil | P | Smooth quadratic-curve freehand |
| Rectangle | R | Click-drag rectangle |
| Circle | C | Click-drag ellipse |
| Line | L | Straight line |
| Arrow | A | Line with arrowhead |
| Eraser | E | Composite-operation erase |

### Canvas Engine
- Infinite canvas with cursor-anchored zoom (Ctrl+Scroll)
- Panning via middle mouse or Alt+drag
- Dot grid overlay with transform-aware spacing
- High-DPI rendering (devicePixelRatio scaling)
- requestAnimationFrame render loop (zero React re-renders while drawing)

### Collaboration
- Room-based via `/room/:id` URLs
- Live cursor positions with name labels (throttled at 40ms)
- Join/leave toast notifications
- Participant avatar list
- Connection status indicator with auto-reconnect

### History & Persistence
- 100-entry undo/redo snapshot stack
- Keyboard shortcuts: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
- Auto-save to localStorage every 5 seconds
- Session restore on refresh

### Export
- PNG export via canvas `toDataURL`

---

## Trade-offs

**In-memory server state:** Room elements are stored in a `Map` in process memory. This means a server restart clears all rooms. For production, use Redis or a database.

**Conflict resolution:** Last-write-wins. Concurrent edits to the same element may conflict. For production, consider CRDTs (e.g. Yjs) for operational transforms.

**Snapshot history:** Undo/redo is local-only. Remote users don't see undo operations from other clients.

**eraser implementation:** Uses `globalCompositeOperation: 'destination-out'` which only works correctly on an opaque background. Transparent canvas exports may show artifacts.


# ⚡ Performance Optimizations

This project was built with frontend performance as a primary goal.

### Rendering

- requestAnimationFrame rendering loop
- High DPI canvas scaling
- Efficient redraw strategy
- Canvas rendering independent of React

---

### React Optimization

- React.memo
- useMemo
- useCallback
- Zustand selectors
- Ref-based rendering
- Zero unnecessary re-renders

---

### Realtime Optimization

- Throttled cursor updates
- Optimized Socket.IO events
- Automatic reconnection
- Lightweight synchronization
- Reduced network traffic

---

### Storage

- LocalStorage autosave
- Session restoration
- Efficient history stack

---

# 📊 Performance Metrics

✅ 60 FPS rendering

✅ Infinite canvas support

✅ High DPI rendering

✅ Auto-save every 5 seconds

✅ Live collaboration

✅ Zero React re-renders while drawing

✅ Optimized state updates

---

# 🧠 Engineering Decisions

## Why HTML5 Canvas?

Canvas provides significantly better rendering performance for interactive drawing applications compared to SVG when managing hundreds or thousands of objects.

---

## Why Zustand?

- Lightweight
- Minimal boilerplate
- Excellent performance
- Fine-grained subscriptions
- Scalable architecture

---

## Why Socket.IO?

- Automatic reconnect
- Room management
- Event acknowledgements
- Reliable real-time communication

---

## Why requestAnimationFrame?

Using requestAnimationFrame ensures rendering stays synchronized with the browser's refresh rate, resulting in smoother drawing and reduced CPU usage.

---


# 🧪 Testing

Implemented using

- Vitest
- React Testing Library

Tests include

- Canvas utilities
- History store
- ID generation
- Hit testing

---

# 🚀 Running Locally

Clone the repository

```bash
git clone https://github.com/2k23csaiml2312394-art/synccanvas.git
```

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3001
```

---

# 🌐 Deployment

## Frontend

Deploy on

- Vercel
- Netlify

```bash
npm run build
```

---

## Backend

Deploy on

- Railway
- Render

```bash
npm start
```

---

# 📈 Future Improvements

- AI Shape Recognition
- Sticky Notes
- Presentation Mode
- Read Only Mode
- Minimap
- Cursor Trails
- Emoji Reactions
- Version History
- CRDT Synchronization
- Cloud Persistence
- Authentication
- Mobile Gestures

---

# 💡 What I Learned

Building SyncCanvas helped me gain practical experience with

- Canvas rendering
- Real-time synchronization
- Performance optimization
- React architecture
- State management
- Custom hooks
- Socket communication
- Responsive UI design
- TypeScript best practices

---

# 🙌 Acknowledgements

Inspired by

- Figma
- Excalidraw
- tldraw

--

---

<div align="center">

### ⭐ If you found this project interesting, consider giving it a star!

Built with ❤️ using React, TypeScript and Socket.IO.

</div>
