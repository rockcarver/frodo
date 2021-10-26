const axios = require('axios');
const util = require('util');
const utils = require('../../../utils.js')
const replaceall = require("replaceall");
const {
    ImportJourney
} = require("../../journey/run.js");

const info = {
    "id": "stats",
    "name": "Create all configuration necessary to show basic dashboards in ID Cloud"
};

const oauthClientSecret = "Excluding-Overnight-Panda5-Naturist";
const userPassword = "Viselike-Greedily9-Spender-Relish";

const oauthClientURLTemplate = "%s/json%s/realm-config/agents/OAuth2Client/%s"
const userURLTemplate = "%s/openidm/managed/alpha_user?_action=create"
const userSearchURLTemplate = "%s/openidm/managed/alpha_user?_queryFilter=userName+eq+'%s'"
const userRoleURLTemplate = "%s/openidm/managed/alpha_user/%s/authzRoles?_action=create"
const queryUserRoleURLTemplate = "%s/openidm/managed/alpha_user/%s/authzRoles?_queryFilter=true"
const accessTokenURLTemplate = "%s/oauth2%s/access_token"

async function GetAccessToken(tenant, username) {
    const headers = {
        "X-Requested-With": "XmlHttpRequest",
        "Content-Type" : "application/x-www-form-urlencoded"
    };
    try {
        const jURL = util.format(accessTokenURLTemplate, tenant, utils.GetRealmUrl("alpha"));
        let bodyFormData = `grant_type=password&client_id=_journey&client_secret=${oauthClientSecret}&scope=fr:idm:*&username=${username}&password=${userPassword}`;
        const response = await axios.post(jURL, bodyFormData, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error(`GetAccessToken ERROR: call returned ${response.status}, details: ${response}`);
            return null;
        }
        if("access_token" in response.data) {
            return response.data.access_token;
        } else {
            return null;
        }
    } catch(e) {
        console.error(`GetAccessToken ERROR: error, script ${username} - ${e}`, e);
        return null;
    }
}

async function IsOAuthClientPresent(frToken, id) {
    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "X-Requested-With": "XmlHttpRequest",
        "Content-Type": "application/json",
        "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
    };
    try {
        const jURL = util.format(oauthClientURLTemplate, frToken.tenant, utils.GetRealmUrl("alpha"), id);
        const response = await axios.get(jURL, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error(`IsOAuthClientPresent ERROR: call returned ${response.status}, details: ${response}`);
            return false;
        }
        if(response.data._id != id) {
            console.error(`IsOAuthClientPresent ERROR: generic error ${id}`);
            return false;
        }
        return true;
    } catch(e) {
        console.error(`IsOAuthClientPresent ERROR: error, ${id} - ${e}`, e);
        return false;
    }
}

async function CreateOAuthClient(frToken, id, data) {
    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "X-Requested-With": "XmlHttpRequest",
        "Content-Type": "application/json",
        "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
    };
    try {
        const jURL = util.format(oauthClientURLTemplate, frToken.tenant, utils.GetRealmUrl("alpha"), id);
        const response = await axios.put(jURL, data, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error(`CreateOAuthClient ERROR: create OAuth client call returned ${response.status}, details: ${response}`);
            return null;
        }
        if(response.data._id != id) {
            console.error(`CreateOAuthClient ERROR: generic error creating OAuth client ${id}`);
            return null;
        }
        return "";
    } catch(e) {
        console.error(`CreateOAuthClient ERROR: put OAuth client error, script ${id} - ${e}`, e);
        return null;
    }
}

async function IsUserPresent(frToken, id) {
    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "X-Requested-With": "XmlHttpRequest",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${frToken.bearerToken}`
    };

    try {
        const jURL = util.format(userSearchURLTemplate, utils.GetTenantURL(frToken.tenant), id);
        const response = await axios.get(jURL, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error(`IsUserPresent ERROR: call returned ${response.status}, details: ${response}`);
            return null;
        }
        if(response.data.result.length > 0) {
            if(response.data.result[0].userName == id) {
                return response.data.result[0]._id;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch(e) {
        console.error(`IsUserPresent ERROR: error, ${id} - ${e}`, e);
        return null;
    }
}

async function CreateUser(frToken, data) {
    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "X-Requested-With": "XmlHttpRequest",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${frToken.bearerToken}`
    };

    try {
        const jURL = util.format(userURLTemplate, utils.GetTenantURL(frToken.tenant));
        const response = await axios.post(jURL, data, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error(`CreateUser ERROR: create user call returned ${response.status}, details: ${response}`);
            return null;
        }
        return response.data._id;
    } catch(e) {
        console.error(`CreateUser ERROR: create user error, ${data.userName} - ${e}`, e);
        return null;
    }
}

