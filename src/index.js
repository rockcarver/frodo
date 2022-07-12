// allow console.debug in debug mode
if (process.env.NODE_ENV !== 'debug') {
  console.debug = function () {};
}
console.debug(
  `NODE_ENV !== 'debug' set to debug, remove to disable debug logging`
);

export * from './bindings/_admin.js';
export * from './bindings/_log.js';
