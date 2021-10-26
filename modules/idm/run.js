const axios = require('axios');
const util = require('util');
const utils = require('../../utils.js')

const idmAllConfigURLTemplate = "%s/openidm/config";
const idmConfigURLTemplate = "%s/openidm/config/%s";

async function GetAllConfigEntities(frToken) {
    const headers = {
        "Authorization": "Bearer " + frToken.bearerToken
    };
    try {
        const jURL = util.format(idmAllConfigURLTemplate, utils.GetTenantURL(frToken.tenant));
        // console.log(jURL)
        const response = await axios.get(jURL, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error("GetAllConfigEntities ERROR: get config entities call returned %d, possible cause: email template not found", response.status);
            return null;
        }
        return response.data;
    } catch(e) {
        console.error("GetAllConfigEntities ERROR: get config entities data error - ", e.message);
        return null;
    }
}

async function GetConfigEntity(frToken, id) {
    const headers = {
        "Authorization": "Bearer " + frToken.bearerToken
    };
    try {
        const jURL = util.format(idmConfigURLTemplate, utils.GetTenantURL(frToken.tenant), id);
        // console.log(jURL)
        const response = await axios.get(jURL, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error("GetConfigEntity ERROR: get config entities call returned %d, possible cause: email template not found", response.status);
            return null;
        }
        return response.data;
    } catch(e) {
        if(e.response.data.code == 403 && e.response.data.message == "This operation is not available in ForgeRock Identity Cloud.") {
            // ignore errors related to forbidden responses from ID Cloud
            return null;
        }
        console.error("GetConfigEntity ERROR: get config entities data error - ", e);
        return null;
    }
}

module.exports.GetConfigEntity = GetConfigEntity;
module.exports.GetAllConfigEntities = GetAllConfigEntities;
