import cp from 'child_process';
import { promisify } from 'util';

const exec = promisify(cp.exec);
const CMD = 'frodo connections list --help';
const { stdout } = await exec(CMD);

test("CLI help interface for 'list' Usage should be expected english", async () => {
    // Arrange
    const expected = `
        Usage: frodo connections list [options]
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('Usage:'))
        .trim();
    // Assert
    expect(connectionsEntry).toBe(expected);
});

test("CLI help interface 'connections List' description at line 2 should be expected english", async () => {
    // Arrange
    const expected = `
        List configured connections.
    `.trim();
    // Act
    const connectionsEntry = stdout
        .split(/\n/)
        .map(line => line.trim())
        .at(2)
    // Assert
    expect(connectionsEntry).toBe(expected);
});