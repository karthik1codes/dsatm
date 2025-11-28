import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import BrightWords from './pages/BrightWords'
import SuperPower from './pages/SuperPower'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<BrightWords />} />
      <Route path="/superpower" element={<SuperPower />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

