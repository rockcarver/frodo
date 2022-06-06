import {
  convertArrayToBase64Script,
  convertBase64ScriptToArray,
  saveToFile,
  validateImport,
  checkTargetCompatibility
} from '../../../src/ops/utils/ExportImportUtils'
import { resolve } from 'path';
import { rmSync, existsSync, readFileSync } from 'fs';
// Warning! implimentation file contains non determinisitc functions which are either; not reasonable to test or imposible
// Cause: date based non overidable functions
// Not tested: getCurrentTimestamp

const FS_TMP_DIR = resolve('.', 'test', 'fs_tmp');
const PATH_TO_ARTIFACT = resolve(FS_TMP_DIR, 'export.json');


test('convertBase64ScriptToArray returns an array of script lines in base64 encoding', () => {
  // Arrange
  const originalScript = `
    function frodo() {
      return 'ring to mt doom';
    }
  `;
  const base64Script = Buffer.from(originalScript).toString('base64');
  // Act
  const result = convertBase64ScriptToArray(base64Script);
  // Assert
  expect(result).toEqual(originalScript.split('\n'));
});

test('convertArrayToBase64Script', () => {
  // Arrange
  const originalArrayOfScriptLines = `
    function frodo() {
      return 'ring to mt doom';
    }
  `;
  const expected = Buffer.from(originalArrayOfScriptLines).toString('base64');
  // Act
  const result = convertArrayToBase64Script(originalArrayOfScriptLines.split('\n'));
  // Assert
  expect(result).toEqual(expected);
});

test('validateImport should always return true', () => {
  expect(validateImport()).not.toBe(false);
})

// This function has no way to determine when its asnyc task is complete, suggest using callback or promises to allow for testing
describe.skip('file system based tests', () => {

  afterAll(() => {
    if (existsSync(PATH_TO_ARTIFACT)) {
      rmSync(PATH_TO_ARTIFACT);
    }
  });
  

  test('saveToFile should save a file to specified tmp directory with expected data format', async () => {
    // Arrange
    const id = `id-3021`;
    const data = [
      {
        id,
        location: 'The Shire',
        character: 'Gandalf',
        words: 1064 
      }
    ];

    const expected = {
      lotr: {
        'id-3021': {
          id: 'id-3021',
          location: 'The Shire',
          character: 'Gandalf',
          words: 1064
        }
      }
    };
    // Act
    // saveToFile('lotr', data, 'id', PATH_TO_ARTIFACT);
    const resultingJSON = JSON.parse(readFileSync(PATH_TO_ARTIFACT));
    // Assert
    expect(resultingJSON.lotr).toEqual(expected.lotr);
  });

  
  test('saveToFile should save a file with metadata', async () => {
    // Arrange
    const id = `id-3021`;
    const data = [
      {
        id,
        location: 'The Shire',
        character: 'Gandalf',
        words: 1064 
      }
    ];
    // Act
    saveToFile('lotr', data, 'id', PATH_TO_ARTIFACT);
    const resultingJSON = JSON.parse(readFileSync(PATH_TO_ARTIFACT));
    // Assert
    expect(Object.keys(resultingJSON.meta)).toEqual([
      'origin',
      'exportedBy',
      'exportDate',
      'exportTool',
      'exportToolVersion',
    ])
  });
});

test.skip('checkTargetCompatibility to be made testable', () => {
  // Arrange
  // Act
  const result = checkTargetCompatibility();
  // Assert
  expect(result).toBe("not tested yet");
});