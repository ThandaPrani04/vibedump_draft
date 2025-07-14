#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Run this script to verify all required environment variables are set
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'MONGODB_URI'
];

const optionalEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

console.log('🔍 Checking Environment Variables...\n');

let allRequired = true;

console.log('📋 Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  console.log(`  ${varName}: ${status}`);
  
  if (!value) {
    allRequired = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '⚠️  Not Set';
  console.log(`  ${varName}: ${status}`);
});

console.log('\n' + '='.repeat(50));

if (allRequired) {
  console.log('🎉 All required environment variables are set!');
  console.log('You can now run: npm run dev');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('Please check your .env file and add the missing variables.');
  console.log('\nSee README-LOCAL-SETUP.md for detailed instructions.');
}

console.log('='.repeat(50));