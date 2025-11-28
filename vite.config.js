import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    open: true,
    // Configure middleware to handle redirect and CSP headers
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle /superpower route - redirect to the login page
        if (req.url === '/superpower' || req.url === '/superpower/') {
          res.writeHead(302, {
            'Location': '/aws-augmentability-main/index.html'
          })
          res.end()
          return
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

