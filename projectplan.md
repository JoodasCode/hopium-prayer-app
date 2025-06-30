# Hopium Prayer App Project Plan

## Executive Summary

The Hopium Prayer App is a Progressive Web Application (PWA) designed to help Muslims track and enhance their prayer experience through emotional design, community features, and personalized guidance. The app incorporates Lopi, an AI assistant that provides spiritual guidance and personalized support.

This document outlines a comprehensive development plan, technical specifications, and detailed implementation strategies.

## Core Vision

To create a beautiful, engaging prayer tracking experience that combines:

- Emotional design principles for spiritual connection
- Cutting-edge PWA technologies for performance and accessibility
- AI-powered personalization through the Lopi assistant
- Community features that respect privacy while fostering connection
## Technical Stack

### Frontend
- **Framework**: Next.js 14 (App Router) ✅
- **Language**: TypeScript ✅
- **Styling**: Tailwind CSS ✅
- **Component Library**: Shadcn/UI ✅
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Form Handling**: React Hook Form + Zod

### PWA Technologies
- **Service Workers**: Workbox
- **Storage**: IndexedDB (via Dexie.js)
- **Offline Sync**: Background Sync API
- **Notifications**: Web Push API
- **Installation**: Web App Manifest

### AI/LLM
- **Provider Options**: 
  - OpenAI API (GPT-4o)
  - Anthropic Claude
  - Open-source model (Llama 3)
- **Context Management**: LangChain.js
- **Memory**: Vector database (Pinecone or Supabase pgvector)
- **Processing**: Edge Functions

### Backend Options
- **Serverless**: Vercel/Netlify Functions
- **Database**: Supabase or Firebase
- **Authentication**: Auth.js (NextAuth)
- **Caching**: Upstash Redis
- **Storage**: Vercel Blob or Supabase Storage

### DevOps
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel/Netlify
- **Testing**: 
  - Playwright (E2E)
  - Vitest (Unit)
  - React Testing Library
- **Analytics**: Vercel Analytics + Custom Events
## Detailed Development Timeline

### Phase 1: Foundation & Setup (Weeks 1-2)

#### Week 1: Project Setup & Architecture

##### Day 1-2: Initial Setup ✅
- Create Next.js 14 project with TypeScript configuration ✅
- Set up Tailwind CSS with custom theme variables ✅
- Initialize Git repository with branching strategy ✅
  - `main` - production code ✅
  - `staging` - pre-production testing
  - `develop` - development branch
  - Feature branches for individual components
- Configure ESLint and Prettier following Airbnb Style Guide ✅

##### Day 3-4: PWA Foundation ✅
- Create Web App Manifest with icons and theme colors ✅
- Set up basic service worker with Workbox ✅
- Configure offline fallback page ✅
- Implement installation prompt with deferral option ✅

##### Day 5: Project Structure
- Organize directory structure:
```
src/
  app/           # Next.js App Router pages
  components/    # Reusable UI components
    ui/          # Shadcn components
    features/    # Feature-specific components
  lib/           # Utility functions and services
  hooks/         # Custom React hooks
  store/         # Zustand state stores
  styles/        # Global styles and Tailwind config
  types/         # TypeScript type definitions
  api/           # API routes and handlers
  ai/            # Lopi AI implementation
public/          # Static assets
```

#### Week 2: Core UI Components & Design System

##### Day 1-2: Design System ✅
- Set up design tokens for colors, typography, spacing ✅
- Create theme configuration with dark/light mode ✅
- Build animation utility functions for micro-interactions
- Import and configure initial Shadcn/UI components: ✅
  - Button ✅
  - Card ✅
  - Dialog ✅
  - Form components ✅
  - Progress ✅

##### Day 3-4: Layout Components ✅
- Create responsive layout components ✅
- Build navigation system with bottom bar for mobile ✅
- Implement page transitions with Framer Motion
- Set up responsive breakpoints and container queries ✅

##### Day 5: Design Documentation
- Document component usage patterns
- Create Storybook-style examples for key components
- Establish animation guidelines for consistency

### Phase 2: Core Prayer Functionality (Weeks 3-5)

#### Week 3: Prayer Tracking Foundation

