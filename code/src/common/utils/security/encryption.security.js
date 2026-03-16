import crypto from "node:crypto";
import { ENC_SECRET_KEY, IV_LENGTH } from "../../../../config/config.js";

// const IV_LENGTH = 16; // initialized vector length  16*2=size of ENCRYPTION_SECRET_KEY

// const ENCRYPTION_SECRET_KEY = Buffer.from(ENC_BYTE); //must be 32 byte hexdecimal 2*16 256 bit

export const generateEncryption =async (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);   //32 BUFFER
  
  const cipher = crypto.createCipheriv("aes-256-cbc",ENC_SECRET_KEY,iv);

  let encryptedData = cipher.update(text, "utf-8", "hex"); //text=>utf-8 key=>hex

  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};

export const generateDecryption = async(encryptedData) => {
  const [iv, encryptedText] = encryptedData.split(":") || [] // []

  const binaryLikeIv = Buffer.from(iv, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc",ENC_SECRET_KEY,binaryLikeIv);

  let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};
