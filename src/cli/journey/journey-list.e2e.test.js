// import { jest } from '@jest/globals';
import { spawn, spawnSync } from 'child_process';

const ansiEscapeCodes =
  // eslint-disable-next-line no-control-regex
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

beforeAll(async () => {
  // import baseline journeys and delete all other journeys
  const deleteJourneysCmd = spawnSync('frodo', [
    'journey',
    'delete',
    '--all',
    'frodo-dev',
  ]);
  if (deleteJourneysCmd.status > 0) {
    console.error(deleteJourneysCmd.stderr.toString());
    console.log(deleteJourneysCmd.stdout.toString());
  }

  const importJourneysCmd = spawnSync(
    'frodo',
    ['journey', 'import', '--all-separate', 'frodo-dev'],
    {
      cwd: `test/e2e/journey/baseline`,
    }
  );
  if (importJourneysCmd.status > 0) {
    console.error(importJourneysCmd.stderr.toString());
    console.log(importJourneysCmd.stdout.toString());
  }
});

describe('frodo journey list', () => {
  it('"frodo journey list": should list the names of the default journeys', (done) => {
    const journeyList = spawn('frodo', ['journey', 'list', 'frodo-dev']);
    const expected = [
      'ForgottenUsername',
      'Login',
      'PasswordGrant',
      'ProgressiveProfile',
      'Registration',
      'ResetPassword',
      'UpdatePassword',
      '',
    ].join('\n');

    const chunks = [];
    journeyList.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });

    journeyList.stdout.on('end', () => {
      const output = Buffer.concat(chunks).toString();
      try {
        expect(output).toBe(expected);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('"frodo journey list -l": should list the names, status, and tags of the default journeys', (done) => {
    const journeyList = spawn('frodo', ['journey', 'list', '-l', 'frodo-dev']);
    const expected = [
      'Name              │Status │Tags               ',
      'ForgottenUsername │enabled│Username Reset     ',
      'Login             │enabled│Authentication     ',
      'PasswordGrant     │enabled│                   ',
      'ProgressiveProfile│enabled│Progressive Profile',
      'Registration      │enabled│Registration       ',
      'ResetPassword     │enabled│Password Reset     ',
      'UpdatePassword    │enabled│Password Reset     ',
      '',
    ].join('\n');

    const chunks = [];
    journeyList.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });

    journeyList.stdout.on('end', () => {
      const output = Buffer.concat(chunks)
        .toString()
        .replace(ansiEscapeCodes, '');
      try {
        expect(output).toBe(expected);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('"frodo journey list --long": should list the names, status, and tags of the default journeys', (done) => {
    const journeyList = spawn('frodo', [
      'journey',
      'list',
      '--long',
      'frodo-dev',
    ]);
    const expected = [
      'Name              │Status │Tags               ',
      'ForgottenUsername │enabled│Username Reset     ',
      'Login             │enabled│Authentication     ',
      'PasswordGrant     │enabled│                   ',
      'ProgressiveProfile│enabled│Progressive Profile',
      'Registration      │enabled│Registration       ',
      'ResetPassword     │enabled│Password Reset     ',
      'UpdatePassword    │enabled│Password Reset     ',
      '',
    ].join('\n');

    const chunks = [];
    journeyList.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });

    journeyList.stdout.on('end', () => {
      const output = Buffer.concat(chunks)
        .toString()
        .replace(ansiEscapeCodes, '');
      try {
        expect(output).toBe(expected);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
