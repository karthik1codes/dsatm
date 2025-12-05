import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const iframeRef = useRef(null)

  useEffect(() => {
    // This component ONLY renders on the "/" route
    // It should never interfere with /home or /feedback routes
    
    // Check authentication immediately
    const AUTH_STORAGE_KEY = 'brightwords_google_user'
    const checkAuth = () => {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed?.credential) {
            // User is authenticated, redirect to home
            navigate('/home')
            return true
          }
        } catch (e) {
          // Ignore errors
        }
      }
      return false
    }

    // Check immediately
    if (checkAuth()) {
      return // Already redirected, no need to set up iframe
    }

    // Load the login page (index.html) in an iframe
    if (iframeRef.current) {
      iframeRef.current.src = '/index.html'
    }

    // Listen for successful authentication
    const handleMessage = (event) => {
      // Check if authentication succeeded by listening for unlock message
      if (event.data && event.data.type === 'AUTH_SUCCESS') {
        // Redirect to home after successful login
        navigate('/home')
      }
    }

    window.addEventListener('message', handleMessage)

    // Also check localStorage periodically to detect login
    const authInterval = setInterval(() => {
      if (checkAuth()) {
        clearInterval(authInterval)
      }
    }, 500) // Check every 500ms

    // Clean up
    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(authInterval)
    }
  }, [navigate])

  return (
    <div style={{ width: '100%', height: '100vh', border: 'none', padding: 0, margin: 0 }}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="BrightWords Login"
      />
    </div>
  )
}

export default Login

