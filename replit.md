# Turbo Answer - Advanced AI Assistant

## Overview
Turbo Answer is a fully self-hosted AI assistant application built with a React (TypeScript) frontend and an Express.js (TypeScript) backend. It features a completely local AI engine with zero external API dependencies, providing comprehensive knowledge across technical programming, science, and general domains. The application boasts a sleek, modern interface, ultra-fast local AI responses (~100ms), and mobile app capability via Capacitor for Android APK generation. The project aims to deliver a powerful, independent, and high-performance AI solution.

## User Preferences
Preferred communication style: Simple, everyday language.
Design preference: Clean, modern interface with professional dark theme - completely redesigned from scratch with minimal, fast UI.
Layout preference: Bigger layout showing all options in one screen for better accessibility.
Stability preference: App must be completely stable with NO moving elements, animations, or transitions. Settings must always be visible.
Intelligence preference: AI should give simple, clear, direct answers without complex explanations. For simple questions, keep responses short and conversational.
Interface priority: Ensure settings buttons are always accessible and never blocked by app movement.
Performance priority: AI responses must be ULTRA-FAST - fully self-hosted local AI engine for instant responses (~100ms). NO external API calls. NO LAG ALLOWED. Zero network latency with local processing.
Self-hosted preference: User explicitly wants NO external API dependencies. All AI runs locally on the server with built-in knowledge base, math engine, and code examples.
Power preference: Enhanced logo, loading screen, and maximum power branding throughout the interface.
Voice preference: Voice assistant called "Turbo" with optional wake word detection (disabled by default for performance).
Subscription preference: Lifetime free premium access through promo code system for creator access.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Local authentication with session management
- **Mobile Integration**: Capacitor for Android APK generation
- **UI/UX Decisions**: Pure black (#000000) interface, mobile-first optimization, zero animations/transitions for stability, clean Inter font.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Style**: RESTful API endpoints
- **AI Integration**: Fully self-hosted local AI engine (no external API dependencies)
- **Authentication**: Session-based authentication with PostgreSQL storage
- **Middleware**: Express JSON parsing, custom logging middleware

### Database Strategy
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Current Storage**: In-memory storage for development
- **Production Storage**: PostgreSQL
- **Migration Strategy**: Drizzle Kit

### Key Features & Design Decisions
- **Local AI Engine**: Built-in math engine, knowledge base (geography, science, history), code examples (Python, JS, Java, C++, Go, Rust, TS), conversational AI, and unit conversions. Zero external dependencies.
- **Database Schema**: Manages users (with subscription, employee, ban/flag/suspension statuses), conversations, messages, and audit logs for employee actions.
- **Promo Code System**: Supports `LIFETIME_FREE`, `FOUNDER_ACCESS`, `PREMIUM_YEAR` for subscription upgrades.
- **MEGA FUSION AI System**: A multi-model fusion combining 20+ AI systems (Gemini 2.0 Flash Thinking, Claude 3.5 Sonnet, GPT-4o, Perplexity Sonar Huge, xAI Grok-2 Vision, Llama 3.1 405B, DeepSeek V3, Mistral Large 2, Cohere Command R+, Qwen 2.5 72B, etc.) for ultimate intelligence and adaptive performance, routing intelligently based on query complexity.
- **Emotional AI**: Advanced emotion detection, empathetic responses, conversation memory, and adaptive empathy.
- **Comprehensive Knowledge Coverage**: Technical, scientific, creative, professional applications, and world time zone intelligence.
- **API Endpoints**: Comprehensive set for user authentication, conversation management, message exchange, document analysis, weather/location data, subscription management, promo code application, and a robust employee management system (ban, flag, suspend users, audit logs).
- **Frontend Pages**: Chat, Register, Login, Pricing, Subscribe, Support, Employee Login, Employee Dashboard, 404.
- **Voice Command Features**: Speech recognition (Web Speech API), "Turbo" voice assistant, optional "Hey Turbo" wake word, auto-send, text-to-speech, interactive controls. (Note: Voice call service, hands-free mode, and continuous conversation mode were removed for simplification and stability).
- **Embeddable AI Widget System**: A self-contained JavaScript widget (`turbo-answer-widget.js`) for integration into any website, offering full AI chat capabilities.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-\*\*\***: Accessible UI primitives
- **drizzle-orm**: Database ORM and query builder
- **@google/generative-ai**: Official Google Gemini AI SDK
- **stripe**: Stripe payment processing SDK
- **@stripe/react-stripe-js**: React Stripe.js integration
- **@stripe/stripe-js**: Stripe.js client library
- **tailwindcss**: Utility-first CSS framework
- **@capacitor/core**: Native mobile app wrapper
- **@capacitor/android**: Android platform support

### AI Provider Keys (Configured via Environment Variables)
- `GEMINI_API_KEY`: For Google AI services (primary AI provider)
- `OPENAI_API_KEY`: For GPT models (secondary - quota exceeded, primarily for image generation)
- `ANTHROPIC_API_KEY`: For Claude models (optional)
- OpenMeteo API for weather data (no API key required)