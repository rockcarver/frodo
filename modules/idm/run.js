const axios = require('axios');
const util = require('util');
const utils = require('../../utils.js')

const idmAllConfigURLTemplate = "%s/openidm/config";
const idmConfigURLTemplate = "%s/openidm/config/%s";
const idmManagedObjectURLTemplate = "%s/openidm/managed/%s?_queryFilter=true&_fields=_id&_pageSize=10000";

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

async function QueryManagedObject(frToken, type, pageCookie) {
    const headers = {
        "Authorization": "Bearer " + frToken.bearerToken
    };
    try {
        let urlTemplate = pageCookie?idmManagedObjectURLTemplate+`&_pagedResultsCookie=${pageCookie}`:idmManagedObjectURLTemplate;
        const jURL = util.format(urlTemplate, utils.GetTenantURL(frToken.tenant), type);
        // console.log(jURL)
        const response = await axios.get(jURL, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error("QueryManagedObject ERROR: get config entities call returned %d, possible cause: email template not found", response.status);
            return null;
        }
        // console.log(response.data)
        return response.data;
    } catch(e) {
        console.log(e);
        if(e.response.data.code == 403 && e.response.data.message == "This operation is not available in ForgeRock Identity Cloud.") {
            // ignore errors related to forbidden responses from ID Cloud
            return null;
        }
        console.error("QueryManagedObject ERROR: get config entities data error - ", e);
        return null;
    }
}

async function GetCount(frToken, type) {
    let count = 0;
    let result = {
        result: [],
        resultCount: 0,
        pagedResultsCookie: null,
        totalPagedResultsPolicy: "NONE",
        totalPagedResults: -1,
        remainingPagedResults: -1
    };
    process.stdout.write("Counting..");
    do {
        result = await QueryManagedObject(frToken, type, result.pagedResultsCookie);
        count += result.resultCount;
        process.stdout.write(".")
        // count.active += result.result.filter(value => (value.accountStatus === 'active' || value.accountStatus === 'Active')).length;
    }
    while (result.pagedResultsCookie);
    console.log("");
    return count;
}

module.exports.GetConfigEntity = GetConfigEntity;
module.exports.GetAllConfigEntities = GetAllConfigEntities;
module.exports.GetCount = GetCount;