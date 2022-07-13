List [options] <host> [realm] [user] [password]                  List all realms.
Info [options] <host> [realm] [user] [password]               Get information about a realm.
AddCustomDomain [options] <host> [realm] [user] [password]     Add custom DNS domain to a realm.
RemoveCustomDomain [options] <host> [realm] [user] [password]


/**
 * List all realms.
 *
 * @example ``` js
 * $import({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      realm: '/mordor',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
 export type List = (
    options: WithOptions<
      keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
    >
  ) => void;
  