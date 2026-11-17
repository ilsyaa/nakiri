import { app } from '@nakiri/core/services/starts';

/**
 * Global Startup Files
 * Executed once across all environments (Server & Terminal).
 */
app.use([
  // () => import('./common-setup.js'),
]);

/**
 * Server Startup Files
 * Executed once ONLY during WhatsApp bot runtime server startup.
 */
app.server([
  () => import('#app/starts/chat-buffer.js'),
  () => import('#app/starts/reminder.js'),
]);

/**
 * Terminal Startup Files
 * Executed once ONLY when CLI commands are invoked in the terminal.
 */
app.terminal([
  // () => import('./terminal-hooks.js'),
]);
