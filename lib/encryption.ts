import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Derives a 32-byte encryption key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(password: string, salt: string): Promise<Uint8Array> {
  console.log('[ENCRYPTION] deriveKeyFromPassword called');
  console.log('[ENCRYPTION] crypto.subtle available:', !!crypto?.subtle);
  console.log('[ENCRYPTION] window.isSecureContext:', window.isSecureContext);
  
  if (!crypto || !crypto.subtle) {
    throw new Error('Web Crypto API not available. Site must be accessed via HTTPS.');
  }
  
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  console.log('[ENCRYPTION] Starting PBKDF2 key derivation...');
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey']),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  console.log('[ENCRYPTION] Key derivation complete, exporting...');
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const result = new Uint8Array(rawKey);
  console.log('[ENCRYPTION] ✅ Key exported successfully, length:', result.length);
  return result;
}

/**
 * Encrypts a string using XSalsa20-Poly1305
 */
export function encryptData(data: string, key: Uint8Array): string {
  const nonce = nacl.randomBytes(24);
  const message = new TextEncoder().encode(data);
  
  const encrypted = nacl.secretbox(message, nonce, key);
  
  if (!encrypted) {
    throw new Error('Encryption failed');
  }

  // Combine nonce + encrypted data and encode to base64
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);

  return encodeBase64(combined);
}

/**
 * Decrypts a string encrypted with encryptData
 */
export function decryptData(encryptedData: string, key: Uint8Array): string {
  try {
    const combined = decodeBase64(encryptedData);
    
    // Extract nonce and ciphertext
    const nonce = combined.slice(0, 24);
    const ciphertext = combined.slice(24);

    const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
    
    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypts an object by converting to JSON
 */
export function encryptObject<T>(obj: T, key: Uint8Array): string {
  const json = JSON.stringify(obj);
  return encryptData(json, key);
}

/**
 * Decrypts an object by parsing JSON
 */
export function decryptObject<T>(encryptedData: string, key: Uint8Array): T {
  const json = decryptData(encryptedData, key);
  return JSON.parse(json) as T;
}

/**
 * Generates a random salt for key derivation
 */
export function generateSalt(): string {
  return encodeBase64(nacl.randomBytes(16));
}

