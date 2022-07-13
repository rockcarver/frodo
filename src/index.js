// allow console.debug in debug mode
if (process.env.NODE_ENV !== 'debug') {
  console.debug = function () {};
}
console.debug(
  `NODE_ENV !== 'debug' set to debug, remove to disable debug logging`
);

export * as admin from './bindings/admin.js';
export * as application from './bindings/application.js';
export * as emailTemplate from './bindings/email-template.js';
export * as log from './bindings/log.js';
export * as realm from './bindings/realm.js';
