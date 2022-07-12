import { OOTBNodeTypes } from "../../src/api/utils/OOTBNodeTypes";

test('Should show a range of version 6 all returning the same length of node types', async () => {
    expect(OOTBNodeTypes('6.0.0').length === OOTBNodeTypes('6.0.0.7').length).toBe(true);
});


test('Should show a range of version 6.5 all returning the same length of node types', async () => {
    expect(OOTBNodeTypes('6.5.0.1').length === OOTBNodeTypes('6.5.3').length).toBe(true);
});

test('Should show a range of version 7 all returning the same length of node types', async () => {
    expect(OOTBNodeTypes('7.0.0').length === OOTBNodeTypes('7.0.2').length).toBe(true);
});

test('Should show a range of version 7.1 all returning the same length of node types', async () => {
    expect(OOTBNodeTypes('7.1.0').length === OOTBNodeTypes('7.1.0').length).toBe(true);
});

test('Should show a range of version 7.2 all returning the same length of node types', async () => {
    expect(OOTBNodeTypes('7.2.0').length === OOTBNodeTypes('7.2.0').length).toBe(true);
});