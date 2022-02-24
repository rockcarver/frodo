import cp from 'child_process';
import { promisify } from 'util';

const exec = promisify(cp.exec);
const CMD = 'frodo --help';
const { stdout } = await exec('frodo --help');

test("CLI man page 'connections' description should be expected english", async () => {
    // Arrange
    const expectedDescription = `
        connections                              Manage connection profiles.
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('connections'))
        .trim();
    // Assert
    expect(connectionsEntry).toBe(expectedDescription);
});

test("CLI man page 'info' description should be expected english", async () => {
    // Arrange
    const expectedDescription = `
        info [options] <host> [user] [password]  Print versions and tokens.
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('info'))
        .trim();
    // Assert
    expect(connectionsEntry).toBe(expectedDescription);
});

test("CLI man page 'journey' description should be expected english", async () => {
    // Arrange
    const expectedDescription = `
        journey                                  Manage journeys/trees.
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('journey'))
        .trim();
    // Assert
    expect(connectionsEntry).toBe(expectedDescription);
});

test("CLI man page 'script' description should be expected english", async () => {
    // Arrange
    const expectedDescription = `
        script                                   Manage scripts.
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('script'))
        .trim();
    // Assert
    expect(connectionsEntry).toBe(expectedDescription);
});

test("CLI man page 'idm' description should be expected english", async () => {
    // Arrange
    const expectedDescription = `
        idm                                      Manage IDM configuration.
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('idm'))
        .trim();
    // Assert
    expect(connectionsEntry).toBe(expectedDescription);
});


test("CLI man page 'logs' description should be expected english", async () => {
    // Arrange
    const expectedDescription = `
        logs <host>                              View Identity Cloud logs.
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('logs'))
        .trim();
    // Assert
    expect(connectionsEntry).toBe(expectedDescription);
});