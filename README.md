# 🌭 AI HOTDOG DETECTOR 2.0

A fun and interactive web application that uses AI to determine if an uploaded image contains a hotdog or not, complete with dramatic storytelling and achievements!

## Features

- 🤖 AI-powered hotdog detection using Google Vision API
- 📝 Dynamic story generation for each detection using OpenAI
- 🎯 User achievements and progression system
- 🔐 Secure authentication with email and Google sign-in
- 📊 User profile with detection history and statistics
- 🖼️ Image upload and storage capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **AI Services**: 
  - Google Cloud Vision API for image detection
  - OpenAI for story generation
- **UI Components**: shadcn/ui

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hotdog-detector.git
   cd hotdog-detector

2. **Install dependencies**
    ```bash
    npm install
    ```

3. Set up environmental varaibles create a .env.local file with:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    GOOGLE_APPLICATION_CREDENTIALS_JSON=your_google_credentials
    OPENAI_API_KEY=your_openai_key
    ```

4. Run the development server
    ```bash
    npm run dev
    ```


Project Structure:
```bash
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── detect/            # Hotdog detection page
│   └── profile/           # User profile page
├── components/            # Reusable components
├── lib/                   # Utility functions and configs
└── context/              # React context providers
```

# Features in Detail
    - Authentication
    - Email/Password registration and login
    - Google OAuth integration
    - Secure session management

# Profile System
    - User statistics tracking
    - Achievement system
    - Detection history with stories

# Hotdog Detection
    - Image upload and validation
    - AI-powered detection
    - Dynamic story generation
    - Real-time results

