import { getApiConfig } from "../../src/api/utils/getApiConfig";
import { state } from "../../src/storage/state";

state.host = 'https://openam-frodo.example.com';
state.realm = '/alpha';

test('should get api config', () => {
    const result = getApiConfig({ resourcePath: '/authentication/authenticationtrees', state });

    // https://openam-fr-adamcrockett.forgeblocks.com/am/json/realms/root/realms/alpha/realm-config/authentication/authenticationtrees
    expect(result).toEqual({
        path: '/realms/alpha/authentication/authenticationtrees',
        apiVersion: 'protocol=2.0,resource=1.0',
    })
});