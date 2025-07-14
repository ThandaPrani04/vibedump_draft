# VibeDump - Local Development Setup

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Git**

## Step 1: Clone and Install Dependencies

```bash
# If you haven't already, clone the repository
git clone <your-repo-url>
cd vibedump

# Install dependencies
npm install
```

## Step 2: Environment Variables Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your API keys:

```env
# Supabase Configuration (Already provided in .env.example)
NEXT_PUBLIC_SUPABASE_URL=https://yfjiuxffasekjgzcjdde.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmaml1eGZmYXNla2pnemNqZGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTkzNTIsImV4cCI6MjA2NzgzNTM1Mn0.4oZBAtiRHOueuFflFebXUH_A7bX2DtyUqPP25UiWd4E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmaml1eGZmYXNla2pnemNqZGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1OTM1MiwiZXhwIjoyMDY3ODM1MzUyfQ.LRgFFFadCmDZcu_KHdcH_Okb0nyJhw68aNcObdAQftk

# Google Generative AI Configuration (YOU NEED TO ADD THIS)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Hugging Face API Configuration (YOU NEED TO ADD THIS)
HUGGINGFACE_API_KEY=your_actual_huggingface_api_key_here

# MongoDB Configuration (YOU NEED TO ADD THIS)
MONGODB_URI=your_mongodb_connection_string_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Step 3: Get Required API Keys

### 3.1 Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy the key and add it to your `.env` file as `GEMINI_API_KEY`

### 3.2 Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account
3. Go to Settings > Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token and add it to your `.env` file as `HUGGINGFACE_API_KEY`

### 3.3 MongoDB Database

**Option A: MongoDB Atlas (Recommended for beginners)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Add it to your `.env` file as `MONGODB_URI`

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/mindfulchat`

### 3.4 NextAuth Secret (Optional but recommended)
```bash
# Generate a random secret
openssl rand -base64 32
```
Add the generated string to your `.env` file as `NEXTAUTH_SECRET`

## Step 4: Database Setup

The Supabase database is already configured with the provided credentials. The migrations should already be applied. If you need to verify:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if the tables exist: `users`, `communities`, `posts`, `comments`, `votes`, `chat_sessions`

## Step 5: Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Step 6: Test the Application

1. **Homepage**: Visit http://localhost:3000
2. **Sign Up**: Create a new account
3. **AI Companion**: Test the chat functionality
4. **Communities**: Browse and create posts
5. **Blogs**: Check the blog scraping functionality

## Troubleshooting

### Common Issues:

**1. MongoDB Connection Error**
- Verify your `MONGODB_URI` is correct
- Check if MongoDB service is running (if using local)
- Ensure network access is allowed (if using Atlas)

**2. Gemini API Error**
- Verify your `GEMINI_API_KEY` is correct
- Check if you have API quota remaining
- Ensure the API key has proper permissions

**3. Supabase Connection Error**
- The provided credentials should work
- Check your internet connection
- Verify the Supabase project is active

**4. Build Errors**
- Run `npm install` again
- Clear Next.js cache: `rm -rf .next`
- Check Node.js version (should be 18+)

### Environment Variables Check

Create a simple test to verify your environment variables:

```bash
# Check if environment variables are loaded
node -e "console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing')"
node -e "console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing')"
```

## Features Available Locally

✅ **User Authentication** (Supabase Auth)  
✅ **AI Companion Chat** (Google Gemini)  
✅ **Voice-to-Text** (Web Speech API)  
✅ **Support Communities** (Supabase Database)  
✅ **Blog Hub** (Web Scraping)  
✅ **Chat History** (MongoDB)  
✅ **Crisis Detection** (AI-powered)  
✅ **Content Moderation** (Hugging Face Toxic-BERT)  

## Development Tips

1. **Hot Reload**: Changes to code will automatically refresh the browser
2. **API Testing**: Use tools like Postman to test API endpoints
3. **Database Inspection**: Use MongoDB Compass or Supabase dashboard
4. **Logs**: Check the terminal for error messages and logs
5. **Voice Feature**: Works best in Chrome, Edge, or Safari browsers
6. **HTTPS**: Voice recognition requires HTTPS in production (works on localhost)

## Production Deployment

When ready to deploy:
1. Update environment variables for production
2. Use `npm run build` to create production build
3. Deploy to platforms like Vercel, Netlify, or your preferred hosting
4. **Important**: Voice-to-text requires HTTPS in production
5. Ensure all API keys are properly configured

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all required services (MongoDB, Supabase) are accessible
4. Check the GitHub issues for similar problems
5. **Voice Issues**: Ensure you're using a supported browser (Chrome/Edge/Safari)
6. **Microphone**: Grant microphone permissions when prompted

Happy coding! 🚀