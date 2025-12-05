import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import { useAuth } from '../context/AuthContext'
import { useAnnouncement } from '../hooks/useAnnouncement'
import '../styles/Navigation.css'

const Navigation = ({ onStartLearning, onOpenSettings }) => {
  const { accessibilityMode, toggleAccessibilityMode } = useAccessibility()
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const announce = useAnnouncement()
  const [showSignOut, setShowSignOut] = useState(false)

  const handleAccessibilityToggle = () => {
    toggleAccessibilityMode()
    announce(`Accessibility mode ${!accessibilityMode ? 'enabled' : 'disabled'}`)
  }

  const handleSignOut = () => {
    // signOut will handle navigation with replace: true
    signOut(navigate)
    announce('Signed out successfully')
  }

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  return (
    <header className="site-header" role="banner">
      <nav className="nav-header" role="navigation" aria-label="Primary navigation">
        <Link to="/" className="logo" aria-label="BrightWords home">
          <div className="logo-icon" aria-hidden="true">✨</div>
          <span>BrightWords</span>
        </Link>

        <div className="nav-menu" role="menubar" aria-label="Primary menu">
          <a
            href="#home"
            className="nav-item"
            role="menuitem"
            onClick={(e) => {
              e.preventDefault()
              const homeSection = document.getElementById('home')
              if (homeSection) {
                homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
          >
            Home
          </a>
          <a
            href="#support"
            className="nav-item"
            role="menuitem"
            onClick={(e) => {
              e.preventDefault()
              if (onStartLearning) onStartLearning()
            }}
          >
            Learn
          </a>
          <a
            href="#progress"
            className="nav-item"
            role="menuitem"
            onClick={(e) => {
              e.preventDefault()
              const progressSection = document.getElementById('progress')
              if (progressSection) {
                progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
          >
            Progress
          </a>
          <Link
            to="/sign-language"
            className="nav-item"
            role="menuitem"
            title="Sign Language Learning"
          >
            Sign Language
          </Link>
          <a
            href="#parents"
            className="nav-item"
            role="menuitem"
            onClick={(e) => {
              e.preventDefault()
              // Open parents community modal if function exists
            }}
          >
            Parents
          </a>
          <Link to="/feedback" className="nav-item" role="menuitem">
            Feedback
          </Link>
          <Link
            to="/superpower"
            className="nav-item superpower-link-bypass"
            role="menuitem"
            title="SuperPower - AWS AugmentAbility features"
          >
            SuperPower
          </Link>
        </div>

        <div className="user-section" aria-label="User quick actions">
          <div className="streak-badge" aria-label="Current streak">
            🔥 <span id="streakCount">0</span> Day Streak!
          </div>
          <div className="accessibility-controls">
            <button
              type="button"
              className="accessibility-toggle"
              aria-pressed={accessibilityMode}
              aria-label={accessibilityMode ? 'Turn accessibility mode off' : 'Turn accessibility mode on'}
              onClick={handleAccessibilityToggle}
              onKeyDown={(e) => handleKeyDown(e, handleAccessibilityToggle)}
            >
              {accessibilityMode ? 'Accessibility Mode On' : '♿ Accessibility Mode'}
            </button>
          </div>
          <div
            className="avatar"
            role="button"
            tabIndex={0}
            aria-label="Open settings"
            onClick={onOpenSettings}
            onKeyDown={(e) => handleKeyDown(e, onOpenSettings)}
          >
            👤
          </div>
          <div className="user-auth">
            {currentUser && (
              <>
                <span className="user-greeting" aria-live="polite">
                  {currentUser.name || currentUser.given_name || 'User'}
                </span>
                {showSignOut && (
                  <button
                    type="button"
                    className="signout-btn"
                    onClick={handleSignOut}
                    aria-label="Sign out"
                  >
                    Sign out
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
      <p id="accessibilityHint" className="sr-only">
        Switch to a high-contrast, dyslexia-friendly view.
      </p>
    </header>
  )
}

export default Navigation


