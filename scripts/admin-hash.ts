import { stdin, stdout } from "node:process";

import { hashPassword } from "../lib/security/crypto";

/*
 * npm run admin:hash — asks for the admin password (typing is hidden) and
 * prints its scrypt hash for ADMIN_PASSWORD_HASH. The password itself is
 * never stored or printed.
 */
async function readHidden(prompt: string) {
  stdout.write(prompt);
  stdin.setRawMode?.(true);
  stdin.resume();
  let value = "";
  for await (const chunk of stdin) {
    for (const char of String(chunk)) {
      if (char === "\r" || char === "\n") {
        stdin.setRawMode?.(false);
        stdout.write("\n");
        return value;
      }
      if (char === "\u0003") process.exit(1);
      if (char === "\u007f") value = value.slice(0, -1);
      else value += char;
    }
  }
  return value;
}

const password = await readHidden("Admin password (min 12 characters): ");
if (password.length < 12) {
  console.error("Too short. Use at least 12 characters.");
  process.exit(1);
}
stdout.write(`\nADMIN_PASSWORD_HASH=${await hashPassword(password)}\n`);
process.exit(0);
