# ZEMO Platform - Disaster Recovery Runbook
**Emergency Procedures for Critical Incidents**

---

## 🚨 Emergency Contact List

| Role                  | Name          | Phone            | Email                |
|-----------------------|---------------|------------------|----------------------|
| Technical Lead        | TBD           | +260 XXX XXX XXX | tech@zemo.zm         |
| DevOps Lead           | TBD           | +260 XXX XXX XXX | devops@zemo.zm       |
| Database Admin        | TBD           | +260 XXX XXX XXX | dba@zemo.zm          |
| Product Manager       | TBD           | +260 XXX XXX XXX | pm@zemo.zm           |
| Vercel Support        | N/A           | N/A              | support@vercel.com   |
| Database Provider     | TBD           | TBD              | TBD                  |

**Emergency Escalation:** If no response within 15 minutes, escalate to next contact.

---

## 📊 Incident Severity Levels

### Severity 1 (Critical) - 15 min response time
- Complete platform outage
- Data loss or corruption
- Security breach
- Payment processing failure affecting all transactions

### Severity 2 (High) - 1 hour response time
- Partial service outage (1+ critical features down)
- Performance degradation (>50% slower)
- Single payment provider failure
- Database connection issues

### Severity 3 (Medium) - 4 hours response time
- Minor feature unavailable
- Isolated user reports
- Non-critical bug
- Performance issues (<50% impact)

### Severity 4 (Low) - Next business day
- Cosmetic issues
- Enhancement requests
- Documentation updates

---

## 🔥 Critical Incident Response Procedures

### Incident Response Workflow

```
1. DETECT → 2. ASSESS → 3. RESPOND → 4. COMMUNICATE → 5. RESOLVE → 6. POST-MORTEM
```

---

## 📋 Scenario 1: Complete Platform Outage

**Symptoms:**
- Health check endpoint returns 503
- Users cannot access website
- All API requests failing

**Immediate Actions (0-5 minutes):**

1. **Verify the Outage**
   ```bash
   # Check health endpoint
   curl https://zemo.zm/api/health
   
   # Check Vercel status
   curl https://api.vercel.com/v1/deployments
   ```

2. **Activate Incident Response**
   - Post in #incidents Slack channel: "P1 INCIDENT: Platform outage detected"
   - Start incident timer
   - Assign incident commander

3. **Enable Maintenance Mode**
   ```bash
   # Option 1: Via Vercel
   vercel env add MAINTENANCE_MODE true production
   
   # Option 2: Deploy maintenance page
   git checkout main
   touch public/MAINTENANCE_MODE
   git add public/MAINTENANCE_MODE
   git commit -m "Emergency: Enable maintenance mode"
   git push origin main
   ```

**Diagnosis (5-15 minutes):**

4. **Check Vercel Deployment Status**
   ```bash
   vercel ls zemo --prod
   vercel logs --prod
   ```

