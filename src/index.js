// allow console.debug in debug mode
if (process.env.NODE_ENV !== 'debug') {
  console.debug = function () {};
}
console.debug(
  `NODE_ENV !== 'debug' set to debug, remove to disable debug logging`
);

export * as admin from './bindings/_admin.js';
export * as log from './bindings/_log.js';
export * as application from './bindings/_application.js';
export * as emailTemplate from './bindings/_email-template.js';
