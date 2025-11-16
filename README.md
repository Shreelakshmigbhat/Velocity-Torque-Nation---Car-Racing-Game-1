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

Velocity:Torque Nation is a 3D web-based racing game built using the MERN stack (MongoDB, Express, React, Node.js) and Three.js. Players can log in, race through dynamically generated obstacles, and compete for high scores stored securely in MongoDB.

The project features a modern glassmorphic UI, neon racing theme, and real-time 3D gameplay rendered with Three.js.

Features

MERN Stack Integration: React frontend, Express backend, MongoDB database

3D Gameplay: Built using Three.js with smooth car controls and obstacle dynamics

User Authentication: Signup, login, and high score tracking with JWT

Glassmorphism UI: Transparent login design with blur and gradient overlays

Persistent Scores: Saves and updates user progress in MongoDB

Responsive Design: Works across devices and screen sizes

Tech Stack Layer Technology Frontend React.js, Three.js Backend Node.js, Express.js Database MongoDB (Mongoose) Authentication JSON Web Tokens (JWT) Styling CSS (Glassmorphism & Neon theme) Setup and Run

Clone the repository git clone https://github.com//velocity-torque-nation.git cd velocity-torque-nation

Install dependencies cd server npm install cd ../frontend npm install

Start the backend server cd server npm run dev

Start the frontend cd frontend npm run dev

Open in browser http://localhost:5173

Future Enhancements

Real-time leaderboard

Multiplayer mode

Car customization and upgrades

Mobile-friendly interface

How it looks:
<img width="2814" height="1345" alt="image" src="https://github.com/user-attachments/assets/1adfbac8-8f67-47a0-a4da-bfc2848498a0" />



<img width="2817" height="1296" alt="image" src="https://github.com/user-attachments/assets/0d45bb24-92cb-4fed-8cc5-b9650b48eb4f" />
day mode 
<img width="2810" height="1320" alt="image" src="https://github.com/user-attachments/assets/f4d1e35d-d0df-4e15-ac6d-a993b48354e6" />




night mode

<img width="2826" height="1296" alt="image" src="https://github.com/user-attachments/assets/6e100635-fc38-4a08-83f4-a4cb291d77e9" />



<img width="2826" height="1289" alt="image" src="https://github.com/user-attachments/assets/b3ef2b38-0b5b-407a-9b7d-ec3dd9694a51" />






