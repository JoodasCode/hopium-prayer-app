# Lopi App Security Guide

## 🔒 Database Security Model

### Why Database URLs Are Visible (And That's OK)

**The Supabase URL and anon key being visible in the browser console is NORMAL and EXPECTED.** Here's why:

1. **Client-Side Architecture**: Lopi is a client-side app that connects directly to Supabase
2. **Public by Design**: The `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are designed to be public
3. **Security Through RLS**: Protection comes from Row Level Security policies, not hidden URLs

### 🛡️ How Your Data is Protected

#### Row Level Security (RLS) Policies
- **User Isolation**: Users can only access their own data
- **Authentication Required**: All database access requires valid authentication
- **Fine-Grained Control**: Each table has specific access rules

#### Current RLS Policies:
```sql
-- Users can only see their own data
CREATE POLICY "Users can view and update their own data" 
ON public.users FOR ALL 
USING (auth.uid() = id);

-- Prayer records are user-specific
CREATE POLICY "Users can manage their own prayer records" 
ON public.prayer_records FOR ALL 
USING (auth.uid() = user_id);

-- Stats are private to each user
CREATE POLICY "Users can view their own stats" 
ON public.user_stats FOR ALL 
USING (auth.uid() = user_id);
```

## 🚨 Security Threats & Mitigations

### ✅ Protected Against:
- **Data Leakage**: RLS ensures users can't access other users' data
- **Unauthorized Access**: Authentication required for all operations
- **SQL Injection**: Supabase handles parameterized queries
- **Cross-Site Attacks**: Security headers implemented

### ⚠️ Potential Vulnerabilities:

#### 1. Service Role Key Exposure
**Risk**: If service role key is exposed, it bypasses RLS
**Mitigation**: 
- Keep service role key server-side only
- Never use in client-side code
- Rotate regularly

#### 2. API Rate Limiting
**Risk**: Abuse of public endpoints
**Mitigation**:
- Implement rate limiting (configured)
- Monitor usage patterns
- Set up alerts for unusual activity

#### 3. Domain Restrictions
**Risk**: Unauthorized domains using your Supabase project
**Mitigation**: Configure domain restrictions in Supabase dashboard

## 🔧 Security Configuration

### Environment Variables

#### Public (Browser-Exposed)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
- ✅ Safe to expose
- Required for client-side operations
- Protected by RLS policies

#### Private (Server-Only)
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```
- ❌ NEVER expose to client
- Use only in API routes
- Store securely in deployment platform

### Production Security Checklist

#### Supabase Dashboard Settings:
- [ ] Enable domain restrictions
- [ ] Configure CORS settings
- [ ] Set up monitoring and alerts
- [ ] Review and test all RLS policies
- [ ] Enable audit logging

#### Application Security:
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Use HTTPS everywhere
- [ ] Validate all user inputs
- [ ] Implement proper error handling

#### Deployment Security:
- [ ] Use secure environment variable storage
- [ ] Enable automatic security updates
- [ ] Set up monitoring and logging
- [ ] Configure backup and recovery
- [ ] Document incident response procedures

## 🔍 Testing Security

### RLS Policy Testing
```sql
-- Test as different users to ensure isolation
SELECT * FROM prayer_records; -- Should only return current user's data
```

### Authentication Testing
- Test with expired tokens
- Test with invalid tokens
- Test without authentication

### Rate Limiting Testing
- Simulate rapid API calls
- Test with different IP addresses
- Monitor for proper throttling

## 🚀 Production Deployment Security

### Domain Configuration
1. Go to Supabase Dashboard → Settings → API
2. Add your production domain to "Site URL"
3. Configure redirect URLs for authentication

### Monitoring Setup
1. Enable Supabase audit logs
2. Set up alerts for:
   - Unusual query patterns
   - Failed authentication attempts
   - High API usage
   - Error rate spikes

### Regular Security Maintenance
- [ ] Monthly RLS policy review
- [ ] Quarterly credential rotation
- [ ] Regular security dependency updates
- [ ] Periodic penetration testing

## 📞 Security Incident Response

### If You Suspect a Breach:
1. **Immediate**: Rotate all credentials
2. **Assess**: Check audit logs for suspicious activity
3. **Contain**: Temporarily restrict access if needed
4. **Investigate**: Identify the attack vector
5. **Recover**: Restore secure state
6. **Learn**: Update security measures

### Emergency Contacts:
- Supabase Support: [support@supabase.io]
- Security Team: [Your team contact]

## 📚 Additional Resources

- [Supabase Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

**Remember**: The visibility of database URLs in the console is normal for client-side Supabase apps. Security comes from proper authentication and RLS policies, not from hiding URLs. 