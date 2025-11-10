Velocity:Torque Nation (MERN) - JavaScript version
This archive contains a full MERN app (frontend + backend) using JavaScript.
Frontend: Vite + React (run on port 5173)
Backend: Express + MongoDB (run on port 5000)

Quick start (run in two terminals):

# Backend
cd server
npm install
# copy .env.example -> .env and set MONGO_URI (default is local)
npm run dev

# Frontend
cd frontend
npm install
npm run dev

The frontend expects the backend API at http://localhost:5000/api by default.
