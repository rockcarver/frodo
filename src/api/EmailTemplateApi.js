import { generateIdmApi } from './BaseApi.js';
import { getTenantURL } from './utils/ApiUtils.js';
import util from 'util';
import storage from '../storage/SessionStorage.js';

const emailTemplateURLTemplate = "%s/openidm/config/emailTemplate/%s"

export async function getEmailTemplate(id) {
    try {
        const urlString = util.format(emailTemplateURLTemplate, getTenantURL(storage.session.getTenant()), id);
        const response = await generateIdmApi().get(urlString);
        if (response.status < 200 || response.status > 399) {
            console.error("getEmailTemplate ERROR: get email template data call returned %d, possible cause: email template not found", response.status);
            return null;
        }
        return response.data;
    } catch (e) {
        console.error("getEmailTemplate ERROR: get email template data error - ", e.message);
        return null;
    }
}

export async function putEmailTemplate(id, longid, data) {
    try {
        const urlString = util.format(emailTemplateURLTemplate, getTenantURL(session.storage.getTenant()), id);
        const response = await generateIdmApi().put(urlString, data);
        if (response.status < 200 || response.status > 399) {
            console.error(`putEmailTemplate ERROR: put template call returned ${response.status}, details: ${response}`);
            return null;
        }
        if (response.data._id != longid) {
            console.error(`putEmailTemplate ERROR: generic error importing template ${id}`);
            return null;
        }
        return "";
    } catch (e) {
        // if(e.response.status == 409) {
        //     console.error("PutEmailTemplateData ERROR: template with name [%s] already exists, using renaming policy... <name> => <name - imported (n)>", data.name);
        //     let newName = utils.ApplyRenamingPolicy(data.name);
        //     //console.log(newName);
        //     console.log("Trying to save script as %s", newName);
        //     data.name = newName;
        //     putScriptData(id, data);
        //     return "";
        // }
        console.error(`putEmailTemplate ERROR: template ${id} - ${e.message}`);
        return null;
    }
}
