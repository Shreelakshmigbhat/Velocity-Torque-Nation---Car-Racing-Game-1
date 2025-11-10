import React from 'react'
import { createRoot } from 'react-dom/client'
import CompleteRacingGame from './CompleteRacingGame.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CompleteRacingGame />
  </React.StrictMode>
)
