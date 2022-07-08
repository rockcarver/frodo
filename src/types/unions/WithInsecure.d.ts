/**
 * Allow insecure connections when using SSL/TLS (default: Don't allow insecure connections)
*/
export interface WithInsecure {
    /**
     * Enable or disable insecure connections
    */
    insecure: boolean
}