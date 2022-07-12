/**
 * Needed to provide a username of the admin user
 */
export interface WithUsername {
  /**
   * Your ForgeRock admin username
   */
  username: string;
}

/**
 * Needed to provide a password of the admin user
 */
export interface WithPassword {
  /**
   * Your ForgeRock admin password
   */
  password: string;
}

/**
 * Needed to provide a username and password of the admin user
 */
export interface WithCredentials {
  /**
   * Your ForgeRock admin username
   */
  username: WithUsername['username'];
  /**
   * Your ForgeRock admin password
   */
  password: WithPassword['password'];
}
