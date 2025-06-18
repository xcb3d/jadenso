/**
 * Simple encryption/decryption utilities for client-server communication
 */

// Convert string to base64
export function encodeBase64(text: string): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    return btoa(unescape(encodeURIComponent(text)));
  } else {
    // Node.js environment
    return Buffer.from(text).toString('base64');
  }
}

// Convert base64 to string
export function decodeBase64(base64: string): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    return decodeURIComponent(escape(atob(base64)));
  } else {
    // Node.js environment
    return Buffer.from(base64, 'base64').toString();
  }
}

// XOR encryption with a key
export function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Generate a pseudo-random key based on timestamp
export function generateKey(seed = ''): string {
  const timestamp = new Date().getTime().toString();
  const base = timestamp + seed;
  let hash = 0;
  
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate a string from the hash
  const key = Math.abs(hash).toString(36) + timestamp.slice(-6);
  return key;
}

// Encrypt data
export function encrypt(data: unknown, customKey?: string): { encrypted: string, key: string } {
  const key = customKey || generateKey();
  const jsonString = JSON.stringify(data);
  const encrypted = encodeBase64(xorEncrypt(jsonString, key));
  return { encrypted, key };
}

// Decrypt data
export function decrypt(encrypted: string, key: string): unknown {
  try {
    const decrypted = xorEncrypt(decodeBase64(encrypted), key);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
} 