import { encode, decode } from '../../../src/api/utils/Base64URL';

test('should encode base64url', () => {
  // Arrange
  const URL = 'https://fr.fr?key=value&something=else';
  const EXPECTED = 'aHR0cHM6Ly9mci5mcj9rZXk9dmFsdWUmc29tZXRoaW5nPWVsc2U';
  // Act
  const encoded = encode(URL);
  // Assert
  expect(encoded).toBe(EXPECTED);
});


test('should decode base64url to UInt8 array', () => {
  // Arrange
  const URL = 'aHR0cHM6Ly9mci5mcj9rZXk9dmFsdWUmc29tZXRoaW5nPWVsc2U';
  const EXPECTED = new TextEncoder().encode('https://fr.fr?key=value&something=else');
  // Act
  const decoded = decode(URL);
  // Assert
  expect(new Uint8Array(decoded)).toEqual(EXPECTED);
});