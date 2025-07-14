# VibeDump - Digital Platform for Emotional Expression

VibeDump is a comprehensive mental health platform that provides a safe space for emotional expression and community-based healing. The platform combines AI-powered support, anonymous communities, and curated mental health resources.

## Features

### 🤖 AI Venting Companion
- 24/7 empathetic AI chat support
- Voice-to-text input for hands-free interaction
- Sentiment analysis and crisis detection
- Personalized responses based on emotional state
- Crisis resource provision when needed

### 👥 Anonymous Support Communities
- Topic-focused support groups
- Anonymous posting and commenting
- Upvoting/downvoting system
- Community moderation tools

### 📚 Mental Health Blog Hub
- Curated articles from mental health experts
- Real-time blog scraping from external sources
- Categorized content for easy navigation
- Reading time estimates and tags

## Tech Stack

- **Frontend**: Next.js 13 with App Router, Tailwind CSS
- **Backend**: Node.js API routes with Next.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **Web Scraping**: Cheerio for blog content
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibedump.git
cd vibedump
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: Your OpenAI API key

4. Set up the database:
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/` in your Supabase SQL editor
   - The migrations will create all necessary tables and security policies

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Tables

- **users**: Extended user profiles (linked to Supabase auth)
- **communities**: Support group communities
- **posts**: Community posts
- **comments**: Post comments
- **votes**: Upvotes/downvotes for posts and comments
- **chat_sessions**: AI companion chat history

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data where appropriate
- Anonymous posting in communities while maintaining user association
- Secure AI chat history storage

## API Routes

### AI Companion
- `POST /api/ai/chat` - Send message to AI companion
- Includes sentiment analysis and crisis detection
- Returns empathetic responses and crisis resources when needed

### Blog Scraping
- `GET /api/blogs` - Fetch blog post listings
- `GET /api/blogs/[id]` - Fetch individual blog article
- Real-time scraping from external sources

## Features in Detail

### AI Companion
- Uses OpenAI GPT-3.5 Turbo for conversational AI
- Voice-to-text input using Web Speech API
- Includes system prompts for empathetic responses
- Sentiment analysis for message classification
- Crisis keyword detection with immediate resource provision
- Chat history persistence in Supabase

### Communities
- Anonymous posting while maintaining user association
- Topic-focused communities for specific mental health areas
- Voting system for community-driven content curation
- Real-time comment threads

### Blog Hub
- Dynamic content scraping from external mental health blogs
- Categorized articles with reading time estimates
- Search functionality across all articles
- Responsive design for all device types

## Security Features

- Row Level Security on all database tables
- User authentication through Supabase Auth
- Anonymous community participation
- Crisis detection and resource provision
- Secure API key management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Crisis Resources

If you're in crisis, please reach out immediately:
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Mental health professionals who inspired this platform
- Open source community for excellent tools and libraries
- Supabase for providing an excellent backend platform
- OpenAI for AI capabilities that enable empathetic responses

## Support

If you need help with the platform or have questions, please:
1. Check the documentation
2. Open an issue on GitHub
3. Contact the development team

Remember: This platform is meant to supplement, not replace, professional mental health care. Please seek professional help when needed.