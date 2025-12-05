import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function BrightWords() {
  const iframeRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Set up message handler BEFORE loading iframe
    // Note: Removed authentication check - users should only login at the beginning
    // Authentication is handled by the iframe content itself
    const handleMessage = (event) => {
      console.log('Received message:', event.data)
      if (event.data && event.data.type === 'NAVIGATE' && event.data.path) {
        console.log('Navigating to:', event.data.path)
        const targetPath = event.data.path
        
        // Feedback page is public - allow navigation without auth check
        if (targetPath === '/feedback') {
          console.log('Navigating to public Feedback page')
          navigate('/feedback')
          return
        }
        
        // For other routes, navigate normally
        navigate(targetPath)
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
          // Function to attach navigation handlers
          const attachNavigationHandlers = () => {
            try {
              const iframeWindow = iframeRef.current.contentWindow
              const iframeDocument = iframeRef.current.contentDocument || iframeWindow.document
              
              if (!iframeDocument) {
                console.warn('Iframe document not accessible')
                return false
              }
              
              // Update SuperPower link to use React Router navigation
              const superPowerLink = iframeDocument.getElementById('superpower-link') || 
                                    iframeDocument.querySelector('a[href="/superpower"]') ||
                                    iframeDocument.querySelector('a[href*="superpower"]')
              
              if (superPowerLink) {
                // Remove existing event listeners by cloning the node
                const newLink = superPowerLink.cloneNode(true)
                superPowerLink.parentNode.replaceChild(newLink, superPowerLink)
                
                newLink.addEventListener('click', (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.stopImmediatePropagation()
                  console.log('SuperPower link clicked, navigating to login...')
                  
                  // Navigate to SuperPower login page (which will redirect to landing after auth)
                  if (window.top && window.top !== window.self) {
                    window.top.location.href = '/aws-augmentability-main/login.html'
                  } else {
                    window.location.href = '/aws-augmentability-main/login.html'
                  }
                })
                
                console.log('Navigation handler attached to SuperPower link')
              }

              // Update Feedback link to use React Router navigation
              // Note: The Feedback link is also handled by inline script in index.html
              // This provides an additional layer of support
              const feedbackLink = iframeDocument.getElementById('feedback-link') || 
                                   iframeDocument.querySelector('a[href="/feedback"]') ||
                                   iframeDocument.querySelector('a[href="#feedback"]') ||
                                   iframeDocument.querySelector('a[href*="feedback"]')
              
              console.log('Feedback link found in React handler:', feedbackLink)
              
              if (feedbackLink) {
                // The inline script in index.html should handle this, but we'll add a backup handler
                // Only attach if there's no existing handler
                const existingHandler = feedbackLink.getAttribute('data-handler-attached')
                if (!existingHandler) {
                  const newFeedbackLink = feedbackLink.cloneNode(true)
                  newFeedbackLink.removeAttribute('onclick')
                  newFeedbackLink.setAttribute('data-handler-attached', 'true')
                  feedbackLink.parentNode.replaceChild(newFeedbackLink, feedbackLink)
                  
                  newFeedbackLink.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                    console.log('Feedback link clicked - navigating directly to /feedback')
                    
                    // Direct navigation to Feedback page - it's public
                    if (window.top && window.top !== window.self) {
                      window.top.location.href = '/feedback'
                    } else {
                      window.location.href = '/feedback'
                    }
                  }, true)
                  
                  console.log('Backup navigation handler attached to Feedback link')
                }
                return true
              } else {
                console.warn('Feedback link not found in iframe document')
                return false
              }
            } catch (error) {
              console.error('Error attaching navigation handlers:', error)
              return false
            }
          }
          
          // Try immediately
          if (!attachNavigationHandlers()) {
            // If not found, try again after a delay
            setTimeout(() => {
              if (!attachNavigationHandlers()) {
                // Try one more time after a longer delay
                setTimeout(attachNavigationHandlers, 1000)
              }
            }, 500)
          }
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