##### Day 1-2: Prayer Time Calculation
- Implement prayer time calculation service
- Integrate Adhan.js library for accurate calculations
- Create location detection with permission handling
- Build prayer time adjustment options for different madhabs

##### Day 3-4: Prayer Dashboard
- Build prayer dashboard with:
  - Prayer time cards using Shadcn Card
  - Prayer completion rings with Progress component
  - Next prayer countdown with animated indicator
  - Daily overview with completion status

##### Day 5: Local Storage
- Implement IndexedDB storage with Dexie.js
- Create data models for prayers and user preferences
- Build offline-first data access patterns

#### Week 4: User Authentication & Profiles

##### Day 1-2: Authentication
- Set up Auth.js (NextAuth) with multiple providers
  - Email/Password
  - Google
  - Apple
- Create authentication flows with proper error handling
- Implement secure token management

##### Day 3-4: User Profiles
- Build profile management screens
  - Personal information
  - Prayer preferences
  - Notification settings
- Create avatar selection/upload functionality
- Implement account linking options

##### Day 5: Data Synchronization
- Build sync service for prayer data
- Implement conflict resolution strategies
- Create background sync for offline changes

#### Week 5: Prayer Analytics & Insights

##### Day 1-2: Streak Tracking
- Build prayer streak calculation system
- Create streak visualization components
- Implement streak recovery mechanics
- Add streak milestone celebrations

##### Day 3-4: Insights Dashboard
- Create analytics dashboard with:
  - Weekly/monthly prayer completion charts
  - Focus level trends
  - Prayer time consistency analysis
  - Personal records and achievements

##### Day 5: Achievement System
- Design achievement framework
- Implement achievement triggers and tracking
- Create achievement notification system
- Build achievement display UI with animations
### Phase 3: Lopi AI Assistant Integration (Weeks 6-8)

#### Week 6: Lopi Backend Setup

##### Day 1: LLM Provider Selection & Setup
- Evaluate and select LLM provider based on:
  - Performance requirements
  - Cost considerations
  - Privacy features
  - Availability of fine-tuning
- Set up API integration with selected provider

##### Day 2-3: Serverless Functions
- Create Edge Functions for AI processing
- Implement rate limiting and usage tracking
- Set up error handling and fallbacks
- Create caching layer for common responses

##### Day 4-5: Prompt Engineering System
- Design core prompt templates for:
  - General spiritual guidance
  - Prayer-specific advice
  - Educational content
  - Motivational support
- Create prompt construction pipeline with:
  - User context injection
  - Safety filters
  - Response formatting

#### Week 7: Lopi Chat Interface

##### Day 1-2: Chat Component Implementation
- Customize Shadcn's Chat component:
  - Implement Hopium design language
  - Create custom message bubbles
  - Add support for rich content (images, cards)
  - Build typing indicators and loading states

##### Day 3: Conversation History
- Implement conversation storage and retrieval
- Create conversation summarization for context windows
- Build conversation export functionality
- Implement privacy controls for conversation data

##### Day 4-5: Voice & Accessibility
- Add speech-to-text input option
- Implement text-to-speech for Lopi responses
- Ensure keyboard navigation for all chat functions
- Create accessibility features for screen readers

#### Week 8: Lopi Intelligence & Personalization

##### Day 1-2: Data Integration
- Connect Lopi to user prayer data
- Implement permission system for data access
- Create data transformation for context injection
- Build personalization pipeline

##### Day 3-4: Specialized Capabilities
- Implement domain-specific features:
  - Prayer guidance with step-by-step instructions
  - Streak motivation with personalized encouragement
  - Educational content explanation
  - Qibla direction assistance

##### Day 5: Memory System
- Implement conversation memory with vector storage
- Create long-term user preference learning
- Build cross-session context maintenance
- Implement memory pruning for privacy

### Phase 4: Community & Social Features (Weeks 9-10)

#### Week 9: Community Infrastructure

##### Day 1-2: Friend Connections
- Build friend request system
- Implement privacy-focused profile sharing
- Create friend discovery mechanisms
- Add blocking and reporting functionality

##### Day 3-4: Community Challenges
- Design challenge framework
- Implement challenge creation and joining
- Build progress tracking for challenges
- Create challenge completion celebrations

##### Day 5: Leaderboards
- Implement privacy-respecting leaderboards
- Create opt-in participation controls
- Build leaderboard UI with Shadcn Table
- Add filtering and timeframe options

