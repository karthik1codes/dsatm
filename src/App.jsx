import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import BrightWords from './pages/BrightWords'
import SuperPower from './pages/SuperPower'
import Feedback from './pages/Feedback'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<BrightWords />} />
      <Route path="/superpower" element={<SuperPower />} />
      <Route path="/feedback" element={<Feedback />} />
      {/* Catch-all route - redirect to home instead of login to avoid forced login */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App

