import { state } from '../../src/storage/state.js';

test('State defaults should be', () => {
  expect(state).toEqual({
    allowInsecureConnection: false,
    amVersion: '',
    bearerToken: '',
    cookieName: '',
    cookieValue: '',
    deploymentType: 'cloud',
    frodoVersion: '1.0.0',
    tenant: '',
    logApiKey: '',
    logApiSecret: '',
    password: '',
    realm: '',
    username: '',
  });
});

test('State should change if set', () => {
  const amVersion = '6.5.2.2';
  state.amVersion = '6.5.2.2';
  expect(state).toEqual({
    allowInsecureConnection: false,
    amVersion,
    bearerToken: '',
    cookieName: '',
    cookieValue: '',
    deploymentType: 'cloud',
    frodoVersion: '1.0.0',
    tenant: '',
    logApiKey: '',
    logApiSecret: '',
    password: '',
    realm: '',
    username: '',
  });
});