#### Week 10: Social Interactions

##### Day 1-2: Achievement Sharing
- Create shareable achievement cards
- Implement social media integration
- Build in-app sharing functionality
- Add privacy controls for achievements

##### Day 3-4: Prayer Buddy System
- Implement accountability partnerships
- Create prayer buddy activity feed
- Build prayer reminder system between buddies
- Add encouragement messaging features

##### Day 5: Notification System
- Create notification preference controls
- Implement push notification service
- Build notification grouping and prioritization
- Add notification action buttons

### Phase 5: Advanced PWA Features (Weeks 11-12)

#### Week 11: Offline Capabilities

##### Day 1-2: Caching Strategies
- Implement advanced resource caching
- Create route-based caching policies
- Build API response caching
- Add cache invalidation mechanisms

##### Day 3-4: Background Sync
- Create background sync for prayer logging
- Implement periodic sync for data updates
- Build sync conflict resolution
- Add sync status indicators

##### Day 5: Offline Lopi
- Implement offline response capability for common questions
- Create cached response system
- Build offline conversation queueing
- Add sync on reconnection

#### Week 12: Performance Optimization

##### Day 1-2: Code Optimization
- Implement code splitting and lazy loading
- Create component memoization strategy
- Build bundle size optimization
- Add tree shaking

##### Day 3-4: Asset Optimization
- Create responsive image loading strategy
- Implement font optimization
- Build animation performance monitoring
- Add resource prioritization

##### Day 5: Performance Audits
- Run Lighthouse audits
- Implement Core Web Vitals optimizations
- Create performance monitoring
- Fix identified issues

### Phase 6: Innovation & Polish (Weeks 13-15)

#### Week 13: AR & Advanced Features

##### Day 1-2: AR Prayer Direction
- Implement AR Qibla finder using device sensors
- Create visual compass overlay
- Build location accuracy improvements
- Add fallbacks for unsupported devices

##### Day 3-4: Voice Commands
- Create voice command system
- Implement natural language processing
- Build voice feedback system
- Add accessibility alternatives

##### Day 5: Contextual UI
- Implement time-of-day UI adaptations
- Create location-based UI adjustments
- Build usage pattern adaptations
- Add mood-responsive UI

#### Week 14: Lopi Advanced Features

##### Day 1-2: Multi-modal Capabilities
- Implement image recognition for prayer spaces
- Create visual feedback processing
- Build multi-modal prompt engineering
- Add accessibility descriptions

##### Day 3-4: Spiritual Guidance Routines
- Create guided spiritual journeys
- Implement personalized prayer improvement plans
- Build spiritual goal setting and tracking
- Add adaptive guidance based on progress

##### Day 5: Educational Journeys
- Implement Lopi-guided learning paths
- Create interactive educational content
- Build knowledge assessment
- Add personalized curriculum

#### Week 15: Final Polish & Testing

##### Day 1-2: User Testing
- Conduct usability testing sessions
- Implement A/B testing for key features
- Create feedback collection mechanism
- Build analytics for feature usage

##### Day 3-4: Refinement
- Polish animations and interactions
- Implement final design adjustments
- Create performance optimizations
- Build accessibility improvements

##### Day 5: Launch Preparation
- Create marketing materials
- Implement onboarding improvements
- Build launch analytics
- Prepare support documentation

## Lopi AI Assistant - Detailed Specification

### 1. Core Capabilities

#### Spiritual Guidance
- **Prayer Technique Advice**: Provide guidance on proper prayer techniques based on user's madhab
- **Focus Enhancement**: Suggest methods to improve concentration during prayer
- **Spiritual Growth**: Offer personalized advice for deepening spiritual connection
- **Habit Building**: Provide strategies for building consistent prayer habits

#### Educational Support
- **Concept Explanation**: Explain Islamic concepts related to prayer in accessible language
- **Question Answering**: Address common questions about prayer and related topics
- **Learning Resources**: Recommend appropriate educational content based on user's knowledge level
- **Progressive Learning**: Guide users through increasingly advanced topics

#### Motivational Coaching
- **Streak Recovery**: Provide encouragement and strategies when users break prayer streaks
- **Personalized Motivation**: Offer motivation tailored to user's specific challenges
- **Achievement Recognition**: Celebrate milestones and improvements
- **Challenge Support**: Provide guidance during community challenges

