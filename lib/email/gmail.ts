import { google } from 'googleapis';
import { encrypt, decrypt } from '@/lib/security/encryption';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

/**
 * Creates OAuth2 client for Gmail API
 */
export function createGmailOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/email/gmail/callback`
  );
}

/**
 * Gets authorization URL for Gmail OAuth
 */
export function getGmailAuthUrl(state?: string): string {
  const oauth2Client = createGmailOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state,
  });
}

/**
 * Exchanges authorization code for tokens
 */
export async function getGmailTokens(code: string) {
  const oauth2Client = createGmailOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token!,
    expiryDate: tokens.expiry_date!,
  };
}

/**
 * Refreshes expired access token
 */
export async function refreshGmailToken(encryptedRefreshToken: string): Promise<{
  accessToken: string;
  expiryDate: number;
}> {
  const oauth2Client = createGmailOAuth2Client();
  const refreshToken = decrypt(encryptedRefreshToken);

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    accessToken: credentials.access_token!,
    expiryDate: credentials.expiry_date!,
  };
}

/**
 * Gets authenticated Gmail client
 */
export async function getGmailClient(
  encryptedAccessToken: string,
  encryptedRefreshToken: string
) {
  const oauth2Client = createGmailOAuth2Client();
  const accessToken = decrypt(encryptedAccessToken);
  const refreshToken = decrypt(encryptedRefreshToken);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Lists recent messages from Gmail
 */
export async function listGmailMessages(
  encryptedAccessToken: string,
  encryptedRefreshToken: string,
  maxResults: number = 10
) {
  const gmail = await getGmailClient(encryptedAccessToken, encryptedRefreshToken);

  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox',
  });

  return response.data.messages || [];
}

/**
 * Gets a single message with full details
 */
export async function getGmailMessage(
  encryptedAccessToken: string,
  encryptedRefreshToken: string,
  messageId: string
) {
  const gmail = await getGmailClient(encryptedAccessToken, encryptedRefreshToken);

  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  return response.data;
}

/**
 * Sends an email via Gmail
 */
export async function sendGmailMessage(
  encryptedAccessToken: string,
  encryptedRefreshToken: string,
  {
    to,
    subject,
    body,
    threadId,
  }: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
  }
) {
  const gmail = await getGmailClient(encryptedAccessToken, encryptedRefreshToken);

  // Create email in RFC 2822 format
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body,
  ].join('\r\n');

  // Encode email in base64url format
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
      threadId,
    },
  });

  return response.data;
}

/**
 * Sets up Gmail push notifications
 */
export async function setupGmailWebhook(
  encryptedAccessToken: string,
  encryptedRefreshToken: string,
  topicName: string
) {
  const gmail = await getGmailClient(encryptedAccessToken, encryptedRefreshToken);

  const response = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      topicName,
      labelIds: ['INBOX'],
    },
  });

  return response.data;
}

/**
 * Parses Gmail message to extract headers and body
 */
export function parseGmailMessage(message: any) {
  const headers = message.payload.headers;

  const getHeader = (name: string) => {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  let body = '';
  let htmlBody = '';

  // Extract body from parts
  const extractBody = (parts: any[]): void => {
    for (const part of parts || []) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body.data) {
        htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        extractBody(part.parts);
      }
    }
  };

  if (message.payload.body.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  } else if (message.payload.parts) {
    extractBody(message.payload.parts);
  }

  return {
    id: message.id,
    threadId: message.threadId,
    from: getHeader('From'),
    to: getHeader('To'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    body: body || htmlBody,
    htmlBody,
  };
}
