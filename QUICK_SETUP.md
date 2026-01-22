# Quick Setup Guide

## 🚀 Fastest Way to Get Started

### Option 1: Run the Setup Script (Recommended)

```bash
./setup-continue.sh
```

This script will:
1. ✅ Set up SSH key from 1Password
2. ✅ Clone/update the repository
3. ✅ Install dependencies (pnpm)
4. ✅ Create .env file
5. ✅ Configure git
6. ✅ Generate Prisma client
7. ✅ Optionally commit and push changes

### Option 2: Manual Setup

If you prefer to set up manually:

```bash
# 1. Clone repository
git clone git@github.com:RugbyCharger/Pickleball-Passport.git
cd Pickleball-Passport

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env  # If .env.example exists
# Then edit .env with your credentials

# 4. Generate Prisma client
pnpm db:generate

# 5. Set up database
pnpm db:push
```

## 📋 Required Environment Variables

Update your `.env` file with:

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Twilio SMS
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+15551234567"

# SendGrid Email
SENDGRID_API_KEY="SG..."
SENDGRID_FROM_EMAIL="noreply@example.com"

# WhatsApp Business API (optional)
WHATSAPP_API_KEY="EAAx..."
WHATSAPP_PHONE_NUMBER_ID="1234567890"
WHATSAPP_BUSINESS_ACCOUNT_ID="1234567890"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-random-verify-token"
```

## 🎯 After Setup

1. **Start development server:**
   ```bash
   pnpm dev
   ```

2. **Open the app:**
   - http://localhost:3000

3. **View database:**
   ```bash
   pnpm db:studio
   ```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[README.md](README.md)** - Project overview and features
- **[_bmad-output/implementation/CURRENT_STATUS_AND_NEXT_STEPS.md](_bmad-output/implementation/CURRENT_STATUS_AND_NEXT_STEPS.md)** - Current project status

## 🔧 Troubleshooting

### SSH Key Issues
- Update `SSH_KEY_NAME` in `setup-continue.sh` to match your 1Password item name
- Or set up SSH manually: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Database Connection
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format (use connection pooler for Supabase)
- Run `pnpm db:push` to create tables

### Dependencies
- Ensure Node.js 18+ is installed
- Use `pnpm` (not npm) for package management

## 🎾 Happy Coding!
