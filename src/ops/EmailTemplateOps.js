import fs from 'fs';
import {
  EMAIL_TEMPLATE_TYPE,
  getEmailTemplate,
  getEmailTemplates,
  putEmailTemplate,
} from '../api/EmailTemplateApi.js';
import {
  createProgressBar,
  createTable,
  printMessage,
  stopProgressBar,
  updateProgressBar,
} from './utils/Console.js';
import {
  getTypedFilename,
  saveJsonToFile,
  validateImport,
} from './utils/ExportImportUtils.js';
import wordwrap from './utils/Wordwrap.js';

/**
 * Maintain the file type centrally
 */
const EMAIL_TEMPLATE_FILE_TYPE = 'template.email';

// use a function vs a template variable to avoid problems in loops
function getFileDataTemplate() {
  return {
    meta: {},
    emailTemplate: {},
  };
}

/**
 * List email templates
 * @param {boolean} long Long list format with details
 */
export async function listEmailTemplates(long = false) {
  let emailTemplates = [];
  try {
    emailTemplates = (await getEmailTemplates()).data.result;
  } catch (error) {
    printMessage(`${error.message}`, 'error');
    printMessage(error.response.data, 'error');
  }
  emailTemplates.sort((a, b) => a._id.localeCompare(b._id));
  if (!long) {
    for (const [, emailTemplate] of emailTemplates.entries()) {
      printMessage(
        `${emailTemplate._id.replace(`${EMAIL_TEMPLATE_TYPE}/`, '')}`,
        'data'
      );
    }
  } else {
    const table = createTable([
      'Id'.brightCyan,
      'Name'.brightCyan,
      'Status'.brightCyan,
      'Locale(s)'.brightCyan,
      'From'.brightCyan,
      'Subject'.brightCyan,
    ]);
    emailTemplates.forEach((emailTemplate) => {
      table.push([
        // Id
        `${emailTemplate._id.replace(`${EMAIL_TEMPLATE_TYPE}/`, '')}`,
        // Name
        `${emailTemplate.displayName ? emailTemplate.displayName : ''}`,
        // Status
        emailTemplate.enabled === false
          ? 'disabled'.brightRed
          : 'enabled'.brightGreen,
        // Locale(s)
        `${emailTemplate.defaultLocale}${
          Object.keys(emailTemplate.subject).length > 1
            ? ` (${Object.keys(emailTemplate.subject)
                .filter((locale) => locale !== emailTemplate.defaultLocale)
                .join(',')})`
            : ''
        }`,
        // From
        `${emailTemplate.from ? emailTemplate.from : ''}`,
        // Subject
        wordwrap(emailTemplate.subject[emailTemplate.defaultLocale], 40),
      ]);
    });
    printMessage(table.toString(), 'data');
  }
}

/**
 * Export a single email template to file
 * @param {string} templateId email template id
 * @param {string} file optional filename
 */
export async function exportEmailTemplateToFile(templateId, file) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(templateId, EMAIL_TEMPLATE_FILE_TYPE);
  }
  createProgressBar(1, `Exporting ${templateId}`);
  getEmailTemplate(templateId)
    .then(async (response) => {
      const templateData = response.data;
      updateProgressBar(`Writing file ${fileName}`);
      const fileData = getFileDataTemplate();
      fileData.emailTemplate[templateId] = templateData;
      saveJsonToFile(fileData, fileName);
      stopProgressBar(
        `Exported ${templateId.brightCyan} to ${fileName.brightCyan}.`
      );
    })
    .catch((err) => {
      stopProgressBar(`${err}`);
      printMessage(err, 'error');
    });
}

/**
 * Export all email templates to file
 * @param {string} file optional filename
 */
export async function exportEmailTemplatesToFile(file) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(`allEmailTemplates`, EMAIL_TEMPLATE_FILE_TYPE);
  }
  const fileData = getFileDataTemplate();
  getEmailTemplates()
    .then((response) => {
      const templates = response.data.result;
      createProgressBar(response.data.resultCount, 'Exporting email templates');
      for (const template of templates) {
        const templateId = template._id.replace(`${EMAIL_TEMPLATE_TYPE}/`, '');
        updateProgressBar(`Exporting ${templateId}`);
        fileData.emailTemplate[templateId] = template;
      }
      saveJsonToFile(fileData, fileName);
      stopProgressBar(
        `${response.data.resultCount} templates exported to ${fileName}.`
      );
    })
    .catch((err) => {
      stopProgressBar(`${err}`);
      printMessage(err, 'error');
    });
}

/**
 * Export all email templates to separate files
 */
