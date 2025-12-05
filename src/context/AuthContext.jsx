import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AUTH_STORAGE_KEY = 'brightwords_google_user'
const GOOGLE_CLIENT_ID = '369705995460-d2f937r1bj3963upbmob113ngkf5v6og.apps.googleusercontent.com'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Decode JWT credential
  const decodeJwtCredential = useCallback((token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return null
    }
  }, [])

  // Check if user is authenticated (synchronous check)
  const checkAuthSync = useCallback(() => {
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!cached) return false

      const parsed = JSON.parse(cached)
      if (!parsed?.credential) return false

      const tokenData = decodeJwtCredential(parsed.credential)
      return !!(tokenData && tokenData.email)
    } catch (error) {
      return false
    }
  }, [decodeJwtCredential])

  // Restore session from localStorage
  const restoreSession = useCallback(() => {
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!cached) {
        setCurrentUser(null)
        setIsLoading(false)
        return
      }

      const parsed = JSON.parse(cached)
      if (parsed?.credential) {
        const tokenData = decodeJwtCredential(parsed.credential)
        if (tokenData && tokenData.email) {
          setCurrentUser({
            ...parsed,
            ...tokenData,
            loginTime: new Date().toISOString(),
          })
          setIsLoading(false)
          return
        }
      }

      // Invalid session
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setCurrentUser(null)
      setIsLoading(false)
    } catch (error) {
      console.warn('Error restoring session:', error)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setCurrentUser(null)
      setIsLoading(false)
    }
  }, [decodeJwtCredential])

  // Login function - sets token and stores in localStorage
  // Navigation should be handled by the calling component
  const login = useCallback((userData) => {
    if (!userData?.credential) return

    const profile = decodeJwtCredential(userData.credential)
    const user = {
      ...profile,
      credential: userData.credential,
      loginTime: new Date().toISOString(),
    }

    setCurrentUser(user)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }, [decodeJwtCredential])

  // Handle credential response
  const handleCredentialResponse = useCallback(
    (response) => {
      if (!response?.credential) return

      const profile = decodeJwtCredential(response.credential)
      const user = {
        ...profile,
        credential: response.credential,
        loginTime: new Date().toISOString(),
      }

      setCurrentUser(user)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    },
    [decodeJwtCredential]
  )

  // Sign out - clears auth state
  // Navigation should be handled by the calling component with replace: true
  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setCurrentUser(null)
  }, [])

  // Initialize Google Auth
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id) {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval)
          initializeGoogleAuth()
        }
      }, 150)
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: true,
    })
  }, [handleCredentialResponse])

  // Load session on mount
  useEffect(() => {
    // Restore session immediately
    restoreSession()

    // Set up Google Auth script
    if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeGoogleAuth()
      }
      document.head.appendChild(script)
    } else {
      initializeGoogleAuth()
    }
  }, [restoreSession, initializeGoogleAuth])

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    checkAuthSync,
    login,
    signOut,
    initializeGoogleAuth,
    handleCredentialResponse,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

