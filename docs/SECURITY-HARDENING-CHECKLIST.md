# ZEMO Security Hardening Checklist

## 🔐 Authentication & Authorization

### Password Security
- [x] Passwords hashed with bcrypt (min 10 rounds)
- [x] Password minimum length: 8 characters
- [x] Password complexity enforced (uppercase, lowercase, numbers)
- [ ] Password breach detection (Have I Been Pwned API)
- [x] Account lockout after 5 failed attempts
- [ ] Password reset token expires after 1 hour
- [ ] Old password required for password change

### Session Management
- [x] NextAuth with secure session handling
- [x] HTTP-only cookies for session tokens
- [x] Secure flag enabled in production
- [x] SameSite=Lax cookie attribute
- [ ] Session timeout after 24 hours of inactivity
- [ ] Concurrent session limit per user
- [ ] Session invalidation on password change

### Multi-Factor Authentication (Future)
- [ ] SMS-based 2FA
- [ ] Authenticator app support (TOTP)
- [ ] Backup codes generation
- [ ] Remember device for 30 days

### OAuth Security
- [x] Google OAuth configured
- [x] State parameter for CSRF protection
- [ ] Validate OAuth redirect URIs
- [ ] Scope minimization (only request needed permissions)

## 🛡️ API Security

### Input Validation
- [x] All inputs validated with Zod schemas
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (React escapes by default)
- [ ] Maximum request size limit (10MB)
- [ ] Content-Type validation
- [ ] File upload validation (type, size, content)
- [ ] Phone number validation
- [ ] Email format validation

### Rate Limiting
```javascript
// Implement rate limiting per endpoint
API Endpoint           | Rate Limit
--------------------- | -----------
/api/auth/*           | 5 req/min
/api/bookings         | 30 req/min
/api/messages         | 60 req/min
/api/search           | 100 req/min
/api/vehicles         | 50 req/min
/api/payments         | 10 req/min
```

- [ ] IP-based rate limiting
- [ ] User-based rate limiting (authenticated)
- [ ] Exponential backoff for failed attempts
- [ ] Rate limit headers in response
- [ ] Whitelist for trusted IPs

### CSRF Protection
- [x] CSRF tokens on all state-changing requests
- [x] SameSite cookie attribute
- [ ] Verify Origin/Referer headers
- [ ] Custom header requirement for AJAX

### CORS Configuration
```javascript
Allowed Origins:
- https://zemo.zm
- https://www.zemo.zm
- https://app.zemo.zm (if applicable)

Allowed Methods: GET, POST, PUT, DELETE
Allowed Headers: Content-Type, Authorization
Credentials: true
Max Age: 86400
```

## 🗄️ Database Security

### Connection Security
- [x] SSL/TLS for database connections
- [x] Strong database password (32+ characters)
- [ ] IP whitelist for database access
- [ ] Separate database users per environment
- [ ] Read-only user for reporting queries

### Query Security
- [x] Parameterized queries (Prisma)
- [x] No raw SQL queries (or properly escaped)
- [ ] Query timeout limits
- [ ] Connection pooling configured
- [ ] Prepared statements for all queries

### Data Protection
- [ ] Encryption at rest (database level)
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Sensitive data encrypted (SSN, payment info)
- [ ] PII data minimization
- [ ] Soft deletes for user data (GDPR compliance)

### Backup Security
- [ ] Automated daily backups
- [ ] Encrypted backup storage
- [ ] Off-site backup location
- [ ] Backup restoration tested monthly
- [ ] Backup retention policy (30 days)

## 🔒 Data Protection

### Sensitive Data Handling
```javascript
Encrypted Fields:
- Payment information (tokenized)
- Driver's license numbers
- National ID numbers
- Bank account details
- Social security numbers

Hashed Fields:
- Passwords (bcrypt)
- Security questions
- API keys (one-way hash)

Never Log:
- Passwords
- Payment card numbers
- Security tokens
- Session IDs
```

### PII Protection
- [ ] Data classification policy
- [ ] Minimal data collection
- [ ] Purpose limitation
- [ ] Data retention policy
- [ ] Right to erasure implementation
- [ ] Data portability feature
- [ ] Privacy policy updated

