import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { InternalServerErrorException } from "@nestjs/common";

function encryptionKey(value = process.env.DARAJA_ENCRYPTION_KEY) {
  const key = value ? Buffer.from(value, "base64") : Buffer.alloc(0);
  if (key.length !== 32) {
    throw new InternalServerErrorException("DARAJA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }
  return key;
}

export function encryptDarajaSecret(plaintext: string, keyValue?: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(keyValue), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function decryptDarajaSecret(encrypted: string, keyValue?: string) {
  const [ivValue, tagValue, ciphertextValue, ...extra] = encrypted.split(".");
  if (!ivValue || !tagValue || !ciphertextValue || extra.length > 0) {
    throw new InternalServerErrorException("Stored Daraja credentials are invalid.");
  }
  const key = encryptionKey(keyValue);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    throw new InternalServerErrorException("Stored Daraja credentials could not be decrypted.");
  }
}
