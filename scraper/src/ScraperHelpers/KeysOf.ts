/**
 * Returns a list of keys for an object
 *
 * @param {T} obj - Object to return a list of keys for
 * @returns {(keyof T)[]}
 * @example
 *    const keys = keysOf({'foo', 'bar'}) // ['foo']
 */
const keysOf = <T extends {}>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[]

export { keysOf }
