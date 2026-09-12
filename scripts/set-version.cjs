/**
 * set-version.cjs
 * Reads version from package.json and updates Firestore settings/system document (liveSystemVersion).
 * Designed to be run during deployment (e.g. predeploy hook or CI/CD).
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

async function setVersion() {
  console.log('🔄 [Set Version] Reading version from package.json...');
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version;

  if (!version) {
    console.error('❌ [Set Version] No version field found in package.json!');
    process.exit(1);
  }

  console.log(`📌 [Set Version] Target version to deploy: ${version}`);

  const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  const projectId = config.projectId || process.env.GCLOUD_PROJECT || 'sabay-bbq-order';
  const databaseId = config.firestoreDatabaseId || 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07';

  try {
    const apps = admin.apps || [];
    if (!apps.length) {
      admin.initializeApp({
        projectId: projectId,
      });
    }

    const { getFirestore } = require('firebase-admin/firestore');
    const db = getFirestore(databaseId);

    console.log(`📡 [Set Version] Writing liveSystemVersion to Firestore (db: ${databaseId})...`);
    await db.collection('settings').doc('system').set(
      {
        liveSystemVersion: version,
        versionUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ [Set Version] Successfully synced version ${version} to Firestore settings/system!`);
  } catch (err) {
    console.warn(`⚠️ [Set Version] Failed to update Firestore directly (may lack local credentials):`, err.message);
    console.log('ℹ️ [Set Version] Deployment build will continue. The version is packaged in the build bundle.');
  }
}

setVersion().then(() => {
  process.exit(0);
});
