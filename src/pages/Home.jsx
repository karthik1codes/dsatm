import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import SkipLink from '../components/SkipLink'
import { useAccessibility } from '../context/AccessibilityContext'
import { useAuth } from '../context/AuthContext'
import { useAnnouncement } from '../hooks/useAnnouncement'
import '../styles/Home.css'
import '../../styles.css'

const Home = () => {
  const navigate = useNavigate()
  const { accessibilityMode } = useAccessibility()
  const { currentUser } = useAuth()
  const announce = useAnnouncement()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [stats, setStats] = useState({
    totalPoints: 0,
    lessonsComplete: 0,
    achievements: 0,
    timeSpent: 0,
    streak: 0,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)

  const supportProfiles = {
    general: {
      message: 'General support mode active. Select another profile if needed.',
      announcement: 'General learner mode enabled.',
    },
    blind: {
      message: 'Blind / low vision mode enabled with richer speech feedback.',
      announcement: 'Blind support enabled. Speech guidance and audio cues boosted.',
    },
    deaf: {
      message: 'Deaf / hard of hearing mode enabled. Visual cues prioritized.',
      announcement: 'Deaf support enabled. Sound effects muted; visual guidance boosted.',
    },
    neurodiverse: {
      message: 'Games mode enabled. Have fun while learning!',
      announcement: 'Games mode enabled. Challenge yourself and have fun!',
    },
  }

  const carouselItems = [
    {
      badge: 'Dyslexia Boost',
      image: '/assets/dyslexia.svg',
      alt: 'Animated dyslexia-friendly book',
      caption: 'Color overlays keep letters steady and highlight syllables for confident reading.',
    },
    {
      badge: 'Deaf & HoH',
      image: '/assets/hearing.svg',
      alt: 'Animated ear with visual sound waves',
      caption: 'Animated visual cues pulse whenever ChatGPT replies so silent learners never miss guidance.',
    },
    {
      badge: 'Blind Explorer',
      image: '/assets/vision-panel.svg',
      alt: 'Child with visual impairment learning on a tablet',
      caption: 'Audio labels, tactile-friendly keyboards, and high-contrast lessons guide low-vision learners screen by screen.',
    },
    {
      badge: 'Dysgraphia Play',
      image: '/assets/dysgraphia.svg',
      alt: 'Animated pencil tracing letters',
      caption: 'Guided tracing paths animate slowly to coach handwriting, spacing, and motor planning.',
    },
    {
      badge: 'Neurodiverse Calm',
      image: '/assets/neurodiverse.svg',
      alt: 'Animated puzzle pieces for neurodiverse focus',
      caption: 'Soothing puzzle pulses model routines, breathing, and predictable patterns to reduce overwhelm.',
    },
  ]

  // Load stats from localStorage
  useEffect(() => {
    const loadStats = () => {
      try {
        const stored = localStorage.getItem('brightwords_stats')
        if (stored) {
          setStats(JSON.parse(stored))
        }
      } catch (error) {
        console.warn('Error loading stats:', error)
      }
    }
    loadStats()
  }, [])

  // Carousel auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSupportCategory = (category) => {
    setSelectedCategory(category)
    const profile = supportProfiles[category]
    if (profile) {
      announce(profile.announcement)
    }
  }

  const handleStartLearning = () => {
    const supportSection = document.getElementById('support')
    if (supportSection) {
      supportSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleWatchDemo = () => {
    // Open demo video or modal
    announce('Demo video feature coming soon')
  }

  return (
    <div className="home-page">
      <SkipLink />
      <div
        id="accessibilityAnnouncement"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      <div id="keyboardHint" className="sr-only">
        Use Tab to move between controls. Press Space or Enter to activate buttons.
      </div>

      {/* Background Decorations */}
      <div className="bg-decoration" aria-hidden="true">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="shape shape-circle"></div>
        <div className="shape shape-triangle"></div>
      </div>

      <div className="main-container">
        <Navigation onStartLearning={handleStartLearning} onOpenSettings={() => setShowSettings(true)} />

        <main id="mainContent" role="main" tabIndex={-1}>
          {/* Hero Section */}
          <section className="hero-section" id="home" aria-label="Welcome section">
            <div className="hero-content">
              <h1 className="hero-title">
                Reimagining learning for specially-abled children through AI-powered personalization.
              </h1>
              <p className="hero-description">
                Interactive games, multisensory activities, and real-time adaptive feedback come together to build confidence, accelerate growth, and create a supportive learning journey tailored to every child.
              </p>
              <ul className="hero-highlights" aria-label="Key benefits">
                <li>⚡ 5-minute missions</li>
                <li>🎯 Personalized boosts</li>
                <li>🧠 Neuro-inclusive fun</li>
              </ul>
              <div className="cta-buttons">
                <button
                  className="btn-primary"
                  onClick={handleStartLearning}
                  aria-label="Start learning journey"
                >
                  🚀 Start Learning
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleWatchDemo}
                  aria-label="Watch demo video"
                >
                  ▶️ Watch Demo
                </button>
              </div>
            </div>

            <div className="hero-visual" aria-label="Animated accessibility spotlights">
              <div
                className="motion-carousel"
                role="region"
                aria-label="Accessibility spotlights"
                aria-live="polite"
              >
                <div className="motion-gallery">
                  {carouselItems.map((item, index) => (
                    <figure
                      key={index}
                      className={`motion-card ${index === currentCarouselIndex ? 'active' : ''}`}
                      aria-hidden={index !== currentCarouselIndex}
                    >
                      <div className="motion-badge">{item.badge}</div>
                      <img src={item.image} alt={item.alt} className="motion-image" />
                      <figcaption>
                        <h4>{item.caption}</h4>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                <div className="motion-dots" role="tablist" aria-label="Select accessibility spotlight">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      role="tab"
                      aria-selected={index === currentCarouselIndex}
                      aria-label={`View ${carouselItems[index].badge}`}
                      className={`motion-dot ${index === currentCarouselIndex ? 'active' : ''}`}
                      onClick={() => setCurrentCarouselIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Accessibility Support Section */}
          <section
            className="accessibility-section"
            id="support"
            aria-label="Accessibility support selection"
          >
            <div className="section-header">
              <h2 className="section-title">Choose Your Support Needs</h2>
              <p className="section-subtitle">
                Pick a profile so we can tailor BrightWords for different accessibility needs.
              </p>
            </div>

            <div className="support-grid" role="group" aria-label="Support profile options">
              {Object.entries(supportProfiles).map(([key, profile]) => (
                <button
                  key={key}
                  className={`support-card ${selectedCategory === key ? 'active' : ''}`}
                  data-category={key}
                  onClick={() => handleSupportCategory(key)}
                  aria-pressed={selectedCategory === key}
                  aria-label={`Select ${key} support profile`}
                >
                  <div className="support-icon">
                    {key === 'general' && '🌈'}
                    {key === 'blind' && '🦮'}
                    {key === 'deaf' && '🪄'}
                    {key === 'neurodiverse' && '🧩'}
                  </div>
                  <div className="support-info">
                    <h3>
                      {key === 'general' && 'General Learner'}
                      {key === 'blind' && 'Blind / Low Vision'}
                      {key === 'deaf' && 'Deaf / Hard of Hearing'}
                      {key === 'neurodiverse' && 'Games'}
                    </h3>
                    <p>{profile.message}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="support-message" id="categoryMessage" aria-live="polite">
              {selectedCategory
                ? supportProfiles[selectedCategory].message
                : 'Please select a support profile above to get started.'}
            </div>

            <div className="support-feature-panel" id="supportFeaturePanel" aria-live="polite">
              <div className="support-widget" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h3 style={{ color: 'var(--primary-purple)', marginBottom: '16px' }}>
                  👆 Choose Your Support Profile
                </h3>
                <p style={{ color: 'var(--light-text)', fontSize: '15px', lineHeight: 1.6 }}>
                  Select a profile above to unlock personalized learning tools and features tailored to your needs!
                </p>
              </div>
            </div>
          </section>

          {/* Stats Dashboard */}
          <div className="stats-container" id="progress" role="region" aria-label="Learner statistics">
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">⭐</div>
              <div className="stat-value">{stats.totalPoints}</div>
              <div className="stat-label">Total Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">📚</div>
              <div className="stat-value">{stats.lessonsComplete}</div>
              <div className="stat-label">Lessons Complete</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">🏆</div>
              <div className="stat-value">{stats.achievements}</div>
              <div className="stat-label">Achievements</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">⏱️</div>
              <div className="stat-value">{stats.timeSpent}m</div>
              <div className="stat-label">Time Today</div>
            </div>
          </div>
        </main>

        <footer className="site-footer" role="contentinfo" aria-label="Site footer">
          <div className="queries-section" style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.08)', width: '100%', maxWidth: '600px', display: 'block' }}>
            <h3 className="queries-title" style={{ fontFamily: "'Fredoka', cursive", fontSize: '20px', fontWeight: 600, color: '#8B5CF6', marginBottom: '16px', textAlign: 'center', display: 'block' }}>For Any Queries</h3>
            <div className="social-icons" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap', width: '100%' }}>
              <a 
                href="https://mail.google.com/mail/u/1/#inbox" 
                className="social-icon gmail-icon"
                aria-label="Contact us via Gmail"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', cursor: 'pointer', visibility: 'visible', opacity: 1 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.546l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/brightwords.in/" 
                className="social-icon instagram-icon"
                aria-label="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', cursor: 'pointer', visibility: 'visible', opacity: 1 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="#E4405F"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61584591965509" 
                className="social-icon facebook-icon"
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', cursor: 'pointer', visibility: 'visible', opacity: 1 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
              </a>
            </div>
          </div>
          <p>BrightWords • Inclusive learning for every child.</p>
          <p>All Rights Reserved</p>
        </footer>
      </div>
    </div>
  )
}

export default Home


