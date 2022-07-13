import { formatCurrentRealmPath } from './ApiUtils';

/**
 * no description provided yet
 * @param {{ resourcePath: import('../../types/ResourcePaths').ResourcePath } & import("../../types/State").WithStateParams } config
 * @returns {{ path: string, apiVersion: string }}
 */
export const getApiConfig = ({ resourcePath, state }) => {
    const apiVersion = 'protocol=2.0,resource=1.0';
    const configPath = formatCurrentRealmPath({ state });
    return {
        path: `${configPath}${resourcePath}`,
        apiVersion,
    };
};