import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import util from 'util';
import storage from '../storage/SessionStorage.js';

const oauthProviderServiceURLTemplate = "%s/json%s/realm-config/services/oauth-oidc";

const apiVersion = 'protocol=2.1,resource=1.0';
const getApiConfig = () => {
    const configPath = getCurrentRealmPath();
    return {
        path: `${configPath}/authentication/authenticationtrees`,
        apiVersion,
    };
};

export async function getOAuth2Provider() {
    try {
        const urlString = util.format(oauthProviderServiceURLTemplate, storage.session.getTenant(), getCurrentRealmPath());
        const response = await generateAmApi(getApiConfig()).get(
            urlString,
            { withCredentials: true }
        );
        if (response.status < 200 || response.status > 399) {
            console.error("getOAuth2Provider ERROR: get OAuth2 provider call returned %d, possible cause: service not found", response.status);
            return null;
        }
        return response.data;
    } catch (e) {
        console.error("getOAuth2Provider ERROR: get Oauth2 provider error - ", e.message);
        return null;
    }
}
