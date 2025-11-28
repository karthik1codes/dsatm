import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function BrightWords() {
  const iframeRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication first - redirect to login if not authenticated
    const AUTH_STORAGE_KEY = 'brightwords_google_user'
    const checkAuth = () => {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed?.credential) {
            return true // User is authenticated
          }
        } catch (e) {
          // Invalid session
        }
      }
      return false // Not authenticated
    }

    // Check authentication immediately
    if (!checkAuth()) {
      // Not authenticated - redirect to login page
      navigate('/')
      return
    }

    // Set up message handler BEFORE loading iframe
    const handleMessage = (event) => {
      console.log('Received message:', event.data)
      if (event.data && event.data.type === 'NAVIGATE' && event.data.path) {
        console.log('Navigating to:', event.data.path)
        navigate(event.data.path)
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Expose navigate function globally for iframe to use
    window.__reactRouterNavigate = (path) => {
      console.log('React Router navigate called with:', path)
      navigate(path)
    }
    
    if (iframeRef.current) {
      iframeRef.current.src = '/index.html'
      
      // Inject navigation handler into iframe after it loads
      iframeRef.current.onload = () => {
        console.log('Iframe loaded')
        try {
          const iframeWindow = iframeRef.current.contentWindow
          const iframeDocument = iframeRef.current.contentDocument || iframeWindow.document
          
          // Wait a bit for the page to fully load
          setTimeout(() => {
            // Update SuperPower link to use React Router navigation
            const superPowerLink = iframeDocument.getElementById('superpower-link') || 
                                  iframeDocument.querySelector('a[href="/superpower"]') ||
                                  iframeDocument.querySelector('a[href*="superpower"]')
            
            console.log('SuperPower link found:', superPowerLink)
            
            if (superPowerLink) {
              // Remove existing event listeners by cloning the node
              const newLink = superPowerLink.cloneNode(true)
              superPowerLink.parentNode.replaceChild(newLink, superPowerLink)
              
              newLink.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                console.log('SuperPower link clicked, navigating...')
                
                // Try multiple methods to ensure navigation works
                if (window.parent && window.parent !== window.self) {
                  window.parent.postMessage({ type: 'NAVIGATE', path: '/superpower' }, '*')
                }
                if (window.__reactRouterNavigate) {
                  window.__reactRouterNavigate('/superpower')
                }
              })
              
              console.log('Navigation handler attached to SuperPower link')
            }
          }, 500)
        } catch (error) {
          console.error('Could not access iframe content:', error)
        }
      }
    }
    
    return () => {
      window.removeEventListener('message', handleMessage)
      delete window.__reactRouterNavigate
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
        title="BrightWords - Fun Learning for Every Child"
      />
    </div>
  )
}

export default BrightWords

