import { AuthSystem } from './AuthSystem';

// Export for ES6
export { AuthSystem };
export default AuthSystem;

// CommonJS compatibility for environments that do not support ES6 import/export
if (typeof module !== 'undefined' && module.exports) {
  if (typeof exports === 'object' && typeof module.exports === 'object') {
    module.exports = AuthSystem;
  }
  module.exports.default = AuthSystem;
  module.exports.AuthSystem = AuthSystem;
}
