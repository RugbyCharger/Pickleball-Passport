#!/bin/bash
# ============================================================================
# Pickleball Passport - Continuation Setup Script
# Run this script to pick up development from where you left off
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE IF NEEDED
REPO_URL="git@github.com:RugbyCharger/Pickleball-Passport.git"
REPO_NAME="Pickleball-Passport"
WORK_DIR="$HOME/Projects"
SSH_KEY_NAME="github_ssh_key"  # Update to match your 1Password item name

echo -e "${BLUE}🚀 Pickleball Passport - Continuation Setup${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# ============================================================================
# Step 1: SSH Key Setup from 1Password
# ============================================================================
echo -e "${BLUE}📦 Step 1: SSH Key Setup${NC}"
echo "-----------------------------------"

if ! command -v op &> /dev/null; then
    echo -e "${YELLOW}⚠️  1Password CLI not found${NC}"
    echo "   Install with: brew install --cask 1password-cli"
    echo ""
    read -p "Press Enter after installing, or Ctrl+C to exit..."
fi

# Sign in to 1Password if needed
if ! op account list &> /dev/null 2>&1; then
    echo -e "${YELLOW}🔐 Signing in to 1Password...${NC}"
    op signin
fi

SSH_KEY_PATH="$HOME/.ssh/id_ed25519_github"
mkdir -p ~/.ssh

# Try multiple methods to get SSH key from 1Password
echo "🔑 Fetching SSH key from 1Password..."
if op item get "$SSH_KEY_NAME" &> /dev/null 2>&1; then
    # Try different field names
    op item get "$SSH_KEY_NAME" --fields "private key" > "$SSH_KEY_PATH" 2>/dev/null || \
    op item get "$SSH_KEY_NAME" --fields "Private Key" > "$SSH_KEY_PATH" 2>/dev/null || \
    op read "op://Private/$SSH_KEY_NAME/private key" > "$SSH_KEY_PATH" 2>/dev/null || {
        echo -e "${RED}❌ Could not extract SSH key. Check 1Password item name: $SSH_KEY_NAME${NC}"
        exit 1
    }
    chmod 600 "$SSH_KEY_PATH"
    
    # Get public key if available
    op item get "$SSH_KEY_NAME" --fields "public key" > "${SSH_KEY_PATH}.pub" 2>/dev/null || \
    op item get "$SSH_KEY_NAME" --fields "Public Key" > "${SSH_KEY_PATH}.pub" 2>/dev/null || \
    op read "op://Private/$SSH_KEY_NAME/public key" > "${SSH_KEY_PATH}.pub" 2>/dev/null || true
    
    [ -f "${SSH_KEY_PATH}.pub" ] && chmod 644 "${SSH_KEY_PATH}.pub"
    
    # Add to SSH agent
    eval "$(ssh-agent -s)" > /dev/null 2>&1
    ssh-add "$SSH_KEY_PATH" 2>/dev/null || true
    
    echo -e "${GREEN}✅ SSH key configured${NC}"
else
    echo -e "${YELLOW}⚠️  SSH key '$SSH_KEY_NAME' not found in 1Password${NC}"
    echo "   Update SSH_KEY_NAME in script or set up SSH manually"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ============================================================================
# Step 2: Clone/Update Repository
# ============================================================================
echo ""
echo -e "${BLUE}📥 Step 2: Repository Setup${NC}"
echo "-----------------------------------"

mkdir -p "$WORK_DIR" && cd "$WORK_DIR"

if [ -d "$REPO_NAME" ]; then
    echo "📂 Repository exists, updating..."
    cd "$REPO_NAME"
    git fetch origin
    git checkout main || git checkout -b main || true
    git pull origin main || echo -e "${YELLOW}⚠️  Pull failed (may have conflicts)${NC}"
    echo -e "${GREEN}✅ Repository updated${NC}"
else
    echo "📥 Cloning repository..."
    git clone "$REPO_URL" && cd "$REPO_NAME"
    echo -e "${GREEN}✅ Repository cloned${NC}"
fi

REPO_PATH="$(pwd)"
echo "📍 Repository: $REPO_PATH"

# ============================================================================
# Step 3: Install Dependencies
# ============================================================================
echo ""
echo -e "${BLUE}📦 Step 3: Installing Dependencies${NC}"
echo "-------------------------------------------"