### Payment Security
- [x] PCI DSS compliance (via Stripe/Flutterwave)
- [x] Never store card numbers
- [x] Payment tokenization
- [ ] 3D Secure authentication
- [ ] Fraud detection integration
- [ ] Transaction monitoring
- [ ] Suspicious activity alerts

## 🌐 Network Security

### HTTPS Configuration
- [ ] TLS 1.3 or 1.2 minimum
- [ ] Strong cipher suites only
- [ ] HSTS header (max-age=31536000)
- [ ] Certificate auto-renewal
- [ ] Redirect HTTP to HTTPS
- [ ] TLS certificate from trusted CA

### Security Headers
```javascript
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
Content-Security-Policy: [detailed CSP]
```

### DNS Security
- [ ] DNSSEC enabled
- [ ] CAA records configured
- [ ] SPF record for email
- [ ] DKIM configured
- [ ] DMARC policy set

## 📁 File Upload Security

### Validation
- [x] File type whitelist (.jpg, .png, .pdf)
- [ ] Magic number validation (not just extension)
- [ ] Maximum file size (10MB per file)
- [ ] Virus scanning (ClamAV or cloud service)
- [ ] Image validation (not SVG with scripts)
- [ ] Filename sanitization

### Storage
- [x] Store files outside web root
- [ ] Generate random filenames
- [ ] Separate storage per user
- [ ] CDN for serving files
- [ ] Signed URLs for private files
- [ ] Content-Disposition: attachment header

### Processing
- [ ] Image resizing and optimization
- [ ] EXIF data stripping
- [ ] PDF flattening (remove scripts)
- [ ] Async processing queue
- [ ] Malware scanning before serving

## 🔍 Monitoring & Logging

### Logging Strategy
```javascript
Log Levels:
- ERROR: Application errors, exceptions
- WARN: Deprecated features, potential issues
- INFO: Important events (login, booking)
- DEBUG: Detailed diagnostics (dev only)

Never Log:
- Passwords
- Session tokens
- Credit card numbers
- API keys
- PII without anonymization
```

### Security Monitoring
- [ ] Failed login attempts tracking
- [ ] Suspicious IP monitoring
- [ ] Unusual booking patterns
- [ ] Multiple payment failures
- [ ] Account enumeration attempts
- [ ] Rate limit violations
- [ ] Admin action audit log

### Alert Configuration
```javascript
Immediate Alerts:
- Failed deployment
- Database connection loss
- Payment gateway errors
- Multiple failed logins (same IP)
- Suspicious file uploads
- Critical errors (500s)

Daily Digest:
- New user signups
- Total bookings
- Revenue summary
- Error rate trends
```

### Audit Trail
- [ ] Log all admin actions
- [ ] Log permission changes
- [ ] Log data access (PII)
- [ ] Log payment transactions
- [ ] Log booking modifications
- [ ] Immutable audit logs
- [ ] 90-day retention minimum

## 🚨 Incident Response

