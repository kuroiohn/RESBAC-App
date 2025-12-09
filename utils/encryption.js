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
   if (!Array.isArray(payload)) {
    console.error("decryptData expects an array");
    return [];
  }

  try {
    const res = await fetch(DECRYPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ items: payload })
    });

    const json = await res.json();

    if (!json?.data) {
      console.error("Invalid decrypt response:", json);
      return [];
    }

    return json.data; // array of decrypted results
  } catch (err) {
    console.error("decrypt error:", err);
    return [];
  }
};
