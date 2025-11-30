import { EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env";

const ENCRYPT_URL = "https://ubjzyfxedngrsewkaccy.supabase.co/functions/v1/encrypt";
const DECRYPT_URL = "https://ubjzyfxedngrsewkaccy.supabase.co/functions/v1/decrypt";

export const encryptData = async (plainText) => {
  // --- 1. ENCRYPT ---
  const encryptRes = await fetch(ENCRYPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${EXPO_PUBLIC_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ text: plainText })
  });
  const encrypted = await encryptRes.json();

  return encrypted
};

export const decryptData = async (payload) => {
    // If payload is null or undefined, return empty string
  if (!payload) return "";

  try {
    // Parse payload if it's a JSON string
    const { salt, iv, ciphertext } =
      typeof payload === "string" ? JSON.parse(payload) : payload;

    // Check if all required fields exist
    if (!salt || !iv || !ciphertext) {
      console.error("Invalid payload for decryption:", payload);
      return "";
    }

    // Call your Edge function to decrypt
    const decryptRes = await fetch(DECRYPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ salt, iv, ciphertext })
    });

    const decrypted = await decryptRes.json();

    // Ensure the response has plaintext
    if (!decrypted?.plaintext) {
      console.error("Decryption failed, invalid response:", decrypted);
      return "";
    }

    return decrypted.plaintext;
  } catch (err) {
    console.error("Decryption error:", err, "Payload:", payload);
    return "";
  }
};
