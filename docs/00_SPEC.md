# PronosBox Specification

## Vision

A "Social Betting" platform combining the best features of **Facebook** (Social Feed & Community), **Telegram** (Private Channels & Real-time Chat), and **Fotmob** (Live Sports Data & Scores). PronosBox aims to be the global reference for bettors, tipsters, and sports lovers, providing a fast, precise, and secure environment.

## User Personas

1. **Regular User**: Browses matches, follows channels, interacts in the "Box" (feed), and uses free AI predictions.
2. **Pro User**: Accesses premium AI predictions, detailed analyses, and can create/monetize their own betting channels.
3. **Admin**: Manages the platform, moderates content, validates transactions, and maintains the official betting channels.
4. **Guest**: Browses scores and public predictions but must register to interact or access wallet features.

## Core Constraints

- **Stack**: Node.js (Express) backend, MongoDB (Mongoose) database, React (Vite) frontend.
- **Performance**: High availability for live match data; instant transitions between sections.
- **Security**: Robust wallet management, secure payments, and protected user data.
- **Responsive Design**: Mobile-First approach is critical as sports fans use the app on the go.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router 6.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose) - NoSQL chosen for its flexibility with social and match data.
- **Auth**: JWT (JSON Web Tokens), Bcrypt.js.
- **State Management**: React Context (Auth, Theme, Payment, Notification).
- **Communication**: REST API (Axios) with a custom "Fallback Mode" for high availability.

## Goals

1. **Reach 100,000 users** minimum.
2. **Global Reference**: Become the "Top-of-Mind" app for sports predictions.
3. **Monetization**: Generate revenue through Ads, Pro Subscriptions, and commissions on premium channel access.
