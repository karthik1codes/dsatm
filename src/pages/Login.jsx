import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { currentUser, isLoading, initializeGoogleAuth, login } = useAuth()
  const [buttonContainerReady, setButtonContainerReady] = useState(false)

  // PublicRoute component handles redirecting authenticated users
  // No need for manual navigation here - PublicRoute will handle it

  useEffect(() => {
    // Wait for Google script to load
    const checkGoogleScript = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleScript)
        initializeGoogleAuth()
        setButtonContainerReady(true)
      }
    }, 150)

    // Load Google script if not present
    if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google?.accounts?.id) {
          initializeGoogleAuth()
          setButtonContainerReady(true)
        }
      }
      document.head.appendChild(script)
    }

    return () => clearInterval(checkGoogleScript)
  }, [initializeGoogleAuth])

  useEffect(() => {
    if (buttonContainerReady && window.google?.accounts?.id) {
      const buttonContainer = document.getElementById('googleSignInButton')
      if (buttonContainer && !buttonContainer.hasChildNodes()) {
        window.google.accounts.id.initialize({
          client_id: '369705995460-d2f937r1bj3963upbmob113ngkf5v6og.apps.googleusercontent.com',
          callback: (response) => {
            try {
              // Validate response first
              if (!response) {
                console.error('No response from Google Sign-In')
                return
              }
              
              if (!response.credential) {
                console.error('No credential in response:', response)
                // Check if it's a cancellation
                if (response.error) {
                  console.log('Sign-in cancelled or error:', response.error)
                  return
                }
                return
              }

              // Use login function from AuthContext and pass navigate function
              // AuthContext will handle navigation after setting user state
              login(response, navigate)
            } catch (error) {
              console.error('Error during sign-in:', error)
              // Don't show error to user - let PublicRoute handle redirect
              // The error is logged for debugging
            }
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
