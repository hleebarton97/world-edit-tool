/**
 * Handlers
 */
const fileManip = require('./js/handlers/fileManip');
const frontend = require('./js/handlers/frontend');
require('./js/handlers/listeners')(fileManip, frontend); // Listen for events (click, keys, buttons, etc.)
