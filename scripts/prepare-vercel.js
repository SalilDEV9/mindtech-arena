const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
fs.cpSync(path.join(root, 'dist'), path.join(root, 'public'), { recursive: true });
