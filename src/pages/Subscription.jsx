import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAnnouncement } from '../hooks/useAnnouncement'
import '../styles/Subscription.css'

const RAZORPAY_KEY_ID = 'rzp_test_Rneu0aaeOPlIHD'
const API_BASE_URL = 'http://localhost:3000/api'

const Subscription = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const announce = useAnnouncement()
  const [selectedPlan, setSelectedPlan] = useState('yearly')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const plans = {
    monthly: {
      name: 'Monthly Plan',
      amount: 29900,
      currency: 'INR',
      duration: 'monthly',
      description: 'Monthly subscription to Sign Language Learning',
    },
    yearly: {
      name: 'Yearly Plan',
      amount: 299900,
      currency: 'INR',
      duration: 'yearly',
      description: 'Yearly subscription to Sign Language Learning',
    },
  }

  useEffect(() => {
    // Check if already subscribed
    const subscription = getSubscriptionStatus()
    if (subscription && subscription.status === 'active' && new Date(subscription.endDate) > new Date()) {
      navigate('/sign-language')
    }

    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [navigate])

  const getSubscriptionStatus = () => {
    try {
      const stored = localStorage.getItem('sign_language_subscription')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
    }
    return null
  }

  const getUserInfo = () => {
    if (currentUser) {
      return {
        email: currentUser.email,
        name: currentUser.name || currentUser.given_name || '',
        given_name: currentUser.given_name,
        picture: currentUser.picture,
      }
    }
    return null
  }

  const selectPlan = (planType) => {
    setSelectedPlan(planType)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const initiatePayment = async (planType) => {
    const plan = plans[planType]
    if (!plan) {
      setErrorMessage('Invalid plan selected')
      return
    }

    const user = getUserInfo()
    if (!user) {
      setErrorMessage('Please login first')
      navigate('/login', { replace: true })
      return
    }

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Health check
      try {
        const healthCheck = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        })
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding properly')
        }
      } catch (healthError) {
        throw new Error(
          'Cannot connect to backend server. Please make sure the server is running on http://localhost:3000.'
        )
      }

      // Create order
      const orderResponse = await fetch(`${API_BASE_URL}/subscription/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planType,
          amount: plan.amount,
          currency: plan.currency,
          userEmail: user.email,
          userName: user.name || user.given_name || 'User',
        }),
        signal: AbortSignal.timeout(10000),
      })

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText || 'Server error' }
        }
        throw new Error(errorData.error || errorData.details || `Server error: ${orderResponse.status}`)
      }

      const orderData = await orderResponse.json()

      if (!orderData.orderId) {
        throw new Error(orderData.error || 'Failed to create order: No order ID received')
      }

      // Initialize Razorpay
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded. Please check your internet connection and refresh the page.')
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: plan.amount,
        currency: plan.currency,
        name: 'BrightWords',
        description: plan.description,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: '',
        },
        theme: { color: '#8B5CF6' },
        handler: (response) => handlePaymentSuccess(response, planType),
        modal: {
          ondismiss: () => {
            setLoading(false)
            setErrorMessage('Payment was cancelled')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (response) => {
        setLoading(false)
        setErrorMessage('Payment failed: ' + (response.error.description || response.error.reason || 'Unknown error'))
      })
      razorpay.open()
    } catch (error) {
      console.error('Payment initiation error:', error)
      let errorMsg = ''
      if (error.message === 'Failed to fetch' || error.message.includes('network')) {
        errorMsg =
          'Backend Server Not Running! Please make sure the server is running on http://localhost:3000. Check the terminal/console where you started the backend server.'
      } else {
        errorMsg = 'Error: ' + error.message
      }
      setErrorMessage(errorMsg)
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (response, planType) => {
    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/subscription/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          plan: planType,
          userEmail: getUserInfo().email,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Payment verification failed')
      }

      saveSubscriptionStatus(planType, verifyData.subscription)
      setSuccessMessage('Payment successful! Your subscription is now active. Redirecting...')
      announce('Payment successful! Subscription activated.')
      setTimeout(() => navigate('/sign-language'), 2000)
    } catch (error) {
      console.error('Payment verification error:', error)
      setErrorMessage('Payment verification failed. Please contact support.')
      setLoading(false)
    }
  }

  const saveSubscriptionStatus = (planType, subscriptionData) => {
    const subscription = {
      plan: planType,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: calculateEndDate(planType),
      ...subscriptionData,
    }
    localStorage.setItem('sign_language_subscription', JSON.stringify(subscription))
  }

  const calculateEndDate = (planType) => {
    const endDate = new Date()
    if (planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (planType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }
    return endDate.toISOString()
  }

  return (
    <div className="subscription-page" role="main">
      <div className="subscription-container">
        <div className="subscription-header">
          <h1>🤟 Unlock Sign Language Learning</h1>
          <p>Choose a plan to access premium sign language features</p>
        </div>

        {successMessage && (
          <div className="success-message" role="alert" aria-live="polite">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="error-message" role="alert" aria-live="assertive">
            {errorMessage.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < errorMessage.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="plans-grid" role="group" aria-label="Subscription plans">
          <div
            className={`plan-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}
            data-plan="monthly"
            role="option"
            aria-selected={selectedPlan === 'monthly'}
          >
            <div className="plan-name">Monthly Plan</div>
            <div className="plan-price">
              ₹299<span>/month</span>
            </div>
            <div className="plan-period">Billed monthly</div>
            <ul className="plan-features" role="list">
              <li>Unlimited sign language conversions</li>
              <li>Access to all 3D avatar animations</li>
              <li>Learn sign language alphabets & words</li>
              <li>Create sign language videos</li>
              <li>Priority support</li>
            </ul>
            <button
              className="subscribe-button"
              onClick={() => {
                selectPlan('monthly')
                initiatePayment('monthly')
              }}
              disabled={loading}
              aria-label="Subscribe to monthly plan"
            >
              {loading && selectedPlan === 'monthly' ? (
                <>
                  <span className="loading-spinner"></span> Processing...
                </>
              ) : (
                'Subscribe Monthly'
              )}
            </button>
          </div>

          <div
            className={`plan-card popular ${selectedPlan === 'yearly' ? 'selected' : ''}`}
            data-plan="yearly"
            role="option"
            aria-selected={selectedPlan === 'yearly'}
          >
            <div className="plan-name">Yearly Plan</div>
            <div className="plan-price">
              ₹2,999<span>/year</span>
            </div>
            <div className="plan-period">Save 16% - Billed annually</div>
            <ul className="plan-features" role="list">
              <li>Everything in Monthly Plan</li>
              <li>Save ₹589 compared to monthly</li>
              <li>Best value for long-term learning</li>
              <li>Early access to new features</li>
              <li>24/7 priority support</li>
            </ul>
            <button
              className="subscribe-button"
              onClick={() => {
                selectPlan('yearly')
                initiatePayment('yearly')
              }}
              disabled={loading}
              aria-label="Subscribe to yearly plan"
            >
              {loading && selectedPlan === 'yearly' ? (
                <>
                  <span className="loading-spinner"></span> Processing...
                </>
              ) : (
                'Subscribe Yearly'
              )}
            </button>
          </div>
        </div>

        <div className="back-link">
          <Link to="/" aria-label="Back to home page">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Subscription


