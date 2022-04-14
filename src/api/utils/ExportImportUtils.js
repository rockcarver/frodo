import fs from 'fs';
import _ from 'underscore';
import storage from '../../storage/SessionStorage.js';
import { FRODO_METADATA_ID } from '../../storage/StaticStorage.js';
import { printMessage } from './Console.js'

function getCurrentTimestamp() {
  const ts = new Date();
  return ts.toISOString();
}

function getMetadata() {
  const metadata = {
    origin: storage.session.getTenant(),
    exportedBy: storage.session.getUsername(),
    exportDate: getCurrentTimestamp(),
    exportTool: FRODO_METADATA_ID,
    exportToolVersion: storage.session.getFrodoVersion(),
  };
  return metadata;
}

function convertBase64ScriptToArray(b64text) {
  let arrayOut = [];
  let plainText = Buffer.from(b64text, 'base64').toString();
  plainText = plainText.replaceAll('\t', '    ');
  arrayOut = plainText.split('\n');
  return arrayOut;
}

function convertArrayToBase64Script(scriptArray) {
  const joinedText = scriptArray.join('\n');
  const b64encodedScript = Buffer.from(joinedText).toString('base64');
  return b64encodedScript;
}

function validateImport(metadata) {
  return true;
}

function checkTargetCompatibility(type, source, target) {
  // console.log(`source ${source}, target ${target}`);
  //   compatibilityKeys[type].forEach((element) => {
  //     if (source[element] != target[element]) {
  //       console.warn(`${element} in ${type} mismatch between source and target`);
  //     }
  //   });
}

function saveToFile(type, data, identifier, filename) {
  const exportData = {};
  exportData.meta = getMetadata();
  exportData[type] = {};
  data.forEach((element) => {
    exportData[type][element[identifier]] = element;
  });
  fs.writeFile(filename, JSON.stringify(exportData, null, 2), (err, data) => {
    if (err) {
      return printMessage(`ERROR - can't save ${type} to file`, 'error');
    }
  });
}

export {
  saveToFile,
  convertBase64ScriptToArray,
  convertArrayToBase64Script,
  validateImport,
  checkTargetCompatibility,
};
