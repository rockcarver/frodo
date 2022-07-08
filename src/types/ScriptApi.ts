/**
 * This response body contains information about a given script
*/
export interface GetScriptResponseData {
    /**
     * The name of the script, given in the UI script editor name field
    */
    name: string,
    /**
     * The purpose of the script, given in the UI script editor description field
    */
    description: string,
    /**
     * Base64 encoded source of the script
    */
    script: string,
    /**
     * A selction of programming languages, likely JavaScript
    */
    language: string,
    context: string,
    /**
     * When was the script last edited
    */
    lastModifiedDate: number,
    /**
     * When was the script created
    */
    creationDate: number,
    /**
     * Who modified the script most recently
    */
    lastModifiedBy: string,
    /**
     * The unique ID
    */
    _id: string,
    /*
    * Who created the script
    */
    createdBy: string
}