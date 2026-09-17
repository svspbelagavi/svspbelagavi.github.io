# SVSP — Swami Vivekanand Seva Pratishthan

Official website for Swami Vivekanand Seva Pratishthan (SVSP), built with React, Vite, TypeScript, and Firebase.

## Tech Stack

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Backend/Services:** Firebase
- **Deployment:** GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd svsp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Firebase configuration keys:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Build for Production

```bash
npm run build
```

### Deployment

The site is deployed to GitHub Pages:
```bash
npm run deploy
```

## Project Structure

```
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── firebase/       # Firebase config and helpers
│   └── ...
├── public/
├── .env.local           # Local environment variables (not committed)
└── vite.config.ts
```

## Features

- Donation module
- Admin dashboard (protected routes)
- Responsive design with animations
- SEO-optimized meta configuration

## License

Internal project for Swami Vivekanand Seva Pratishthan. All rights reserved.
