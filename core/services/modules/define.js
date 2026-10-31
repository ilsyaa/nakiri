/**
 * Helper function to define a Nakiri feature module with strong typing and autocompletion.
 *
 * Returns the module definition directly at runtime without any mutations or overhead.
 *
 * @template T
 * @param {T} module
 * @returns {T}
 */
export function defineModule(module) {
  return module;
}

export default defineModule;
