import hello from '../index';

describe('hello world', () => {
  it('returns hello world', () => expect(hello()).toEqual('Hello world'));
});
