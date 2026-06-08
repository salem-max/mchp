#!/usr/bin/env tsx
/**
 * Seed RBAC permissions and feature flags into the database.
 * Run with: npx tsx scripts/seed-rbac.ts
 */

import { seedPermissionsAndFlags } from '../lib/rbac';

async function main() {
  console.log('🌱 Seeding RBAC permissions and feature flags...');
  await seedPermissionsAndFlags();
  console.log('✅ RBAC seed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