5. **Check Database Connectivity**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT 1;"
   
   # Check active connections
   psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
   ```

6. **Check Error Logs**
   - Open Sentry dashboard
   - Filter errors in last 15 minutes
   - Identify error patterns

**Resolution:**

7. **If Deployment Issue:**
   ```bash
   # Rollback to last known good deployment
   vercel rollback <previous-deployment-id> --prod
   ```

8. **If Database Issue:**
   ```bash
   # Restart database connections
   vercel env rm DATABASE_URL production
   vercel env add DATABASE_URL <connection-string> production
   
   # Force redeploy
   vercel --prod --force
   ```

9. **If Infrastructure Issue:**
   - Contact Vercel support immediately
   - Provide deployment ID and error logs
   - Monitor Vercel status page

**Recovery Verification:**

10. **Smoke Tests**
    ```bash
    # Test critical flows
    curl https://zemo.zm
    curl https://zemo.zm/api/health
    curl https://zemo.zm/api/vehicles/search
    ```

11. **Disable Maintenance Mode**
    ```bash
    vercel env rm MAINTENANCE_MODE production
    rm public/MAINTENANCE_MODE
    git push origin main
    ```

12. **Monitor for 30 minutes**
    - Watch error rates in Sentry
    - Monitor response times
    - Check user traffic patterns

---

## 📋 Scenario 2: Database Failure / Data Corruption

**Symptoms:**
- Database connection errors
- Data integrity issues
- Prisma client errors

**Immediate Actions:**

1. **Stop All Write Operations**
   ```bash
   # Enable read-only mode
   vercel env add READ_ONLY_MODE true production
   ```

2. **Assess Damage**
   ```bash
   # Check database status
   psql $DATABASE_URL -c "SELECT pg_database_size('zemo_production');"
   
   # Verify table counts
   psql $DATABASE_URL -c "SELECT tablename, n_live_tup FROM pg_stat_user_tables;"
   ```

3. **If Data Loss Detected:**

   **Restore from Backup:**
   ```bash
   # List available backups
   aws s3 ls s3://zemo-backups/production/ --recursive
   
   # Download latest backup
   aws s3 cp s3://zemo-backups/production/latest.dump /tmp/
   
   # CRITICAL: Create safety backup of current state
   pg_dump -Fc -d $DATABASE_URL > /tmp/pre-restore-backup.dump
   
   # Restore database
   pg_restore -d $DATABASE_URL -Fc -c /tmp/latest.dump
   
   # Verify restoration
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Booking\";"
   ```

4. **If Data Corruption Detected:**

   ```bash
   # Run data integrity checks
   psql $DATABASE_URL -c "SELECT * FROM \"Booking\" WHERE \"startDate\" > \"endDate\";"
   
   # Fix corrupted records (example)
   psql $DATABASE_URL -c "UPDATE \"Booking\" SET \"status\" = 'CANCELLED' WHERE \"startDate\" > \"endDate\";"
   ```

5. **Re-enable Write Operations**
   ```bash
   vercel env rm READ_ONLY_MODE production
   vercel --prod --force
   ```

---

## 📋 Scenario 3: Payment Processing Failure

**Symptoms:**
- Payment webhook failures
- Transaction errors
- User reports of payment issues

**Immediate Actions:**

1. **Identify Affected Provider**
   ```bash
   # Check recent payment errors
   curl -X GET https://zemo.zm/api/admin/payments \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     | jq '.payments[] | select(.status == "FAILED")'
   ```

2. **Check Provider Status**
   - Stripe: https://status.stripe.com
   - MTN MoMo: Contact MTN support
   - Airtel Money: Contact Airtel support

3. **If Provider is Down:**
   
   **Temporary Mitigation:**
   ```typescript
   // Disable failed provider temporarily
   // Update src/lib/payments/index.ts
   
   const DISABLED_PROVIDERS = ['STRIPE']; // Add failed provider
   
   export function getAvailableProviders() {
     return ALL_PROVIDERS.filter(p => !DISABLED_PROVIDERS.includes(p));
   }
   ```

4. **Communicate to Users**
   ```typescript
   // Add banner to payment page
   {failedProvider === 'STRIPE' && (
     <Alert variant="warning">
       Stripe payments temporarily unavailable. 
       Please use MTN MoMo or Airtel Money.
     </Alert>
   )}
   ```

5. **If Webhook Issue:**
   
   ```bash
   # Verify webhook endpoint is accessible
   curl -X POST https://zemo.zm/api/payments/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   
   # Re-register webhook with provider
   # Stripe example:
   stripe webhooks create \
     --url https://zemo.zm/api/payments/webhooks/stripe \
     --events payment_intent.succeeded,payment_intent.payment_failed
   ```

6. **Manual Payment Reconciliation**
   ```bash
   # Run reconciliation script
   node scripts/reconcile-payments.js --date $(date +%Y-%m-%d)
   ```

---

## 📋 Scenario 4: Security Breach

**Symptoms:**
- Unusual API activity
- Unauthorized admin access
- Data exfiltration alerts
- User reports of compromised accounts

**CRITICAL - Immediate Actions:**

1. **Isolate the Breach (within 5 minutes)**
   ```bash
   # Rotate all secrets immediately
   vercel env rm JWT_SECRET production
   vercel env add JWT_SECRET $(openssl rand -hex 64) production
   
   # Force logout all users
   vercel env add FORCE_LOGOUT true production
   vercel --prod --force
   ```

2. **Identify Attack Vector**
   - Check Sentry for suspicious errors
   - Review recent API logs
   - Check database for unauthorized modifications
   - Review admin access logs

3. **Contain the Damage**
   ```bash
   # Enable read-only mode
   vercel env add READ_ONLY_MODE true production
   
   # Disable affected user accounts
   psql $DATABASE_URL -c "UPDATE \"User\" SET \"isActive\" = false WHERE id IN (...);"
   ```

4. **Collect Evidence**
   ```bash
   # Export logs for forensics
   vercel logs --prod --output logs-$(date +%Y%m%d).txt
   
   # Snapshot database state
   pg_dump -Fc -d $DATABASE_URL > breach-snapshot-$(date +%Y%m%d).dump
   ```

5. **Notify Stakeholders**
   - Inform legal team
   - Prepare user notification
   - Contact relevant authorities if required
   - Document timeline of events

6. **Patch Vulnerability**
   - Deploy security fix
   - Run security audit
   - Verify fix effectiveness

7. **Recovery**
   ```bash
   # Re-enable normal operations
   vercel env rm READ_ONLY_MODE production
   vercel env rm FORCE_LOGOUT production
   
   # Notify users to change passwords
   # Conduct post-incident review
   ```

---

## 📋 Scenario 5: DDoS Attack

**Symptoms:**
- Sudden traffic spike
- Legitimate users cannot access site
- Rate limiting not effective

**Immediate Actions:**

1. **Verify DDoS vs. Legitimate Traffic**
   ```bash
   # Check traffic patterns in Vercel analytics
   vercel logs --prod | grep -E "GET|POST" | awk '{print $1}' | sort | uniq -c | sort -rn | head -20
   ```

2. **Enable Cloudflare DDoS Protection** (if configured)
   - Login to Cloudflare dashboard
   - Enable "I'm Under Attack" mode
   - Configure rate limiting rules

3. **Increase Rate Limiting**
   ```typescript
   // Temporarily reduce rate limits
   const limiter = rateLimit({
     interval: 60 * 1000,
     uniqueTokenPerInterval: 100, // Reduce from 500
   });
   
   // Lower threshold
   await limiter.check(5, ip); // Reduce from 10
   ```

4. **Block Malicious IPs**
   ```bash
   # Add to vercel.json
   {
     "firewall": {
       "rules": [
         {
           "action": "deny",
           "ips": ["1.2.3.4", "5.6.7.8"]
         }
       ]
     }
   }
   ```

5. **Contact Vercel Support**
   - Provide evidence of DDoS
   - Request enterprise-level protection
   - Get traffic analysis

---

## 📋 Post-Incident Procedures

After every critical incident:

### 1. Immediate Post-Incident (within 1 hour)

- [ ] Verify full service restoration
- [ ] Document timeline of events
- [ ] Identify root cause
- [ ] Assess impact (users affected, data lost, downtime)

### 2. Post-Mortem Report (within 24 hours)

Create document with:
- **Incident Summary**: What happened
- **Timeline**: Detailed chronology
- **Root Cause**: Why it happened
- **Impact Analysis**: Who/what was affected
- **Resolution**: How it was fixed
- **Prevention**: How to prevent recurrence

### 3. Action Items (within 1 week)

- [ ] Implement preventive measures
- [ ] Update runbooks
- [ ] Add monitoring for similar issues
- [ ] Conduct team debrief
- [ ] Update documentation

### 4. Follow-up (within 1 month)

- [ ] Verify preventive measures effective
- [ ] Update disaster recovery plan
- [ ] Conduct drill for similar scenario
- [ ] Share lessons learned with team

---

## 🧪 Disaster Recovery Drills

**Schedule:** Quarterly

**Drill Scenarios:**
1. Database restoration from backup
2. Application rollback
3. Payment provider failover
4. Security incident response

**Participants:** Full technical team

**Success Criteria:**
- Complete drill within defined RTO (Recovery Time Objective)
- Zero data loss (meet RPO - Recovery Point Objective)
- All stakeholders notified appropriately
- Documentation updated based on learnings

---

## 📊 Recovery Objectives

| Scenario                   | RTO (Recovery Time) | RPO (Data Loss)  |
|---------------------------|---------------------|------------------|
| Application Outage         | 30 minutes          | 0 (no data loss) |
| Database Failure           | 2 hours             | 1 hour           |
| Complete Infrastructure    | 4 hours             | 24 hours         |
| Payment System Failure     | 1 hour              | 0 (no data loss) |
| Security Breach            | Immediate           | TBD              |

---

## 📞 External Support Contacts

**Vercel Support:**
- Portal: https://vercel.com/support
- Email: support@vercel.com
- Enterprise: (provide dedicated contact)

**Database Provider:**
- TBD based on chosen provider

**Cloudflare Support:**
- Portal: https://dash.cloudflare.com
- Emergency: (enterprise plan)

**Payment Providers:**
- Stripe: https://support.stripe.com
- MTN MoMo: +260 XXX XXX XXX
- Airtel Money: +260 XXX XXX XXX

---

**Last Updated:** November 12, 2025  
**Next Review:** February 12, 2026  
**Maintained By:** ZEMO DevOps Team