async function IsRoleAssignedToUser(frToken, id, role) {
    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "X-Requested-With": "XmlHttpRequest",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${frToken.bearerToken}`
    };

    try {
        const jURL = util.format(queryUserRoleURLTemplate, utils.GetTenantURL(frToken.tenant), id);
        const response = await axios.get(jURL, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error(`IsRoleAssignedToUser ERROR: call returned ${response.status}, details: ${response}`);
            return false;
        }
        let assigned = false;
        response.data.result.forEach(r=>{
            if(r._ref == role) {
                assigned = true;
            }
        });
        return assigned;
    } catch(e) {
        console.error(`IsRoleAssignedToUser ERROR: error, ${data.userName} - ${e}`, e);
        return false;
    }
}

async function AssignRoleToUser(frToken, id, data) {
    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "X-Requested-With": "XmlHttpRequest",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${frToken.bearerToken}`
    };

    try {
        const jURL = util.format(userRoleURLTemplate, utils.GetTenantURL(frToken.tenant), id);
        const response = await axios.post(jURL, data, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error(`AssignRoleToUser ERROR: assign role call returned ${response.status}, details: ${response}`);
            return null;
        }
        return response.data._id;
    } catch(e) {
        console.error(`AssignRoleToUser ERROR: assign role error, ${data.userName} - ${e}`, e);
        return null;
    }
}

async function Cook(frToken, recipe) {

    console.log("recipe [%s] not fully implemented", recipe);
    return;
    fs.readFile(`./modules/recipes/${info.id}/data.json`, 'utf8', async function (err, jsonData) {
        if (err) throw err;
        
        let finalData = replaceall("${OAUTH_CLIENT_PASSWORD}", oauthClientSecret, jsonData);
        finalData = replaceall("${TENANT}", utils.GetTenantURL(frToken.tenant), finalData);

        const data = JSON.parse(finalData);

        // - Create OAuth client with ROPC and fr:idm:* scope and long token lifetime
        console.log("Checking OAuth client...")
        if(await IsOAuthClientPresent(frToken, "_journey") == false) {
            console.log("not present, creating...")
            await CreateOAuthClient(frToken, "_journey", data.oauth_client);
        } else {
            console.log("already present")
        }

        // - Create user with openidm-admin privilege - frodo
        console.log("Checking user...")
        let journeyUserId = await IsUserPresent(frToken, data.stats_user.userName);
        if(journeyUserId == null) {
            console.log("not present, creating...")
            data.stats_user.password = userPassword;
            journeyUserId = await CreateUser(frToken, data.stats_user);
            console.log(`user id created : ${journeyUserId}`);
        } else {
            console.log("already present")
        }
        console.log("Checking user's role...")
        if(await IsRoleAssignedToUser(frToken, journeyUserId, data.role_payload._ref) == false) {
            console.log("not assigned, assigning...")
            await AssignRoleToUser(frToken, journeyUserId, data.role_payload);
        } else {
            console.log("already assigned")
        }

        // - Get access token for user and store it in its profile - frodo
        console.log("Getting access token...")
        let accessToken = await GetAccessToken(frToken.tenant, data.stats_user.userName);
        if(accessToken != null) {
            console.log("got access token: " + accessToken);
            //${ACCESS_TOKEN}
            // - Import LogEvent and DisplayStats tree, while adding the access token to them
            data.journeys.forEach(j=>{
                for(script in j.scripts) {
                    //console.log(Buffer.from(j.scripts[script].script, 'base64').toString('ascii'));
                    // base64 decode script
                    let theScript = Buffer.from(j.scripts[script].script, 'base64').toString('ascii');
                    // replace token
                    let theScriptProcessed = replaceall("${ACCESS_TOKEN}", accessToken, theScript);
                    // base64 encode and set
                    j.scripts[script].script = Buffer.from(theScriptProcessed).toString('base64');
                }
                ImportJourney(frToken, j.tree._id, j, false, true).then(result=>{
                    if(!result == null)
                        console.log("Import done.");
                });
            })
        }
    });

    // - Create scheduled jobs - frodo
    // - Create daily and weekly managed objects - frodo
    // - Auto update Login, Registration and Password Reset trees? How to handle this? - frodo
    
}

module.exports.Cook = Cook;
module.exports.info = info;