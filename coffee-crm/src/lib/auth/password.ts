import bcrypt from "bcryptjs";

/** Minimum length for a password. Shown to users when they set one. */
export const PASSWORD_MIN_LENGTH = 8;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

let dummyHash: string | undefined;
/**
 * Compare against a throwaway hash. Used when the email is unknown so that the
 * answer takes as long as a wrong password (timing doesn't reveal accounts).
 */
export async function verifyAgainstDummy(plain: string): Promise<false> {
  dummyHash ??= await bcrypt.hash("not-a-real-password", 12);
  await bcrypt.compare(plain, dummyHash);
  return false;
}