export async function exportEmailTemplatesToFiles() {
  getEmailTemplates()
    .then((response) => {
      const templates = response.data.result;
      createProgressBar(response.data.resultCount, 'Exporting email templates');
      for (const template of templates) {
        const templateId = template._id.replace(`${EMAIL_TEMPLATE_TYPE}/`, '');
        const fileName = getTypedFilename(templateId, EMAIL_TEMPLATE_FILE_TYPE);
        const fileData = getFileDataTemplate();
        updateProgressBar(`Exporting ${templateId}`);
        fileData.emailTemplate[templateId] = template;
        saveJsonToFile(fileData, fileName);
      }
      stopProgressBar(`${response.data.resultCount} templates exported.`);
    })
    .catch((err) => {
      stopProgressBar(`${err}`);
      printMessage(err, 'error');
    });
}

/**
 * Import email template by id from file
 * @param {string} templateId email template id
 * @param {string} file optional filename
 */
export async function importEmailTemplateFromFile(templateId, file) {
  // eslint-disable-next-line no-param-reassign
  templateId = templateId.replaceAll(`${EMAIL_TEMPLATE_TYPE}/`, '');
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      createProgressBar(1, `Importing ${templateId}`);
      if (fileData.emailTemplate[templateId]) {
        putEmailTemplate(templateId, fileData.emailTemplate[templateId])
          .then(() => {
            updateProgressBar(`Importing ${templateId}`);
            stopProgressBar(`Imported ${templateId}`);
          })
          .catch((putEmailTemplateError) => {
            stopProgressBar(`${putEmailTemplateError}`);
            printMessage(putEmailTemplateError, 'error');
          });
      } else {
        stopProgressBar(
          `Email template ${templateId.brightCyan} not found in ${file.brightCyan}!`
        );
        printMessage(
          `Email template ${templateId.brightCyan} not found in ${file.brightCyan}!`,
          'error'
        );
      }
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}

/**
 * Import all email templates from file
 * @param {string} file optional filename
 */
export async function importEmailTemplatesFromFile(file) {
  fs.readFile(file, 'utf8', async (err, data) => {
    if (err) throw err;
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      createProgressBar(
        Object.keys(fileData.emailTemplate).length,
        `Importing email templates`
      );
      for (const id in fileData.emailTemplate) {
        if ({}.hasOwnProperty.call(fileData.emailTemplate, id)) {
          const templateId = id.replaceAll(`${EMAIL_TEMPLATE_TYPE}/`, '');
          try {
            // eslint-disable-next-line no-await-in-loop
            await putEmailTemplate(
              templateId,
              fileData.emailTemplate[templateId]
            );
            updateProgressBar(`Imported ${templateId}`);
          } catch (putEmailTemplateError) {
            printMessage(`\nError importing ${templateId}`, 'error');
            printMessage(putEmailTemplateError.response.data, 'error');
          }
        }
      }
      stopProgressBar(`Done.`);
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}

/**
 * Import all email templates from separate files
 */
export async function importEmailTemplatesFromFiles() {
  const names = fs.readdirSync('.');
  const jsonFiles = names.filter((name) =>
    name.toLowerCase().endsWith(`${EMAIL_TEMPLATE_FILE_TYPE}.json`)
  );
  createProgressBar(jsonFiles.length, 'Importing email templates...');
  let total = 0;
  let totalErrors = 0;
  for (const file of jsonFiles) {
    const data = fs.readFileSync(file, 'utf8');
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      total += Object.keys(fileData.emailTemplate).length;
      let errors = 0;
      for (const id in fileData.emailTemplate) {
        if ({}.hasOwnProperty.call(fileData.emailTemplate, id)) {
          const templateId = id.replaceAll(`${EMAIL_TEMPLATE_TYPE}/`, '');
          try {
            // eslint-disable-next-line no-await-in-loop
            await putEmailTemplate(
              templateId,
              fileData.emailTemplate[templateId]
            );
          } catch (putEmailTemplateError) {
            errors += 1;
            printMessage(`\nError importing ${templateId}`, 'error');
            printMessage(putEmailTemplateError.response.data, 'error');
          }
        }
      }
      totalErrors += errors;
      updateProgressBar(`Imported ${file}`);
    } else {
      printMessage(`Validation of ${file} failed!`, 'error');
    }
  }
  stopProgressBar(
    `Imported ${total - totalErrors} of ${total} email template(s) from ${
      jsonFiles.length
    } file(s).`
  );
}

/**
 * Import first email template from file
 * @param {string} file optional filename
 */
export async function importFirstEmailTemplateFromFile(file) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      createProgressBar(1, `Importing first email template`);
      for (const id in fileData.emailTemplate) {
        if ({}.hasOwnProperty.call(fileData.emailTemplate, id)) {
          putEmailTemplate(
            id.replaceAll('emailTemplate/', ''),
            fileData.emailTemplate[id]
          )
            .then(() => {
              updateProgressBar(`Imported ${id}`);
              stopProgressBar(`Imported ${id}`);
            })
            .catch((putEmailTemplateError) => {
              stopProgressBar(`Error importing email template ${id}`);
              printMessage(`\nError importing email template ${id}`, 'error');
              printMessage(putEmailTemplateError.response.data, 'error');
            });
          break;
        }
      }
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}
