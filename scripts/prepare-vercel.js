const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
fs.rmSync(path.join(root, 'public'), { recursive: true, force: true });
fs.cpSync(path.join(root, 'dist'), path.join(root, 'public'), { recursive: true });

// Private HTML must be served by Express after session validation, never the CDN.
fs.rmSync(path.join(root, 'public', 'leaderboard.html'), { force: true });
