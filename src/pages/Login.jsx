import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { currentUser, isLoading, initializeGoogleAuth, login } = useAuth()
  const [buttonContainerReady, setButtonContainerReady] = useState(false)

  // PublicRoute component handles redirecting authenticated users
  // No need for additional redirect logic here - PublicRoute handles it

  useEffect(() => {
    // Wait for Google script to load (AuthContext handles script loading)
    const checkGoogleScript = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleScript)
        setButtonContainerReady(true)
      }
    }, 150)

    // If Google script is already loaded, set ready immediately
    if (window.google?.accounts?.id) {
      clearInterval(checkGoogleScript)
      setButtonContainerReady(true)
    }

    return () => clearInterval(checkGoogleScript)
  }, [])

  useEffect(() => {
    if (buttonContainerReady && window.google?.accounts?.id) {
      const buttonContainer = document.getElementById('googleSignInButton')
      if (buttonContainer && !buttonContainer.hasChildNodes()) {
        window.google.accounts.id.initialize({
          client_id: '369705995460-d2f937r1bj3963upbmob113ngkf5v6og.apps.googleusercontent.com',
          callback: (response) => {
            // Use login function from AuthContext - it will handle navigation
            login(response, navigate)
          },
          cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          type: 'standard',
          text: 'continue_with',
          width: 260,
        })

        if (!currentUser) {
          window.google.accounts.id.prompt()
        }
      }
    }
  }, [buttonContainerReady, currentUser, login, navigate])

  if (isLoading) {
    return (
      <div className="login-page" role="main">
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="loading-spinner" aria-label="Loading"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page" role="main">
      <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div className="auth-card">
          <div className="auth-logo" aria-hidden="true">✨</div>
          <h1 id="authTitle">Welcome to BrightWords</h1>
          <p>Sign in with Google to unlock your personalized learning journey.</p>
          <div id="googleSignInButton" className="google-btn-placeholder" aria-live="polite"></div>
          <p className="auth-hint">
            Need a different account? Use the account switcher in the Google dialog.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
