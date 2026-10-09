'use strict';

// Vercel's Express adapter discovers server.js and imports this HTTP server.
// Socket.IO is attached by backend-mongoose-server.js; no listener is opened
// while Vercel loads this entrypoint.
require('express');
module.exports = require('./backend-mongoose-server.js');
