import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath, applyNameCollisionPolicy } from './utils/ApiUtils.js';
import util from 'util';
import storage from '../storage/SessionStorage.js';

const scriptURLTemplate = "%s/json%s/scripts/%s";
const scriptListURLTemplate = "%s/json%s/scripts?_queryFilter=true";
const scriptQueryURLTemplate = "%s/json%s/scripts?_queryFilter=name+eq+%%22%s%%22";
const apiVersion = 'protocol=2.0,resource=1.0';
const getApiConfig = () => {
    const configPath = getCurrentRealmPath();
    return {
        path: `${configPath}/authentication/authenticationtrees`,
        apiVersion,
    };
};

export async function listScripts() {
    try {
        const urlString = util.format(scriptListURLTemplate, storage.session.getTenant(), getCurrentRealmPath());
        const response = await generateAmApi(getApiConfig()).get(
            urlString,
            { withCredentials: true }
        );
        if (response.status < 200 || response.status > 399) {
            console.error("listScripts ERROR: list scripts structure call returned %d, possible cause: scripts not found", response.status);
            return null;
        }
        return response.data.result;
    } catch (e) {
        console.error("listScripts ERROR: list script structure error - ", e);
        return null;
    }
}

export async function getScriptByName(name) {
    try {
        const urlString = util.format(scriptQueryURLTemplate, storage.session.getTenant(), getCurrentRealmPath(), name);
        const response = await generateAmApi(getApiConfig()).get(
            urlString,
            { withCredentials: true }
        );
        if (response.status < 200 || response.status > 399) {
            console.error("getScriptByName ERROR: get script structure call returned %d, possible cause: script not found", response.status);
            return null;
        }
        return response.data.result;
    } catch (e) {
        console.error("getScriptByName ERROR: get script structure error - ", e.message);
        return null;
    }
}

export async function getScript(id) {
    try {
        const urlString = util.format(scriptURLTemplate, storage.session.getTenant(), getCurrentRealmPath(), id);
        const response = await generateAmApi(getApiConfig()).get(
            urlString,
            { withCredentials: true }
        );
        if (response.status < 200 || response.status > 399) {
            console.error("getScript ERROR: get script structure call returned %d, possible cause: script not found", response.status);
            return null;
        }
        return response.data;
    } catch (e) {
        console.error("getScript ERROR: get script structure error - ", e.message);
        return null;
    }
}

export async function putScript(id, data) {
    try {
        const urlString = util.format(scriptURLTemplate, storage.session.getTenant(), getCurrentRealmPath(storage.session.getRealm()), id);
        const response = await generateAmApi(getApiConfig()).put(
            urlString,
            data,
            { withCredentials: true }
        );
        if (response.status < 200 || response.status > 399) {
            console.error(`putScript ERROR: put script call returned ${response.status}, details: ${response}`);
            return null;
        }
        if (response.data._id != id) {
            console.error(`putScript ERROR: generic error importing script ${id}`);
            return null;
        }
        return "";
    } catch (e) {
        if (e.response.status == 409) {
            console.error("putScript WARNING: script with name [%s] already exists, using renaming policy... <name> => <name - imported (n)>", data.name);
            let newName = applyNameCollisionPolicy(data.name);
            //console.log(newName);
            console.log("Trying to save script as %s", newName);
            data.name = newName;
            putScript(id, data);
            return "";
        }
        console.error(`putScript ERROR: put script error, script ${id} - ${e.message}`);
        return null;
    }
}
