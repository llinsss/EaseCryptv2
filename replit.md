# Replit.md

## Overview

This is a complete Telegram Mini App for buying cryptocurrency with fiat currency (Nigerian Naira) on the Starknet blockchain. The application allows users to purchase BTC, ETH, and USDC without requiring account creation, featuring a streamlined flow from token selection to payment confirmation. Built as a modern full-stack application with React frontend and Express backend, it integrates with payment gateways and blockchain networks to provide a seamless crypto purchasing experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Telegram Integration**: Native Telegram WebApp SDK for mini-app functionality

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful APIs with proper HTTP status codes and error handling
- **Storage**: In-memory storage implementation with interface for easy database migration
- **Validation**: Zod schemas for request/response validation and type inference
- **Development**: Hot reload with Vite integration for seamless full-stack development

### Database Schema Design
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe queries
- **Tables**: 
  - `transactions`: Core transaction records with payment status tracking
  - `crypto_rates`: Real-time cryptocurrency pricing data  
  - `payment_sessions`: Session management for payment flows
- **Data Types**: Proper handling of financial data using integers for precision (kobo storage)
- **Migrations**: Schema versioning with Drizzle Kit for database evolution

### Authentication & Security
- **Authentication**: Telegram WebApp authentication using initData validation
- **Session Management**: Temporary payment sessions with expiration
- **Input Validation**: Client and server-side validation for wallet addresses and amounts
- **Security Headers**: CORS and request validation middleware

### Payment Flow Architecture
- **Multi-step Process**: Input → Summary → Payment → Loading → Success
- **State Management**: Component-level state with React hooks for form flow
- **Real-time Updates**: 30-second cryptocurrency rate refreshing
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Mobile Optimization**: Touch-friendly interface with haptic feedback

## External Dependencies

### Blockchain Integration
- **Starknet Network**: Mainnet deployment for cryptocurrency transactions
- **Wallet Support**: Starknet wallet address validation and formatting
- **Transaction Handling**: Backend integration with Starknet.js for token transfers

### Payment Gateway
- **Nigerian Payments**: Flutterwave or Paystack integration for virtual bank accounts
- **Webhook Handling**: Real-time payment confirmation via webhook endpoints  
- **Multi-currency**: Initial NGN support with architecture for USD expansion
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Third-party APIs
- **CoinGecko API**: Real-time cryptocurrency pricing with 30-second refresh intervals
- **Rate Fallback**: Offline rate caching for service reliability
- **Error Handling**: Graceful degradation when external APIs are unavailable

### Development Tools
- **Database**: Neon PostgreSQL for serverless database hosting
- **Deployment**: Prepared for Vercel (frontend) and Heroku (backend) deployment
- **Monitoring**: Built-in request logging and error tracking
- **Testing**: Component structure ready for testing framework integration

### UI/UX Libraries
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS transitions and Tailwind animations for smooth interactions
- **Mobile Experience**: Safe area handling and touch optimization
- **Accessibility**: Radix UI primitives ensure WCAG compliance
- **Toast Notifications**: Custom toast system for user feedback