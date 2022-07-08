/**
 * Needed to provide an override for auto-detected deployment type
*/
export interface WithType {
    /**
     * The detected or provided deployment type controls certain behavior like obtaining an Identity Management admin token or not 
     * and whether to export/import referenced email templates or how to walk through the tenant admin login flow of Identity Cloud and handle MFA (choices: "classic", "cloud", "forgeops")
    */
    type: 'classic' | 'cloud' | 'forgerock'
}