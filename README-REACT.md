# BrightWords React App Setup

This React application groups the BrightWords and SuperPower pages using React Router.

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

To run the app on port 9000:
```bash
npm run start
```

Or:
```bash
npm run dev
```

The app will be available at `http://localhost:9000`

## Routes

- `/` - BrightWords page
- `/superpower` - SuperPower (AWS AugmentAbility) page

## Project Structure

```
├── src/
│   ├── pages/
│   │   ├── BrightWords.jsx    # BrightWords page component
│   │   └── SuperPower.jsx     # SuperPower page component
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index-react.html           # React app HTML template
├── index.html                 # Original BrightWords page
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies
```

## Notes

- The React app uses React Router for client-side routing
- Original HTML files are preserved and accessible
- Navigation between pages uses React Router's Link component

