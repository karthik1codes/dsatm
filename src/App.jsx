import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import BrightWords from './pages/BrightWords'
import SuperPower from './pages/SuperPower'
import Feedback from './pages/Feedback'
import SignLanguage from './pages/SignLanguage'
import Subscription from './pages/Subscription'

// Catch-all route component that checks authentication
function CatchAllRoute() {
  const { isAuthenticated, isLoading, checkAuthSync } = useAuth()
  
  // Use synchronous check to avoid race conditions
  const hasValidSession = checkAuthSync()
  
  if (isLoading && !hasValidSession) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="loading-spinner" aria-label="Loading"></div>
      </div>
    )
  }
  
  // Redirect authenticated users to home (/home), others to signin
  return <Navigate to={(isAuthenticated || hasValidSession) ? "/home" : "/signin"} replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - signin (only accessible when not authenticated) */}
      <Route 
        path="/signin" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected routes - require authentication */}
      {/* Home route - always accessible at /home */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      {/* Root path redirects to /home */}
      <Route 
        path="/" 
        element={<Navigate to="/home" replace />}
      />
      
      {/* Redirect /login to /signin for backward compatibility */}
      <Route 
        path="/login" 
        element={<Navigate to="/signin" replace />}
      />
      
      <Route 
        path="/sign-language" 
        element={
          <ProtectedRoute>
            <SignLanguage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscription" 
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy route - redirect to new Home (protected) */}
      <Route 
        path="/brightwords" 
        element={
          <ProtectedRoute>
            <BrightWords />
          </ProtectedRoute>
        } 
      />
      
      {/* Public routes - accessible without authentication */}
      <Route path="/superpower" element={<SuperPower />} />
      <Route path="/feedback" element={<Feedback />} />
      
      {/* Catch-all route - check auth and redirect appropriately */}
      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppRoutes />
      </AccessibilityProvider>
    </AuthProvider>
  )
}

export default App
