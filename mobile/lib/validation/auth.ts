export type AuthValidationResult = {
  valid: boolean;
  message?: string;
};

const GMAIL_DOMAIN = "gmail.com";

const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";

export function validateGmailEmail(email: string): AuthValidationResult {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return { valid: false, message: "Email is required." };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalized)) {
    return { valid: false, message: "Enter a valid email address." };
  }

  const [, domain] = normalized.split("@");
  if (domain !== GMAIL_DOMAIN) {
    return { valid: false, message: "Only @gmail.com addresses are allowed." };
  }

  return { valid: true };
}

export function validateAuthPassword(password: string): AuthValidationResult {
  if (!password) {
    return { valid: false, message: "Password is required." };
  }

  if (password.length < 8) {
    return { valid: false, message: PASSWORD_RULE_MESSAGE };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return { valid: false, message: PASSWORD_RULE_MESSAGE };
  }

  return { valid: true };
}

export function validateSignUpNames(
  firstName: string,
  lastName: string,
): AuthValidationResult {
  if (!firstName.trim()) {
    return { valid: false, message: "First name is required." };
  }
  if (!lastName.trim()) {
    return { valid: false, message: "Last name is required." };
  }
  return { valid: true };
}
