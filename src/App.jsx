import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AccessibilityProvider } from './context/AccessibilityContext'
import Login from './pages/Login'
import Home from './pages/Home'
import BrightWords from './pages/BrightWords'
import SuperPower from './pages/SuperPower'
import Feedback from './pages/Feedback'
import SignLanguage from './pages/SignLanguage'
import Subscription from './pages/Subscription'

function App() {
  return (
    <AccessibilityProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sign-language" element={<SignLanguage />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/superpower" element={<SuperPower />} />
        <Route path="/feedback" element={<Feedback />} />
        {/* Legacy route - redirect to new Home */}
        <Route path="/brightwords" element={<BrightWords />} />
        {/* Catch-all route - redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AccessibilityProvider>
  )
}

export default App

