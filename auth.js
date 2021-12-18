const axios = require('axios');
const fs = require('fs');
const url = require('url');
const util = require('util');
const { createHash, randomBytes } = require('crypto');
const utils = require('./utils.js')
const base64url = require('./base64url.js');
var readlineSync = require('readline-sync');

const adminClientPassword = "doesnotmatter"
const serverInfoURLTemplate = "%s/json/serverinfo/%s"
const authorizeURLTemplate = "%s/oauth2%s/authorize"
const accessTokenURLTemplate = "%s/oauth2%s/access_token"
const redirectURLTemplate = "/platform/appAuthHelperRedirect.html"
const oauthClientURLTemplate = "%s/json%s/realm-config/agents/OAuth2Client/%s"

const idmAdminScope = "fr:idm:*"
const apiVersion = "resource=2.0, protocol=1.0"
let adminClientId = "idmAdminClient"

async function GetCookieName(tenant) {
    try {
        const serverinfo = await axios.get(util.format(serverInfoURLTemplate, tenant, "*"));
        return serverinfo.data.cookieName;
    } catch(e) {
        console.error("error getting cookie name: " + e)
        return null;
    }
}

async function CheckAndHandle2FA(payload) {
    // console.log(JSON.stringify(payload, null, 2));
    // let skippable = false;
    if("callbacks" in payload) {
        for(const element of payload.callbacks) {
            if(element.type == "HiddenValueCallback") {
                if(element.input[0].value.includes("skip")) {
                    // skippable = true;
                    element.input[0].value = "Skip";
                    return {
                        need2fa: true,
                        // canskip: true,
                        payload: payload
                    }
                }
            }
            if(element.type == "NameCallback") {
                if(element.output[0].value.includes("code")) {
                    // skippable = false;
                    console.log("2FA is enabled and required for this user...");
                    const code = readlineSync.question(`${element.output[0].value}: `);
                    element.input[0].value = code;
                    return {
                        need2fa: true,
                        // canskip: false,
                        payload: payload
                    }
                }
            }
        }
    } else {
        // console.info("NO2FA");
        return {
            need2fa: false,
            // canskip: null,
            payload: payload
        }
    }
}

async function DetermineDeployment(frToken) {
	const fidcClientId = "idmAdminClient";
	const forgeopsClientId = "idm-admin-ui";
    let response, response2;

    const verifier = base64url.encode(randomBytes(32));
    const challenge = base64url.encode(createHash('sha256').update(verifier).digest());
    const challengeMethod = "S256";
    const authorizeURL = util.format(authorizeURLTemplate, frToken.tenant, "");
    const redirectURL = url.resolve(frToken.tenant, redirectURLTemplate);

    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
    };
    let bodyFormData = `redirect_uri=${redirectURL}&scope=${idmAdminScope}&response_type=code&client_id=${fidcClientId}&csrf=${frToken.cookieValue}&decision=allow&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`;
   
    // let oauthClientURL = util.format(oauthClientURLTemplate, frToken.tenant, "/alpha", fidcClientId);
    try {
        // response = await axios.get(oauthClientURL, {headers: headers});
        response = await axios.post(authorizeURL, bodyFormData, {headers: headers, maxRedirects: 0});
    } catch(e) {
        if(e.response.status == 302) {
            console.log("ForgeRock Identity Cloud detected.");
            return "Cloud";
        } else {
            try {
                bodyFormData = `redirect_uri=${redirectURL}&scope=${idmAdminScope}&response_type=code&client_id=${forgeopsClientId}&csrf=${frToken.cookieValue}&decision=allow&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`;            
                response = await axios.post(authorizeURL, bodyFormData, {headers: headers, maxRedirects: 0});    
            } catch(ex) {
                if(ex.response.status == 302) {
                    console.log("ForgeOps deployment detected.");
                    return "ForgeOps";
                } else {
                    console.log("Classic deployment detected.");
                    return "Classic";
                }
            }
        }
    }
    console.error("Error determining deployment type, please try again with type override");
    return "";
}

async function GetVersionInfo(frToken) {
    const headers = {
        "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
    };
    // console.log(headers);
    try {
        const serverInfoURL = util.format(serverInfoURLTemplate, frToken.tenant, "version")
        const response = await axios.get(serverInfoURL, {headers: headers});
        if("version" in response.data) {
            let versionString = response.data.version;
            const rx = /([\d]\.[\d]\.[\d](\.[\d])*)/g;
            let version = versionString.match(rx);
            console.log("Connected to " + response.data.fullVersion);
            return version[0];
        } else {
            console.error("error getting version info")
        }
    } catch(e) {
        console.error("error getting version info - ", e.message)
    }
}