### Detection
- [ ] Real-time error monitoring (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Security scanning (Snyk)
- [ ] Log aggregation (ELK or cloud)

### Response Plan
1. **Identify**: Detect and classify incident
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Review**: Post-incident analysis

### Breach Notification
- [ ] User notification plan (24-72 hours)
- [ ] Regulatory notification plan
- [ ] Public disclosure template
- [ ] Legal counsel contact
- [ ] PR crisis management plan

## 🧪 Security Testing

### Automated Testing
- [ ] OWASP ZAP integration
- [ ] Snyk vulnerability scanning
- [ ] Dependabot for dependencies
- [ ] SonarQube code analysis
- [ ] npm audit in CI/CD
- [ ] Lighthouse security audit

### Manual Testing
- [ ] Penetration testing (annually)
- [ ] Security code review
- [ ] Third-party audit (pre-launch)
- [ ] Social engineering tests
- [ ] Physical security audit

### Vulnerability Management
- [ ] CVE monitoring
- [ ] Patch management process
- [ ] Security advisory subscriptions
- [ ] Emergency patch procedure
- [ ] Vulnerability disclosure policy

## 👥 User Privacy

### Data Collection
- [ ] Privacy policy published
- [ ] Cookie consent banner
- [ ] Opt-in for marketing emails
- [ ] Data collection transparency
- [ ] Third-party data sharing disclosure

### User Rights
- [ ] Data access request handling
- [ ] Data deletion request handling
- [ ] Data portability feature
- [ ] Opt-out mechanisms
- [ ] Privacy settings page

### GDPR Compliance
- [ ] Legal basis for processing
- [ ] Data protection officer assigned
- [ ] Privacy by design
- [ ] Data processing agreements
- [ ] International data transfer safeguards

## 🔧 Infrastructure Security

### Server Hardening
- [ ] Minimal software installed
- [ ] Automatic security updates
- [ ] Firewall configured
- [ ] Unused ports closed
- [ ] SSH key authentication only
- [ ] Fail2ban for brute force protection

### Container Security (if using Docker)
- [ ] Non-root user in containers
- [ ] Minimal base images (Alpine)
- [ ] Image vulnerability scanning
- [ ] Secrets management (not in images)
- [ ] Container resource limits
- [ ] Network segmentation

### Cloud Security (AWS/Vercel)
- [ ] IAM least privilege
- [ ] MFA for admin accounts
- [ ] VPC configuration
- [ ] Security groups properly configured
- [ ] S3 bucket policies (no public access)
- [ ] CloudTrail enabled

## 📱 Mobile/PWA Security

### App Security
- [ ] Code obfuscation
- [ ] Certificate pinning
- [ ] Secure storage for tokens
- [ ] Biometric authentication
- [ ] App transport security

### API Security
- [ ] API key rotation
- [ ] JWT token expiration (15 min)
- [ ] Refresh token rotation
- [ ] Device fingerprinting
- [ ] Jailbreak/root detection

## 🎓 Team Security

### Training
- [ ] Security awareness training (quarterly)
- [ ] Phishing simulation tests
- [ ] Secure coding practices
- [ ] OWASP Top 10 training
- [ ] Data handling procedures

### Access Control
- [ ] Role-based access control (RBAC)
- [ ] Least privilege principle
- [ ] Admin account audit (quarterly)
- [ ] Access review (monthly)
- [ ] Offboarding checklist

### Development Security
- [ ] Secret management (not in git)
- [ ] Code review requirements
- [ ] Branch protection rules
- [ ] Signed commits
- [ ] Security champion program

## 📋 Compliance Checklist

### Legal Requirements
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] Acceptable Use Policy
- [ ] Data Processing Agreement
- [ ] Insurance certificates

### Industry Standards
- [ ] PCI DSS (if handling cards directly)
- [ ] ISO 27001 consideration
- [ ] SOC 2 consideration (future)
- [ ] WCAG 2.1 AA accessibility
- [ ] Local regulations compliance (Zambia)

## 🔄 Regular Security Tasks

### Daily
- [ ] Review error logs
- [ ] Check failed login attempts
- [ ] Monitor payment anomalies

### Weekly
- [ ] Review security alerts
- [ ] Update dependencies
- [ ] Check backup status
- [ ] Review user reports

### Monthly
- [ ] Access control audit
- [ ] Security patch updates
- [ ] Incident review
- [ ] Metrics analysis

### Quarterly
- [ ] Security training
- [ ] Penetration testing
- [ ] Policy review
- [ ] Disaster recovery test

### Annually
- [ ] Third-party security audit
- [ ] Insurance review
- [ ] Legal compliance review
- [ ] Business continuity test

---

## ✅ Pre-Launch Security Verification

**Critical (Must Fix):**
- [ ] All passwords hashed
- [ ] HTTPS enabled
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] CSRF protected
- [ ] Authentication working
- [ ] Authorization working
- [ ] Payment security verified
- [ ] Sensitive data encrypted
- [ ] Security headers configured

**High Priority (Should Fix):**
- [ ] Rate limiting implemented
- [ ] File upload security
- [ ] Logging configured
- [ ] Monitoring enabled
- [ ] Backup automated
- [ ] Incident response plan

**Medium Priority (Nice to Have):**
- [ ] 2FA implementation
- [ ] Advanced fraud detection
- [ ] Security scanning automated
- [ ] Penetration testing completed

---

**🔒 Security is an ongoing process, not a one-time task!**
