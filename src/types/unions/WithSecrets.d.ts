/**
 *  Your ForgeRock API logging key
 */
export interface WithKey {
  /**
   *  Your ForgeRock API logging key
   */
  key: string;
}

/**
 * Your ForgeRock API logging secret
 */
export interface WithSecret {
  /**
   * Your ForgeRock API logging secret
   */
  secret: string;
}

/**
 * Provide your API key and generated secret
 */
export interface WithSecrets {
  /**
   *  Your ForgeRock API logging key
   */
  key: WithKey['key'];
  /**
   * Your ForgeRock API logging secret
   */
  secret: WithSecret['secret'];
}
