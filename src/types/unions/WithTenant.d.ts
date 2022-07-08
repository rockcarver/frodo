/**
 * Needed to provide a tenant host
*/
export interface WithTenant {
    /**
     * Your ForgeRock environments URL, see example for details
    */
    tenant: string
}