import CryptoJS from "crypto-js";

const secretKey = "mySecretKey123"; // Use a stronger key in production

// Function to encrypt data (supports strings and objects)
export const encryptData = (data) => {
  const stringData = typeof data === "string" ? data : JSON.stringify(data); // Ensure data is a string
  return CryptoJS.AES.encrypt(stringData, secretKey).toString();
};

// Function to decrypt data
export const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

  try {
    return JSON.parse(decryptedData); // Try to parse it as JSON
  } catch (e) {
    return decryptedData; // If it's not JSON, return as plain string
  }
};
