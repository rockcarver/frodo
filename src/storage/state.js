import packageJSON from '../../package.json';

/**
 * Enables debug logging of state in development mode, you may see this in tests.
 */
const stateDebugger = {
  set: (targetObject, property, value) => {
    console.debug(`Global state changed, "${property}" set to ${value}`);
    return Reflect.set(targetObject, property, value);
  },
};

/**
 * The default global state object used to keep important details in a central location
 * Not that when set, the object is logged via Proxy
 * @type {import('../types/state/State').GlobalState}
 */
export const state = new Proxy(
  {
    allowInsecureConnection: false,
    amVersion: '',
    bearerToken: '',
    cookieName: '',
    cookieValue: '',
    deploymentType: 'cloud',
    frodoVersion: packageJSON.version,
    tenant: '',
    logApiKey: '',
    logApiSecret: '',
    password: '',
    realm: '',
    username: '',
  },
  // debuging proxy
  ...stateDebugger
);
