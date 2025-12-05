import React, { useEffect, useRef } from 'react'

function SuperPower() {
  const iframeRef = useRef(null)

  useEffect(() => {
    // Load the AWS Cognito Hosted UI directly in an iframe
    if (iframeRef.current) {
      iframeRef.current.src = 'https://56hp9p2g0mto0006dtg7vv5fac.auth.eu-west-1.amazoncognito.com/login?client_id=56hp9p2g0mto0006dtg7vv5fac&redirect_uri=http%3A%2F%2Flocalhost%3A8001%2Faws-augmentability-main%2Findex-landing.html&response_type=code&scope=email%20openid'
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', border: 'none', padding: 0, margin: 0, overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="SuperPower - AWS AugmentAbility"
        allow="camera; microphone"
      />
    </div>
  )
}

export default SuperPower
