/**
 * Email Validation and Formatting Utilities
 * Useful helpers for the Maple customer support platform
 */

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extracts email address from a string that might contain a name
 * Example: "John Doe <john@example.com>" => "john@example.com"
 */
export function extractEmail(emailString: string): string | null {
  const match = emailString.match(/<([^>]+)>/);
  if (match) {
    return match[1];
  }
  // If no angle brackets, check if the whole string is an email
  return isValidEmail(emailString.trim()) ? emailString.trim() : null;
}

/**
 * Formats an email address with a display name
 * Example: formatEmailWithName("john@example.com", "John Doe") => "John Doe <john@example.com>"
 */
export function formatEmailWithName(email: string, name?: string): string {
  if (!name || name.trim() === '') {
    return email;
  }
  return `${name} <${email}>`;
}

/**
 * Masks an email address for privacy (shows first 2 chars and domain)
 * Example: "john.doe@example.com" => "jo****@example.com"
 */
export function maskEmail(email: string): string {
  if (!isValidEmail(email)) {
    return email;
  }

  const [localPart, domain] = email.split('@');
  const visibleChars = Math.min(2, localPart.length);
  const masked = localPart.substring(0, visibleChars) + '****';
  return `${masked}@${domain}`;
}

/**
 * Extracts the domain from an email address
 * Example: "john@example.com" => "example.com"
 */
export function getEmailDomain(email: string): string | null {
  if (!isValidEmail(email)) {
    return null;
  }
  return email.split('@')[1];
}

/**
 * Checks if an email is from a common free email provider
 */
export function isFreeEmailProvider(email: string): boolean {
  const freeProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'mail.com',
  ];

  const domain = getEmailDomain(email);
  return domain ? freeProviders.includes(domain.toLowerCase()) : false;
}

/**
 * Normalizes an email address (lowercase, trim whitespace)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validates multiple email addresses separated by commas or semicolons
 */
export function validateEmailList(emailList: string): { valid: string[]; invalid: string[] } {
  const emails = emailList.split(/[,;]/).map(e => e.trim()).filter(e => e.length > 0);

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const email of emails) {
    if (isValidEmail(email)) {
      valid.push(normalizeEmail(email));
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid };
}

/**
 * Generates an email thread subject line with RE: prefix if needed
 */
export function formatReplySubject(originalSubject: string): string {
  const normalized = originalSubject.trim();
  const rePrefix = /^(re:|fwd:|fw:)\s*/i;

  if (rePrefix.test(normalized)) {
    return normalized;
  }

  return `Re: ${normalized}`;
}

/**
 * Extracts the first name from an email address or full name
 * Useful for personalizing automated responses
 */
export function extractFirstName(nameOrEmail: string): string {
  // Try to extract from "Name <email>" format
  const nameMatch = nameOrEmail.match(/^([^<]+)</);
  const name = nameMatch ? nameMatch[1].trim() : nameOrEmail;

  // Get first word as first name
  const firstName = name.split(/[\s@]/)[0];

  // Capitalize first letter
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

/**
 * Checks if an email subject indicates an automatic reply (Out of Office, etc.)
 */
export function isAutoReply(subject: string): boolean {
  const autoReplyKeywords = [
    'out of office',
    'automatic reply',
    'auto-reply',
    'away',
    'vacation',
    'ooo',
    'automated response',
  ];

  const lowerSubject = subject.toLowerCase();
  return autoReplyKeywords.some(keyword => lowerSubject.includes(keyword));
}
