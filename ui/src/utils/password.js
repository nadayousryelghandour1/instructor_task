// No look-alike characters (I, l, O, 0, 1) so a password can be read out or typed by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*?";

export function generatePassword(length = 16) {
  // Rejection sampling keeps every character equally likely.
  const limit = 256 - (256 % ALPHABET.length);
  const chars = [];
  while (chars.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < limit && chars.length < length) chars.push(ALPHABET[byte % ALPHABET.length]);
    }
  }
  return chars.join("");
}
