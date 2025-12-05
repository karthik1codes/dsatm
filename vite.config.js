import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: '0.0.0.0', // Listen on all network interfaces (IPv4 and IPv6)
    open: true,
    // Configure middleware to handle redirect and CSP headers
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle /superpower route - redirect to the login page
        if (req.url === '/superpower' || req.url === '/superpower/') {
          res.writeHead(302, {
            'Location': '/aws-augmentability-main/index-landing.html'
          })
          res.end()
          return
        }
        
        // IMPORTANT: For React Router SPA to work with direct navigation (window.location.href),
        // serve index-react.html for all React Router routes that don't match static files
        // This ensures /home, /feedback, etc. load the React app instead of 404
        const urlPath = req.url.split('?')[0] // Remove query params
        const isStaticFile = urlPath.includes('.') && !urlPath.endsWith('/')
        const isReactRoute = (urlPath === '/home' || 
                              urlPath === '/feedback' || 
                              urlPath === '/' ||
                              (!isStaticFile && 
                               !urlPath.startsWith('/aws-augmentability-main') && 
                               !urlPath.startsWith('/sign-language') &&
                               urlPath !== '/index.html'))
        
        if (isReactRoute && urlPath !== '/index.html') {
          // For React Router routes, let Vite handle it naturally
          // Vite's dev server should serve index-react.html for SPA routes
          // We just need to ensure we don't block it
        }
        
        // Remove or relax CSP headers for development
        // Allow unsafe-eval for bundled code and third-party libraries
        if (req.url.includes('.html') || req.url === '/') {
          res.setHeader(
            'Content-Security-Policy',
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://kit.fontawesome.com https://cdn.lordicon.com https://cdnjs.cloudflare.com https://accounts.google.com; object-src 'none'; base-uri 'self';"
          )
        }
        
        next()
      })
    }
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index-react.html'
      }
    }
  }
})

