// test-encryption.js
import 'dotenv/config';
const ANON_KEY = process.env.ANON_KEY

// CHANGE THESE TO YOUR SUPABASE EDGE FUNCTION URLs
const ENCRYPT_URL = "https://ubjzyfxedngrsewkaccy.supabase.co/functions/v1/encrypt";
const DECRYPT_URL = "https://ubjzyfxedngrsewkaccy.supabase.co/functions/v1/decrypt";


async function test() {
  const text = "Mami oni";

  console.log("🔹 Sending plaintext:", text);

  // --- 1. ENCRYPT ---
  const encryptRes = await fetch(ENCRYPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({ text })
  });

  const encrypted = await encryptRes.json();
  console.log("\n🔐 Encrypted Output:", encrypted);

  const { salt, iv, ciphertext } = encrypted;

  // --- 2. DECRYPT ---
  const decryptRes = await fetch(DECRYPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      salt,
      iv,
      ciphertext
    })
  });

  const decrypted = await decryptRes.json();

  console.log("\n🔓 Decrypted Output:", decrypted);
}

test().catch(err => {
  console.error("❌ Test Error:", err);
});
