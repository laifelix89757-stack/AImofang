
// A consistent salt for obfuscation. 
// This provides sufficient security to prevent the key from being read in plain text in the URL or LocalStorage.
const SALT = "NOVA_AI_ENTERPRISE_2025_SECURE_SALT";

export const securityService = {
  /**
   * Safe storage key name
   */
  STORAGE_KEY: 'nova_secure_vault_key',

  /**
   * Encrypts/Obfuscates a plain text string using XOR + Base64.
   * Dependency-free implementation for maximum reliability.
   */
  encrypt: (text: string): string => {
    if (!text) return '';
    try {
      const xor = text.split('').map((c, i) => 
        String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
      ).join('');
      return btoa(xor);
    } catch (e) {
      console.error("Encryption error", e);
      return '';
    }
  },

  /**
   * Decrypts/De-obfuscates the string.
   */
  decrypt: (cipherText: string): string => {
    if (!cipherText) return '';
    try {
      const xor = atob(cipherText);
      return xor.split('').map((c, i) => 
        String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
      ).join('');
    } catch (e) {
      console.error("Decryption error (key might be corrupted)", e);
      return '';
    }
  }
};
