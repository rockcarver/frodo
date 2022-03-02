import fs from 'fs';
import _ from 'underscore';
import storage from '../../storage/SessionStorage.js';
import { FRODO_METADATA_ID } from '../../storage/StaticStorage.js';

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
    plainText = plainText.replaceAll("\t", "    ");
    arrayOut = plainText.split("\n");
    return arrayOut;
}

function convertArrayToBase64Script(scriptArray) {
    let joinedText = scriptArray.join("\n");
    let b64encodedScript = Buffer.from(joinedText).toString("base64");
    return b64encodedScript;
}

function validateImport(metadata) {
    return true;
}

function saveToFile(type, data, identifier, filename) {
    let exportData = {};
    exportData.meta = getMetadata();
    exportData[type] = {};
    data.forEach(element => {
        exportData[type][element[identifier]] = element;
    });
    fs.writeFile(filename, JSON.stringify(exportData, null, 2), function (err, data) {
        if (err) {
            return console.error(`ERROR - can't save ${type} to file`);
        }
    });
}

export {
    saveToFile,
    convertBase64ScriptToArray,
    convertArrayToBase64Script,
    validateImport
};