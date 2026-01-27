#!/usr/bin/env npx ts-node
/**
 * Admin Setup Script
 *
 * Usage: npx ts-node scripts/setup-admin.ts <email>
 *
 * This script:
 * 1. Finds or creates a user by email
 * 2. Sets their role to ADMIN in the database
 * 3. Outputs instructions for updating Clerk metadata
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAdmin(email: string) {
  console.log(`\n🔧 Setting up admin for: ${email}\n`);

  try {
    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found in database.');
      console.log('\n📋 Next steps:');
      console.log('1. Sign up at https://pickleball-passport.vercel.app/sign-up');
      console.log('2. Re-run this script after signing up');
      console.log('\n⚠️  Make sure CLERK_WEBHOOK_SECRET is configured (see below)');
      return;
    }

    console.log(`✓ Found user: ${user.id}`);
    console.log(`  Current role: ${user.role}`);

    // Update role to ADMIN
    if (user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      console.log(`✓ Updated role to: ADMIN`);
    } else {
      console.log(`✓ User is already ADMIN`);
    }

    // Output Clerk instructions
    console.log('\n' + '═'.repeat(60));
    console.log('📋 CLERK DASHBOARD CONFIGURATION REQUIRED');
    console.log('═'.repeat(60));
    console.log('\nTo complete admin setup, update Clerk public metadata:\n');
    console.log('1. Go to: https://dashboard.clerk.com');
    console.log('2. Select your application');
    console.log('3. Go to Users → Find this user');
    console.log('4. Click Edit → Scroll to "Public metadata"');
    console.log('5. Set the value to:');
    console.log('\n   {"role": "ADMIN"}\n');
    console.log('6. Save changes');
    console.log('\n' + '═'.repeat(60));
    console.log(`\nUser ID for reference: ${user.id}`);
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.log('Usage: npx ts-node scripts/setup-admin.ts <email>');
  console.log('Example: npx ts-node scripts/setup-admin.ts admin@example.com');
  process.exit(1);
}

setupAdmin(email);