if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "📦 Installing project dependencies..."
pnpm install

echo -e "${GREEN}✅ Dependencies installed${NC}"

# ============================================================================
# Step 4: Environment Setup
# ============================================================================
echo ""
echo -e "${BLUE}⚙️  Step 4: Environment Setup${NC}"
echo "----------------------------------"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from .env.example${NC}"
    else
        touch .env
        echo -e "${YELLOW}⚠️  Created empty .env file${NC}"
    fi
    echo -e "${YELLOW}⚠️  IMPORTANT: Update .env with your credentials!${NC}"
    echo ""
    echo "Required environment variables:"
    echo "  - Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)"
    echo "  - Stripe keys (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY)"
    echo "  - Twilio keys (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)"
    echo "  - SendGrid keys (SENDGRID_API_KEY)"
    echo "  - Database URL (DATABASE_URL)"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# ============================================================================
# Step 5: Git Configuration
# ============================================================================
echo ""
echo -e "${BLUE}🔧 Step 5: Git Configuration${NC}"
echo "--------------------------------"

git config user.name "Grant Charge" 2>/dev/null || true
git config user.email "grant@example.com" 2>/dev/null || true

echo -e "${GREEN}✅ Git configured${NC}"

# ============================================================================
# Step 6: Prisma Client Generation
# ============================================================================
echo ""
echo -e "${BLUE}🗄️  Step 6: Prisma Client Generation${NC}"
echo "----------------------------------------"

pnpm db:generate || echo -e "${YELLOW}⚠️  Prisma generate failed (may need DATABASE_URL)${NC}"

# ============================================================================
# Step 7: Commit and Push Changes
# ============================================================================
echo ""
echo -e "${BLUE}💾 Step 7: Committing Changes${NC}"
echo "-----------------------------------"

if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected:"
    git status --short | head -10
    echo ""
    
    read -p "Commit and push these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        
        COMMIT_MESSAGE="feat: Complete Story 4-11 (Affirm Financing) and Story 11-6 (SMS Notifications)

- E4-S11: Affirm/Klarna Financing Integration
  - Enable Affirm payment method in PaymentIntent
  - Update payment plan selector to enable Financing option
  - Add Affirm-specific error handling
  - Update webhook handler for Affirm payments
  - Add Affirm setup documentation

- E11-S6: SMS Notifications with Twilio
  - Implement Twilio SMS service
  - Add SMS templates for payment failures, flight delays, etc.
  - Integrate SMS into payment failure flow
  - Add admin SMS procedures (tRPC endpoints)
  - Add user SMS preferences UI
  - Update Prisma schema with phoneNumber and SMS preferences

- Update sprint status and documentation
- Add implementation summaries for both stories"
        
        git commit -m "$COMMIT_MESSAGE" || echo -e "${YELLOW}⚠️  Commit failed (may be empty or already committed)${NC}"
        
        echo "🚀 Pushing to GitHub..."
        git push origin main || echo -e "${YELLOW}⚠️  Push failed (may need to pull first)${NC}"
        
        echo -e "${GREEN}✅ Changes committed and pushed${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipping commit${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Repository:${NC} $REPO_PATH"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Update .env file with credentials:"
echo "   - Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)"
echo "   - Stripe keys (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY)"
echo "   - Twilio keys (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)"
echo "   - SendGrid keys (SENDGRID_API_KEY)"
echo "   - Database URL (DATABASE_URL)"
echo ""
echo "2. Set up the database:"
echo "   cd $REPO_PATH"
echo "   pnpm db:push"
echo ""
echo "3. Start development server:"
echo "   pnpm dev"
echo ""
echo -e "${BLUE}📚 Recent Changes:${NC}"
echo "   - Story 4-11: Affirm Financing (lib/stripe/, components/payments/)"
echo "   - Story 11-6: SMS Notifications (lib/sms/, components/admin/)"
echo ""
echo -e "${BLUE}📄 Documentation:${NC}"
echo "   - _bmad-output/implementation/4-11-affirm-klarna-financing.md"
echo "   - _bmad-output/implementation/11-6-implementation-summary.md"
echo "   - _bmad-output/implementation/CURRENT_STATUS_AND_NEXT_STEPS.md"
echo ""
echo -e "${GREEN}🎾 Ready to code!${NC}"
