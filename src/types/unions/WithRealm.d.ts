/**
 * Your ForgeRock environments realm
 * @eample ``` {
 *     realm: '/alpha'
 * }```
*/
export interface WithRealm {
    /**
     * The realm path
    */
    realm: string
}