import CryptoJS from 'crypto-js';

// Internal salt/passphrase for browser-side encryption.
// In a purely frontend app, this obfuscates the key at rest (LocalStorage).
// This prevents casual snooping or XSS scripts from easily reading "nova_global_api_key" in plain text.
const INTERNAL_SECRET = "NOVA_AI_SECURE_SALT_v1_8823_HK_2025";

export const securityService = {
  /**
   * Encrypts a plain text string using AES.
   */
  encrypt: (text: string): string => {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, INTERNAL_SECRET).toString();
  },

  /**
   * Decrypts an AES encrypted string.
   * Returns empty string if decryption fails or input is invalid.
   */
  decrypt: (cipherText: string): string => {
    if (!cipherText) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, INTERNAL_SECRET);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if (!originalText) return ''; // Decryption failure usually results in empty string here
      return originalText;
    } catch (e) {
      console.error("Security: Decryption failed", e);
      return '';
    }
  },

  /**
   * Safe storage key name
   */
  STORAGE_KEY: 'nova_secure_vault_key'
};
