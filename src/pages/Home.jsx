import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import SkipLink from '../components/SkipLink'
import { useAccessibility } from '../context/AccessibilityContext'
import { useAuth } from '../hooks/useAuth'
import { useAnnouncement } from '../hooks/useAnnouncement'
import '../styles/Home.css'

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
                BrightWords makes learning feel bold, fast, and joyful.
              </h1>
              <p className="hero-description">
                AI-powered personalized learning support for Children who are specially abled. Build confidence through interactive games, multisensory activities, and real-time feedback!
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
          <p>BrightWords • Inclusive learning for every child.</p>
          <p>All Rights Reserved</p>
        </footer>
      </div>
    </div>
  )
}

export default Home


