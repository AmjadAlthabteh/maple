# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email security@yourapp.com. Do not open a public issue.

We take all security reports seriously and will respond within 48 hours.

## Security Features

### Authentication & Authorization

- **NextAuth.js**: Industry-standard authentication
- **JWT Tokens**: Secure session management with HTTP-only cookies
- **Password Hashing**: bcrypt with 12 rounds (adjustable)
- **Role-Based Access Control**: User/Admin roles with permission checks

### Data Protection

- **Encryption at Rest**: Sensitive data (API keys, tokens) encrypted using AES-256-GCM
- **Encryption in Transit**: HTTPS enforced in production
- **Database Encryption**: PostgreSQL supports transparent data encryption
- **Secure Token Storage**: OAuth tokens encrypted before database storage

### API Security

- **Rate Limiting**:
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per minute
- **Input Validation**: Zod schemas validate all input
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Protection**: React's built-in XSS protection + CSP headers
- **CSRF Protection**: SameSite cookies + state tokens for OAuth

### Email Security

- **OAuth 2.0**: Secure email account connections
- **Webhook Verification**: Signature verification for Gmail/Outlook webhooks
- **Token Refresh**: Automatic refresh of expired access tokens
- **Least Privilege**: Minimal required scopes for email access

### Payment Security

- **PCI Compliance**: Stripe handles all payment data
- **Webhook Signatures**: Verify all Stripe webhooks
- **No Card Storage**: Never store card details
- **Secure Checkout**: Stripe-hosted checkout pages

## Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` files (gitignored)
   - Use environment variables in production
   - Rotate keys regularly

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use TypeScript**
   - Type safety prevents many bugs
   - Catch errors at compile time

4. **Validate all input**
   - Use Zod schemas for API routes
   - Never trust user input

5. **Log security events**
   - Failed login attempts
   - Permission denied errors
   - Webhook failures

### For Users

1. **Use strong passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols

2. **Enable 2FA** (coming soon)
   - Additional security layer
   - Protect against compromised passwords

3. **Review connected accounts**
   - Regularly audit email connections
   - Remove unused integrations

4. **Monitor activity**
   - Check analytics for unusual patterns
   - Review AI-generated responses

## Security Headers

The application implements security headers:

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Data Privacy

### Data Collection

We collect:
- Account information (name, email)
- Email content for AI processing
- Usage analytics
- Billing information (via Stripe)

### Data Storage

- **Location**: US-East (configurable)
- **Encryption**: At rest and in transit
- **Retention**: Configurable per organization
- **Deletion**: Complete data removal on account deletion

### Third-Party Services

- **Anthropic**: AI processing (Claude API)
- **Stripe**: Payment processing
- **Google**: Email integration (Gmail)
- **Vercel**: Hosting and CDN

### GDPR Compliance

- Right to access: Export all data
- Right to deletion: Complete removal
- Data portability: JSON export
- Consent management: Clear opt-ins

## Incident Response

### In Case of Breach

1. **Immediate actions**:
   - Revoke compromised credentials
   - Rotate encryption keys
   - Notify affected users

2. **Investigation**:
   - Audit logs review
   - Root cause analysis
   - Security assessment

3. **Communication**:
   - Transparent disclosure
   - Timeline of events
   - Remediation steps

### Contact

Security team: security@yourapp.com

## Security Roadmap

- [ ] Two-factor authentication (2FA)
- [ ] Security audit logging
- [ ] IP allowlisting
- [ ] Advanced DDoS protection
- [ ] SOC 2 compliance
- [ ] Third-party security audit
- [ ] Bug bounty program

## Compliance

- **GDPR**: General Data Protection Regulation (EU)
- **CCPA**: California Consumer Privacy Act
- **SOC 2**: In progress
- **HIPAA**: Not currently compliant (don't use for healthcare)

## Updates

This security policy is reviewed quarterly and updated as needed.

Last updated: 2024-01-15
