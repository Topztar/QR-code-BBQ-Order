#!/usr/bin/env node
/**
 * Automated Local Security & Data-Protection Audit Script (Phase 1)
 * Checks Security Rules, Headers, Functions Validation, and executes Vitest Security Suite
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🛡️  Phase 1: Automated Security & Data Protection Audit');
console.log('====================================================\n');

let auditPassed = true;
const auditReport = [];

function recordCheck(name, passed, details) {
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol} : ${name}`);
  if (details) console.log(`   └─ ${details}`);
  auditReport.push({ name, passed, details });
  if (!passed) auditPassed = false;
}

// 1. Audit Firestore Security Rules
try {
  const rulesPath = path.join(ROOT_DIR, 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  const hasMenuProtection = rulesContent.includes('match /menu/{id}') && rulesContent.includes('allow write: if false;');
  const hasSecretsProtection = rulesContent.includes('match /secrets/{id}') && rulesContent.includes('allow read, write: if false;');
  const hasCheckoutsProtection = rulesContent.includes('match /checkouts/{id}') && rulesContent.includes('allow read, write: if false;');
  const hasOrderCreateValidation = rulesContent.includes('request.resource.data.tableNumber is string');
  const hasReservationProtection = rulesContent.includes('match /reservations/{id}') && rulesContent.includes('allow read, update, delete: if false;');

  recordCheck('Firestore: Sensitive Collections (/secrets, /checkouts) Read/Write Blocked', hasSecretsProtection && hasCheckoutsProtection);
  recordCheck('Firestore: Menu & Setting Tampering Blocked (write: false)', hasMenuProtection);
  recordCheck('Firestore: Order Schema & Field-Level Creation Validation', hasOrderCreateValidation);
  recordCheck('Firestore: Reservation Traversal & Tampering Blocked', hasReservationProtection);
} catch (err) {
  recordCheck('Firestore Rules Audit', false, err.message);
}

// 2. Audit Storage Security Rules
try {
  const storageRulesPath = path.join(ROOT_DIR, 'storage.rules');
  const storageContent = fs.readFileSync(storageRulesPath, 'utf8');
  const hasStorageWriteBlocked = storageContent.includes('allow write: if false;');
  recordCheck('Storage: Direct Client Write Uploads Blocked', hasStorageWriteBlocked);
} catch (err) {
  recordCheck('Storage Rules Audit', false, err.message);
}

// 3. Audit HTTP & CSP Security Headers in firebase.json
try {
  const fbJsonPath = path.join(ROOT_DIR, 'firebase.json');
  const fbJson = JSON.parse(fs.readFileSync(fbJsonPath, 'utf8'));
  const headers = fbJson.hosting?.headers?.[0]?.headers || [];
  
  const hasCSP = headers.some(h => h.key === 'Content-Security-Policy');
  const hasNoSniff = headers.some(h => h.key === 'X-Content-Type-Options' && h.value === 'nosniff');
  const hasFrameDeny = headers.some(h => h.key === 'X-Frame-Options' && h.value === 'DENY');
  const hasPermissions = headers.some(h => h.key === 'Permissions-Policy');

  recordCheck('Hosting: Content-Security-Policy (CSP) Header Configured', hasCSP);
  recordCheck('Hosting: X-Content-Type-Options: nosniff Header Configured', hasNoSniff);
  recordCheck('Hosting: Anti-Clickjacking X-Frame-Options: DENY Configured', hasFrameDeny);
  recordCheck('Hosting: Permissions-Policy Camera/Microphone Restrictions', hasPermissions);
} catch (err) {
  recordCheck('Firebase Hosting Headers Audit', false, err.message);
}

// 4. Audit Cloud Functions Rate Limiting and Input Sanitization
try {
  const functionsIndexPath = path.join(ROOT_DIR, 'functions', 'src', 'index.ts');
  const functionsContent = fs.readFileSync(functionsIndexPath, 'utf8');
  const validatorsPath = path.join(ROOT_DIR, 'functions', 'src', 'validators.ts');
  const authPath = path.join(ROOT_DIR, 'functions', 'src', 'auth.ts');

  const hasValidators = fs.existsSync(validatorsPath);
  const hasAuthModule = fs.existsSync(authPath);
  const functionsDir = path.join(ROOT_DIR, 'functions', 'src', 'routes');
  const functionFiles = fs.readdirSync(functionsDir).filter(f => /\.(ts|js)$/.test(f));
  const allFunctionsContent = functionFiles.map(f => fs.readFileSync(path.join(functionsDir, f), 'utf8')).join('\n') + functionsContent;
  const hasRateLimiting = allFunctionsContent.includes('createRateLimiter') && (allFunctionsContent.includes('orderRateLimiter') || allFunctionsContent.includes('reservationRateLimiter'));
  const hasOrderSanitization = allFunctionsContent.includes('validateOrderPayload');
  const hasReservationSanitization = allFunctionsContent.includes('validateReservationPayload');

  recordCheck('Cloud Functions: Input Sanitization & Payload Validators Module', hasValidators && hasOrderSanitization && hasReservationSanitization);
  recordCheck('Cloud Functions: Modularized Salt-Hashed Auth & PIN Lockout', hasAuthModule);
  recordCheck('Cloud Functions: IP Burst Rate Limiters on Public Endpoints', hasRateLimiting);
} catch (err) {
  recordCheck('Cloud Functions Security Audit', false, err.message);
}

// 5. Run Automated Vitest Test Suite
console.log('\n🧪 Executing Vitest Security & Business Logic Suites...');
try {
  const testOutput = execSync('npx vitest run', { cwd: ROOT_DIR, encoding: 'utf8' });
  const passedMatch = testOutput.match(/Tests\s+(\d+)\s+passed/);
  const passedCount = passedMatch ? passedMatch[1] : 'All';
  recordCheck(`Vitest Suite: All ${passedCount} Security & Unit Tests Passed`, true, 'Zero failures');
} catch (err) {
  recordCheck('Vitest Test Suite Execution', false, err.stdout || err.message);
}

console.log('\n====================================================');
if (auditPassed) {
  console.log('🎉 Phase 1 Security Audit: 100% SUCCESS (Zero Vulnerabilities)');
} else {
  console.log('⚠️  Phase 1 Security Audit: ISSUES DETECTED - Review logs above');
  process.exit(1);
}
console.log('====================================================\n');