async function Authenticate(frToken) {
    frToken.cookieName = await GetCookieName(frToken.tenant);
    // console.log("cookieName:"+cookieName);
    try {
        const authURL = util.format("%s/json%s/authenticate", frToken.tenant, utils.GetRealmUrl("/"))
        const headers = {
            "Content-Type": "application/json",
            "Accept-API-Version": apiVersion,
            "X-OpenAM-Username": frToken.username,
            "X-OpenAM-Password": frToken.password
        };
        const data = {}
        const response = await axios.post(authURL, data, {headers: headers});
        // console.log(response.data);
        const headers2 = {
            "Content-Type": "application/json",
            "Accept-API-Version": apiVersion
        };
        const skip2FA = await CheckAndHandle2FA(response.data);
        let response2 = {};
        if(skip2FA.need2fa) {
            response2 = await axios.post(authURL, skip2FA.payload, {headers: headers2});
        } else {
            response2.data = skip2FA.payload;
        }
        // console.log(response2.data);
        if("tokenId" in response2.data) {
            frToken.cookieValue = response2.data.tokenId;
            if(!frToken.deploymentType) {
                // console.log("Detecting deployment type...");
                frToken.deploymentType = await DetermineDeployment(frToken);
            }
            frToken.version = await GetVersionInfo(frToken);
            // console.log(frToken);
            return "";
        } else {
            console.error("error authenticating - ", e.message);
            console.error("+++ likely cause, bad credentials!!! +++");
            return null;
        }
    } catch(e) {
        // console.log(e);
        if(e.response.status == 401) {
            console.error("error authenticating - %s", e.message);
            console.error("+++ likely cause, bad credentials +++");
        } else {
            console.error("error authenticating - ", e);
            return null;
        }
    }
}

async function GetAuthCode(frToken, authorizeURL, redirectURL, codeChallenge, codeChallengeMethod)  {
    // const authURL = util.format("%s/json%s/authenticate", frToken.tenant, GetRealmUrl("/"))
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
    };
    let bodyFormData = `redirect_uri=${redirectURL}&scope=${idmAdminScope}&response_type=code&client_id=${adminClientId}&csrf=${frToken.cookieValue}&decision=allow&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;
    try {
        const response = await axios.post(authorizeURL, bodyFormData, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error("error getting auth code");
            console.error("likely cause: mismatched parameters with OAuth client config");
            return null;
        }
        // console.log(response);
        const redirectLocationURL = response.request.res.responseUrl;
        const queryObject = url.parse(redirectLocationURL, true).query;
        if("code" in queryObject) {
            return queryObject.code;
        } else {
            console.error("auth code not found");
            return null;
        }
    } catch(e) {
        console.error("error getting auth code - ", e.message);
        return null;
    }
}

async function GetAccessToken(frToken) {
    try {
        const verifier = base64url.encode(randomBytes(32));
        const challenge = base64url.encode(createHash('sha256').update(verifier).digest());
        const challengeMethod = "S256";
        const authorizeURL = util.format(authorizeURLTemplate, frToken.tenant, "");
        const accessTokenURL = util.format(accessTokenURLTemplate, frToken.tenant, "");
        const redirectURL = url.resolve(frToken.tenant, redirectURLTemplate);
        const authCode = await GetAuthCode(frToken, authorizeURL, redirectURL, challenge, challengeMethod)
        if(authCode == null) {
            console.error("error getting auth code");
            return null;
        }
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        let response = null;
        if(frToken.deploymentType == "Cloud") {
            const auth = {
                username: adminClientId,
                password: adminClientPassword
            };
            let bodyFormData = `redirect_uri=${redirectURL}&grant_type=authorization_code&code=${authCode}&code_verifier=${verifier}`;
            response = await axios.post(accessTokenURL, bodyFormData, {auth: auth}, {headers: headers})
        } else {
            let bodyFormData = `client_id=${adminClientId}&redirect_uri=${redirectURL}&grant_type=authorization_code&code=${authCode}&code_verifier=${verifier}`;
            response = await axios.post(accessTokenURL, bodyFormData, {headers: headers})
        }
        if(response.status < 200 || response.status > 399) {
            console.error("access token call returned " + response.status);
            return null;
        }
        if("access_token" in response.data) {
            frToken.bearerToken = response.data.access_token;
            return "";
        } else {
            console.error("can't get access token");
            return null;
        }
    } catch(e) {
        console.error("error getting access token - ");
        return null;
    }
}


async function GetTokens(frToken) {
    let credsFromParameters = true;
    // if username/password on cli are empty, try to read from connections.json
    if(frToken.username == null && frToken.password == null) {
        credsFromParameters = false;
        const conn = utils.GetConnection(frToken.tenant);
        frToken.tenant = conn.tenant;
        frToken.username = conn.username;
        frToken.password = conn.password;
    }
    await Authenticate(frToken);
    // console.log("Session token: " + frToken.cookieValue);
    if(frToken.cookieValue && !frToken.bearerToken && (frToken.deploymentType == "Cloud" || frToken.deploymentType == "ForgeOps")) {
        await GetAccessToken(frToken)
        // console.log("Bearer token: " + frToken.bearerToken);
    }
    if(frToken.cookieValue && credsFromParameters) {
        // valid cookie, which means valid username/password combo. Save it in connections.json
        utils.SaveConnection(frToken);
        return true;
    } else if(!frToken.cookieValue) {
        return false;
    }
    return true;
}

// module.exports.Authenticate = Authenticate;
// module.exports.GetAccessToken = GetAccessToken;
module.exports.GetTokens = GetTokens;
