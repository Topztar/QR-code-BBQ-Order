/**
 * 🇹🇭 SABAY BBQ - Combined Firebase Emulator Verification Script
 * -------------------------------------------------------------
 * Designed to execute inside:
 * firebase emulators:exec --only hosting,functions,firestore,auth,storage "node scripts/run_firebase_emulator_verification.cjs"
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function runStep(title, cmd, env = {}) {
  console.log('\n========================================================================');
  console.log(`▶️  [EMULATOR VERIFICATION] ${title}`);
  console.log(`💻  Command: ${cmd}`);
  console.log('========================================================================\n');
  const start = Date.now();
  try {
    execSync(cmd, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...env
      }
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n✅ ${title} completed successfully in ${elapsed}s.\n`);
    return true;
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`\n❌ ${title} failed after ${elapsed}s:`, err.message);
    throw err;
  }
}

async function main() {
  console.log('########################################################################');
  console.log('🚀 SABAY BBQ - FIREBASE EMULATOR SYSTEM VERIFICATION RUNNER');
  console.log('   Target: Firebase Hosting (5000) + Cloud Functions (5001) + Firestore (8080)');
  console.log('########################################################################\n');

  // Step 1: Seed data into Firestore Emulator
  runStep('Step 1: Seed Firestore Emulator Fixtures', 'node scripts/seed-emulator.cjs', {
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080'
  });

  // Step 2: Measure Firebase Performance (Hosting + Functions)
  runStep('Step 2: Firebase Performance Measurement (Cold/Warm/Cache)', 'node scripts/measure_firebase_performance.cjs', {
    HOSTING_URL: 'http://127.0.0.1:5000',
    FUNCTIONS_URL: 'http://127.0.0.1:5001/sabay-bbq-order/asia-east1/api'
  });

  // Step 3: Run Browser Puppeteer Kitchen Gate Diagnostics (TC-EMU-01 ~ TC-EMU-04)
  runStep('Step 3: Kitchen Gate Diagnostics Matrix (TC-EMU-01 ~ TC-EMU-04)', 'node scripts/verify_kitchen_matrix_emulator.cjs', {
    BASE_URL: 'http://127.0.0.1:5000'
  });

  // Step 4: Run Browser Puppeteer E2E QA Audit against Firebase Hosting (12 Domains)
  runStep('Step 4: Puppeteer Browser E2E QA Audit Suite (12 Domains)', 'node scripts/run_e2e_qa_audit.cjs', {
    BASE_URL: 'http://127.0.0.1:5000'
  });

  // Step 5: Run Interactive Browser E2E Simulation (Customer -> KDS -> Cashier -> Inventory)
  runStep('Step 5: Full Interactive Browser E2E Simulation (6 Steps)', 'node scripts/verify_browser_interactive_e2e.cjs', {
    BASE_URL: 'http://127.0.0.1:5000'
  });

  // Step 6: Run Category Management Browser E2E Audit (5 Steps)
  runStep('Step 6: Category Management Browser E2E Suite (5 Steps)', 'node scripts/verify_category_browser_e2e.cjs', {
    BASE_URL: 'http://127.0.0.1:5000'
  });

  // Step 7: Run Operations Management Center 11-Tab Benchmark
  runStep('Step 7: Operations Management Center 11-Tab Audit', 'node scripts/verify_operations_center_emulator.cjs', {
    HOSTING_URL: 'http://127.0.0.1:5000',
    FUNCTIONS_URL: 'http://127.0.0.1:5001/sabay-bbq-order/asia-east1/api'
  });

  console.log('\n########################################################################');
  console.log('🎉 ALL FIREBASE EMULATOR SYSTEM VERIFICATION STEPS PASSED!');
  console.log('########################################################################\n');
}

main().catch(err => {
  console.error('\n💥 Firebase Emulator verification runner terminated with error:', err);
  process.exit(1);
});
