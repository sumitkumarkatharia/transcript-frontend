// README.md

# Fireflies AI Clone - Frontend

A modern Next.js TypeScript frontend for the Fireflies AI Clone application.

## Features

- **Authentication**: Login/Register with JWT tokens
- **Dashboard**: Overview of meetings and statistics
- **Meeting Management**: Create, join, and manage meetings
- **Real-time Transcription**: Live meeting transcription
- **Search**: Full-text and semantic search capabilities
- **Analytics**: Meeting insights and statistics
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT with automatic refresh

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Update the variables:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_WS_URL=ws://localhost:3000
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3001`

## Project Structure

```
├── app/                    # Next.js 13+ App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── meetings/          # Meeting pages
│   ├── search/            # Search functionality
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── Layout/           # Layout components
│   ├── UI/               # UI components
│   └── Forms/            # Form components
├── contexts/             # React contexts
├── services/             # API services
├── hooks/                # Custom hooks
├── types/                # TypeScript types
└── utils/                # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features to Implement

### Core Features ✅

- [x] Authentication (Login/Register)
- [x] Dashboard with statistics
- [x] Meeting management
- [x] Search functionality
- [x] Responsive design

### Advanced Features 🚧

- [ ] Real-time meeting transcription
- [ ] Meeting recordings playback
- [ ] Analytics dashboard
- [ ] Settings management
- [ ] Team collaboration
- [ ] Integration management

## API Integration

The frontend integrates with your NestJS backend through:

- **Authentication Service**: JWT-based auth with auto-refresh
- **Meetings Service**: Full meeting lifecycle management
- **Search Service**: Full-text and semantic search
- **Real-time Updates**: WebSocket integration for live updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

This project is licensed under the MIT License.
