import cp from 'child_process';
import { promisify } from 'util';
import { crudeMultilineTakeUntil, collapseWhitespace } from '../../test_util_interface';

const exec = promisify(cp.exec);
const CMD = 'frodo journey describe --help';
const { stdout } = await exec(CMD);

test("CLI help interface for 'journey describe' Usage should be expected english", async () => {
    // Arrange
    const expected = `
        Usage: frodo journey describe [options] [host] [realm] [user] [password]
    `.trim();
    // Act
    const testLine = stdout
        .split(/\n/)
        .find(line => line.trim().startsWith('Usage:'))
        .trim();
    // Assert
    expect(testLine).toBe(expected);
});


test("CLI help interface 'journey' description at line 2 should be expected english", async () => {
    // Arrange
    const expected = `
        If -h is supplied, describe the journey/tree indicated by -t, or all journeys/trees in the realm if no -t is supplied, otherwise describe the journey/tree export file indicated by -f.
    `.trim();
    // Act
    const testLine = stdout
        .split(/\n/)
        .map(line => line.trim())
        .at(2)
    // Assert
    expect(testLine).toBe(expected);
});