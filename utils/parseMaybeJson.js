export function parseMaybeJSON(field) {
    if (!field) return null;

    // If it's already an object with salt, iv, ciphertext
    if (
      typeof field === "object" &&
      "salt" in field &&
      "iv" in field &&
      "ciphertext" in field
    ) {
      return field;
    }

    // If it's a string (likely stringified JSON)
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        if ("salt" in parsed && "iv" in parsed && "ciphertext" in parsed) {
          return parsed;
        }
      } catch (err) {
        console.warn("Failed to parse encrypted field:", field, err);
        return null;
      }
    }

    // Otherwise, return null so Edge Function skips it safely
    return null;
  }