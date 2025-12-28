# Pickleball Passport

**Luxury Transformation Tourism in Thailand** - Where Pickleball Meets World-Class Wellness and Medical Care

A Next.js application for managing luxury pickleball tourism packages, combining sport, wellness, and medical tourism in Thailand.

## 🏗️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk
- **API Layer**: tRPC with React Query
- **Payments**: Stripe (coming soon)
- **Email**: SendGrid (coming soon)
- **Video**: Mux (coming soon)

## 📋 Current Sprint Status

**Sprint 1: Foundation & Authentication** (20/33 points complete)

✅ Completed:
- FOUNDATION-1: Next.js scaffolding (3 pts)
- FOUNDATION-2: Database schema (5 pts)
- FOUNDATION-3: Prisma setup (3 pts)
- FOUNDATION-4: tRPC setup (3 pts)
- FOUNDATION-5: Tailwind & Shadcn UI (2 pts)
- FOUNDATION-6: Environment config (1 pt)
- E2-S1: Clerk Integration (3 pts)

🚧 In Progress:
- E2-S2: User Sign-Up Flow (5 pts)
- E2-S3: User Login Flow (3 pts)
- E2-S4: Role-Based Access Control (5 pts)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Supabase)
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:RugbyCharger/pickleball-passport.git
   cd pickleball-passport
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your actual API keys (see [SETUP.md](SETUP.md) for detailed instructions)

4. **Set up the database**
   ```bash
   # Push the Prisma schema to your database
   npm run db:push

   # Generate Prisma Client
   npm run db:generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Comprehensive setup guide with Clerk, database, and environment configuration
- **[Sprint Plan](_bmad-output/implementation/sprint-1-plan.md)** - Detailed sprint 1 implementation plan
- **[Sprint Status](_bmad-output/implementation/sprint-status.yaml)** - Current progress tracking
- **[Architecture](_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md)** - System architecture and design

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL and includes the following key entities:

- **Users**: Authentication and role management (Guest, Partner, Admin)
- **Packages**: Trip packages with pricing and duration options
- **Trips**: Scheduled departures with capacity management
- **Bookings**: Guest reservations with status tracking
- **Add-Ons**: Medical and wellness add-ons
- **Payments**: Stripe integration with installment support
- **Applications**: Guest application workflow
- **Testimonials**: Video testimonials via Mux

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma Client
```

## 🎨 Features

### Current Features (Sprint 1)
- ✅ User authentication (sign-up, sign-in, OAuth)
- ✅ Type-safe API with tRPC
- ✅ Database schema with Prisma
- ✅ Responsive UI with Tailwind CSS
- ✅ Component library with Shadcn UI

### Upcoming Features (Sprint 2-3)
- 🚧 Marketing website with package explorer
- 🚧 Multi-step application form
- 🚧 Video testimonial gallery
- 🚧 Booking configurator
- 🚧 Payment processing with Stripe
- 🚧 Email notifications

## 🤝 Contributing

This is a private project. For development workflow:

1. Create a feature branch
2. Make your changes
3. Commit with descriptive messages
4. Push and create a pull request

## 📄 License

Private - All Rights Reserved

## 🔗 Links

- **Production**: (Coming soon)
- **Staging**: (Coming soon)
- **Design**: (Coming soon)

---

Built with [Next.js](https://nextjs.org) and deployed on [Vercel](https://vercel.com)
