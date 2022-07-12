const encode = (input) => Buffer.from(input).toString('base64');

const decode = (input) => Buffer.from(input, 'base64');

export { decode, encode };
