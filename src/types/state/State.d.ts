import { ALL_AMSupportedVersions } from '../journey/OOTBNodeTypes';

/**
 * Descibes the global state of a lib-frodo client
 */
export interface GlobalState {
  /**
   * `true` enable HTTP.\
   */
  allowInsecureConnection: boolean;
  /**
   * which version of ForgeRock Access Management (AM) is in use.
   */
  amVersion: ALL_AMSupportedVersions | '';
  /**
   * The bearer Token, a predominant type of access token used with OAuth 2.0.
   */
  bearerToken: string;
  /**
   * After auth you will have a cookie with a name and value, this is the name.
   */
  cookieName: string;
  /**
   * After auth you will have a cookie with a name and value, this is the value.
   */
  cookieValue: string;
  /**
   * choose the context of the target environment
   */
  deploymentType: 'classic' | 'cloud' | 'forgeops';
  /**
   * The version of lib-frodo, this cannot be changed.
   */
  readonly frodoVersion: string;
  /**
   * What is the url of the tenant?
   */
  tenant: string;
  /**
   * You provide a generated logging API key from the tenant.
   */
  logApiKey: string;
  /**
   * You provide a generated logging API secret from the tenant.
   */
  logApiSecret: string;
  /**
   * The password of the admin user.
   */
  password: string;
  /**
   * Which realm do the frodo commands affect?
   */
  realm: string;
  /**
   * The username of the admin user.
   */
  username: string;
}

/**
 * Many functions in  lib-frodo use a pure object pattern which require state to be passed as a object
 * ### Why?
 * 1. testability - easy to use static data
 * 2. flexability - any data can override state
 * 3. maintainability - args do not rely on order
 * @example ```js
 * func({ a, b, c, state: { username, password } });
 * ```
 */
export interface WithStateParams<keys> {
  /**
   * The global state object to be injected where keys refer to the required keys from the global state object needed by the calling function
   * @example ```ts
   * // correct
   * const x: Pick<GlobalState, 'username' | 'password'> = { username: '', password: '' }
   * // incorrect
   * const y: Pick<GlobalState, 'username' | 'password'> = { username: '', password: '', insecure: true }
   * ```
   */
  state: Pick<GlobalState, keys>;
}
