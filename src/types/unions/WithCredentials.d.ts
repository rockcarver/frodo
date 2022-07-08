/**
 * Needed to provide a username and password of the admin user
*/
export interface WithCredentials {
    /**
     * Your ForgeRock admin username
    */
    username: string;
    /**
     * Your ForgeRock admin password
    */
    password: string;
}