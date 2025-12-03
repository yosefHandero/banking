# Security Considerations

## SSN Storage

**⚠️ CRITICAL SECURITY WARNING**

The application currently stores Social Security Numbers (SSN) in **plain text** in the database. This is a **serious security risk** and must be addressed before production deployment.

### Current Implementation

SSN values are stored directly in the `USERS` collection without encryption. This means:
- SSNs are visible to anyone with database access
- SSNs are transmitted over the network in plain text
- SSNs appear in logs and error messages
- Compliance violations (PCI-DSS, GDPR, etc.)

### Recommended Solution

Before deploying to production, implement SSN encryption:

1. **Use Field-Level Encryption**
   - Encrypt SSN before storing in database
   - Use AES-256 encryption with a secure key management system
   - Store encryption keys in a secure key vault (AWS KMS, Azure Key Vault, etc.)

2. **Implementation Example**

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SSN_ENCRYPTION_KEY; // Must be 32 bytes for AES-256
const ALGORITHM = 'aes-256-gcm';

function encryptSSN(ssn: string): string {
  if (!ssn) return '';
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'hex'), iv);
  
  let encrypted = cipher.update(ssn, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return IV + AuthTag + Encrypted data (all hex encoded)
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decryptSSN(encryptedSSN: string): string {
  if (!encryptedSSN) return '';
  
  const parts = encryptedSSN.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

3. **Additional Security Measures**
   - Never log SSN values
   - Mask SSN in UI (show only last 4 digits: XXX-XX-1234)
   - Use HTTPS/TLS for all network communication
   - Implement access controls (only authorized users can view SSN)
   - Regular security audits
   - Consider using a dedicated PII encryption service

4. **Compliance**
   - Ensure compliance with relevant regulations (GDPR, CCPA, PCI-DSS)
   - Implement data retention policies
   - Provide data deletion capabilities
   - Document encryption procedures

### Current Status

- ❌ SSN encryption: **NOT IMPLEMENTED**
- ⚠️ SSN masking in UI: **NOT IMPLEMENTED**
- ⚠️ SSN access controls: **NOT IMPLEMENTED**

### Action Items

1. [ ] Implement SSN encryption before production
2. [ ] Add SSN masking in UI components
3. [ ] Implement access controls for SSN fields
4. [ ] Add encryption key management
5. [ ] Update privacy policy and terms of service
6. [ ] Conduct security audit

---

## Other Security Considerations

### Environment Variables
- Never commit `.env.local` files
- Use secure secret management in production
- Rotate API keys regularly

### Authentication
- Session cookies are HTTP-only and secure in production
- Implement rate limiting on auth endpoints
- Consider adding 2FA/MFA for sensitive operations

### API Security
- All API routes verify authentication
- Input validation on all user inputs
- SQL injection protection (using parameterized queries via Appwrite)
- CORS properly configured

### Data Protection
- Regular backups
- Encryption at rest (configured at database level)
- Encryption in transit (HTTPS/TLS)