#### Personalized Insights
- **Pattern Recognition**: Identify patterns in prayer behavior
- **Progress Tracking**: Highlight improvements and areas for growth
- **Contextual Awareness**: Adjust advice based on user's history and preferences
- **Adaptive Recommendations**: Evolve recommendations as user progresses

### 2. Technical Implementation

#### Prompt Engineering

**Base System Prompt Components:**
```
1. Identity: You are Lopi, a supportive AI assistant for the Hopium Prayer App
2. Knowledge: You have knowledge of Islamic prayer practices across different madhabs
3. Tone: You are warm, encouraging, and respectful
4. Limitations: You should defer to qualified scholars on complex religious rulings
5. Privacy: You respect user privacy and only reference information they've shared
```

**Context Injection Framework:**
- User Profile: Name, madhab preference, experience level
- Prayer History: Recent prayer logs, streaks, focus levels
- App Usage: Feature engagement, learning progress
- Conversation History: Recent interactions and established context

**Specialized Prompt Templates:**
- Prayer Guidance Template
- Educational Explanation Template
- Motivation Template
- Insight Generation Template
- Community Support Template

#### Conversation Architecture

**Memory System:**
- Short-term Memory: Current conversation context (managed by LangChain)
- Medium-term Memory: Recent interactions and insights (vector database)
- Long-term Memory: User preferences and patterns (structured database)

**Context Management:**
- Context Window: 8-10 most recent messages plus relevant metadata
- Context Retrieval: Semantic search for relevant past interactions
- Context Pruning: Automatic removal of irrelevant information

**Response Generation Pipeline:**

- Input Processing: Parse user input for intent and entities
- Context Assembly: Gather relevant user data and conversation history
- Prompt Construction: Assemble complete prompt with context
- Response Generation: Generate initial response using LLM
- Post-processing: Format, filter, and enhance response
- Delivery: Present response with appropriate UI elements

### 3. Safety & Responsibility

#### Content Filtering:
- Pre-filtering: Block inappropriate user inputs
- Post-filtering: Ensure AI responses meet ethical guidelines

#### Privacy Controls:
- Data Minimization: Only process necessary user data
- User Control: Allow users to delete conversation history
- Permission System: Request explicit permission for data usage
- Transparency: Clearly indicate AI-generated content

#### Bias Mitigation:
- Prompt Design: Carefully craft prompts to avoid biased responses
- Response Review: Monitor for and address potential biases
- Diversity in Training: Ensure representation across different Islamic traditions
- User Feedback: Incorporate user feedback to improve responses

### 4. UI Integration

#### Chat Interface

**Customized Shadcn Chat Component:**
- Branded message bubbles with Hopium design language
- Animated typing indicators
- Message status indicators (sent, delivered, read)
- Reaction options for user feedback

**Interaction Modes:**
- Text Input: Primary interaction method
- Voice Input: Speech-to-text for hands-free use
- Quick Replies: Suggested responses for common queries
- Rich Content: Support for images, cards, and interactive elements

**Accessibility Features:**
- Screen reader compatibility
- Keyboard navigation
- High contrast mode
- Font size adjustment

#### Voice Interface

**Speech Recognition:**
- Wake word detection ("Hey Lopi")
- Noise cancellation for prayer environments
- Multilingual support (Arabic, English, etc.)

**Speech Synthesis:**
- Natural-sounding voice with appropriate tone
- Pronunciation optimization for Islamic terms
- Speed and pitch adjustment
- Voice selection options

### 5. Development Roadmap

**Phase 1: Core Capabilities (Week 6)**
- Basic prompt engineering
- Simple conversation handling
- Initial UI integration
- Baseline knowledge implementation

**Phase 2: Enhanced Personalization (Week 7-8)**
- User data integration
- Context-aware responses
- Memory system implementation
- Voice interface basics

**Phase 3: Advanced Features (Week 13-14)**
- Multi-modal capabilities
- Complex spiritual guidance
- Educational journeys
- Adaptive personalization

**Phase 4: Refinement & Optimization (Week 15)**
- Performance optimization
- Response quality improvements
- User testing and feedback incorporation
- Final polish and bug fixes