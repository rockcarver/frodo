import DataProtection from '../../../src/ops/utils/DataProtection';

test('DataProtection to encrypt', async () => {
  // Note this test checks that encyption happned not that encryption is correct
  // this test relys on other tests to proove the likelyhood of successful encryption
  // Arrange
  const dp = new DataProtection();
  const EXPECTED = 'aMLtCqK1b+d3d88DDKrmIV7A6pifP77IItLKX7N7/UTOPxf8YCQWHCpTrmNnM5wNXue8HllEFIS+sxXRb20oCb4HImpbQM0so5DrHIqcIlF5LYDKjvzBOz1PdlclhIuIV+Gr8M3GRbNkQxXJuUZ4th5ISLpOjM+k8bDAlnHsRx5LLlbLFnAKq8Pu9DaTYUkZABOCOjfkoTb6re1p9c7xE2pAe213';
  const originalString = 'Go not to the Elves for counsel, for they will say both no and yes.';
  // Act
  const RESULT = await dp.encrypt(originalString); 
  // Assert
  expect(RESULT.length).toBe(EXPECTED.length);
});

test('DataProtection to decrypt', async () => {
  // Arrange
  const dp = new DataProtection();
  const originalString = 'Go not to the Elves for counsel, for they will say both no and yes.';
  // Act
  const encrypted = await dp.encrypt(originalString); 
  const RESULT = await dp.decrypt(encrypted); 
  // Assert
  expect(RESULT).toBe(originalString);
});