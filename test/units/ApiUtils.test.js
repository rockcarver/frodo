import {
  applyNameCollisionPolicy,
  escapeRegExp,
  formatCurrentRealmPath,
  getRealmManagedUser,
  formatTenantURL,
  isEqualJson,
} from '../../src/api/utils/ApiUtils';
import { state } from '../../src/storage/state';

test.skip('replaceAll should be deleted because it works like native String.replaceAll', () => {
  // Arrange
  // Act
  // Assert
  expect(true).toBe(false);
});

test('formatCurrentRealmPath should prepend realmPath to specified realm', () => {
  // Arrange
  state.realm = 'alpha';
  // Act
  const testString = formatCurrentRealmPath({ state });
  // Assert
  expect(testString).toBe('/realms/alpha');
});

test('formatCurrentRealmPath should prepend realmPath to specified realm with leading slash', () => {
  // Arrange
  state.realm = '/alpha';
  // Act
  const testString = formatCurrentRealmPath({ state });
  // Assert
  expect(testString).toBe('/realms/alpha');
});

test('formatCurrentRealmPath "/" should resolve to root', () => {
  // Arrange
  state.realm = '/';
  // Act
  const testString = formatCurrentRealmPath({ state });
  // Assert
  expect(testString).toBe('/realms/root');
});

test('formatCurrentRealmPath should not handle multiple leading slash', () => {
  // Arrange
  state.realm = '//alpha';
  // Act
  const testString = formatCurrentRealmPath({ state });
  // Assert
  expect(testString).toBe('/realms//alpha');
});

test('formatCurrentRealmPath should not handle multiple leading slash', () => {
  // Arrange
  state.realm = '//alpha';
  // Act
  const testString = formatCurrentRealmPath({ state });
  // Assert
  expect(testString).toBe('/realms//alpha');
});


test.skip('formatCurrentRealmPath should not handle nested realms', () => {
  // Arrange
  state.realm = '/realms/root/realms/alpha';
  // Act
  const testString = formatCurrentRealmPath({ state });
  // Assert
  expect(testString).toBe('/realms/root/realms/alpha');
});


test('formatTenantURL should parse the https protocol and the hostname', () => {
  // Arrange
  state.host =
    'https://example.frodo.com/am/ui-admin/#realms/%2Falpha/dashboard';

  // Act
  const parsed = formatTenantURL({ state });

  // Assert
  expect(parsed).toBe('https://example.frodo.com');
});

test('formatTenantURL should not validate protocol', () => {
  // Arrange
  state.host = 'ftp://example.frodo.com/am/ui-admin/#realms/%2Falpha/dashboard';
  // Act
  const parsed = formatTenantURL({ state });
  // Assert
  expect(parsed).toBe('ftp://example.frodo.com');
});

test('formatTenantURL Invalid URL should throw', () => {
  // Arrange
  state.host = '//:example.frodo.com/am/ui-admin/#realms/%2Falpha/dashboard';
  // Act
  const trap = () => {
    formatTenantURL({ state });
  };
  // Assert
  expect(trap).toThrow('Invalid URL');
});

test('applyNameCollisionPolicy should format correctly', () => {
  // Arrange
  const NAME = 'hello';
  const EXPECTED = 'hello - imported (1)';
  // Act
  const result = applyNameCollisionPolicy(NAME);
  // Assert
  expect(result).toBe(EXPECTED);
});

test('applyNameCollisionPolicy undefined name throws', () => {
  // Act
  const trap = () => {
    applyNameCollisionPolicy(undefined);
  };
  // Assert
  expect(trap).toThrow();
});

test('applyNameCollisionPolicy blank string name does not throw', () => {
  // Arrange
  const NAME = '';
  // Act
  const trap = () => {
    applyNameCollisionPolicy(NAME);
  };
  // Assert
  expect(trap).not.toThrow();
});

test('applyNameCollisionPolicy name can have spaces', () => {
  // Arrange
  const NAME = 'hello world';
  const EXPECTED = 'hello world - imported (1)';
  // Act
  const result = applyNameCollisionPolicy(NAME);
  // Assert
  expect(result).toBe(EXPECTED);
});

test('escapeRegExp should escape the Regular Expression special characters “^”, “$”, “”, “.”, “*”, “+”, “?”, “(“, “)”, “[“, “]”, “{“, “}”, and “|” in string.', () => {
  // Arrange
  const EXPECTED = /\*\?\{\}\./;
  // Act
  const result = escapeRegExp('/*?{}./');
  // Assert
  expect(result.toString()).toBe(EXPECTED.toString());
});

test.skip('getRealmManagedUser in cloud environments should return differnt value', () => {
  expect(true).toBe(true);
});

test('getRealmManagedUser in prem environments should return differnt value', () => {
  // Arrange
  state.deploymentType = 'cloud';
  state.realm = 'foxtrot';
  // Act
  const result = getRealmManagedUser({ state });
  // Assert
  expect(result).toBe('foxtrot_user');
});

test('isEqualJson should check that two json formatted strings are the same', () => {
  // Arrange
  const json1 = JSON.stringify({ frodo: 123 });
  const json2 = JSON.stringify({ frodo: 123 });
  // Act
  const result = isEqualJson(json1, json2);
  // Assert
  expect(result).toBe(true);
});

test.skip('isEqualJson should check that two json formatted strings are the same ignoring keys', () => {
  // Arrange
  const json1 = JSON.stringify({ frodo: 123, ignoreme: 0 });
  const json2 = JSON.stringify({ frodo: 123 });
  // Act
  const result = isEqualJson(json1, json2, ['ignoreme']);
  // Assert
  expect(result).toBe(true);
});
